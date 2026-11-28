/**************** RSVP CONFIG ****************/
const RSVP_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwF49QYSMh9fCLeTUF9M-C5WL3qV7vc83DT4BYzBH91n1JdiN15HMkS95lX5GnuzLkn/exec";

const $ = (s) => document.querySelector(s);

function getEventId() {
  return window.config?.event?.defaultEventId || "vivianmaykol2026";
}

function getRemoteGuestId(guestId) {
  return `${getEventId()}_${String(guestId || "")}`;
}

function showMsg(el, text, type = "ok") {
  if (!el) return;
  el.textContent = text;
  el.className = `rsvp-msg ${type}`;
  el.style.display = "block";
}

function hideMsg(el) {
  if (!el) return;
  el.style.display = "none";
  el.textContent = "";
}

function sendRSVPToWhatsApp(invitado, nombre, respuesta, pases) {
  const respuestaTexto = respuesta === "SI" ? "Sí asistiré" : "No podremos asistir";
  const message = [
    `Hola, queremos confirmar nuestra asistencia a la Primera Comunión de Carmen Inés y Juan Ignacio.`,
    "",
    nombre,
    `Lugares confirmados: ${pases}`,
    `Respuesta: ${respuestaTexto}`,
  ].join("\n");
  const url = `https://wa.me/50240069313?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function apiCheck(id) {
  const url = `${RSVP_ENDPOINT}?guestId=${encodeURIComponent(id)}&t=${Date.now()}`;
  const r = await fetch(url, { cache: "no-store" });
  const text = await r.text();

  try {
    const j = JSON.parse(text);
    return j.alreadyConfirmed === true || j.alreadyConfirmed === "true" || j.alreadyConfirmed === 1;
  } catch {
    console.warn("apiCheck no devolvió JSON. Respuesta:", text.slice(0, 200));
    return false;
  }
}

async function apiSend(data) {
  const body = new URLSearchParams(data).toString();

  const r = await fetch(RSVP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
  });

  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    console.warn("apiSend no devolvió JSON. Respuesta:", text.slice(0, 200));
    return { ok: false, raw: text };
  }
}

async function saveConfirmationToFirebase(invitado, respuesta, pasesSeleccionados) {
  const rsvpDB = window.RSVPDatabase;
  if (!rsvpDB?.saveConfirmation || !invitado?.id) return;

  try {
    await rsvpDB.saveConfirmation(getEventId(), {
      id: String(invitado.id),
      nombre: invitado.nombre,
      pasesAsignados: Math.max(1, Number(invitado.pases || 1)),
      respuesta: String(respuesta || "").toLowerCase(),
      cantidadConfirmada: respuesta === "SI" ? pasesSeleccionados : 0,
      fechaConfirmacion: Date.now(),
    });
  } catch (error) {
    console.warn("No se pudo guardar la confirmación en Firebase:", error);
  }
}

function clearStoredConfirmations() {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("rsvp_confirmed_")) localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn("No se pudo limpiar la memoria local de RSVP:", error);
  }
}

function getGuestFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return null;

  if (window.currentGuest && String(window.currentGuest.id) === String(id)) {
    return {
      id: String(window.currentGuest.id),
      nombre: window.currentGuest.name || "Invitado",
      pases: Number(window.currentGuest.passes || 1),
    };
  }

  const nameEl = document.getElementById("guestCardName");
  const seatsEl = document.getElementById("guestCardSeats");
  const nombre = (nameEl?.textContent || "Invitado").trim() || "Invitado";
  const m = (seatsEl?.textContent || "").match(/\d+/);
  const pases = m ? parseInt(m[0], 10) : 1;

  return { id, nombre, pases };
}

function markConfirmedUI(message) {
  const form = $("#rsvp-form");
  const btn = $("#btnConfirmarRsvp");
  const msg = $("#msgRsvp");
  const note = document.querySelector(".rsvp-editorial-note");
  const copy = $("#rsvpCopy");
  if (form) form.classList.add("is-confirmed");
  if (note) note.style.display = "none";
  if (copy) copy.style.display = "none";
  document.querySelectorAll('#rsvp-form input, #rsvp-form select, #rsvp-form button').forEach((el) => {
    if (!el.hasAttribute("readonly")) el.disabled = true;
  });

  if (btn) {
    btn.textContent = "Confirmación enviada ✓";
    btn.classList.add("rsvp-confirmed");
  }

  if (msg) {
    msg.style.display = "block";
    msg.className = "rsvp-msg ok";
    msg.textContent = message || "Gracias por confirmar tu asistencia. Nos alegra mucho compartir este día tan especial contigo.";
  }
}

function resetConfirmUI() {
  const form = $("#rsvp-form");
  const btn = $("#btnConfirmarRsvp");
  const msg = $("#msgRsvp");
  const note = document.querySelector(".rsvp-editorial-note");
  const copy = $("#rsvpCopy");

  if (form) form.classList.remove("is-confirmed");
  if (note) note.style.display = "";
  if (copy) copy.style.display = "";
  radioYes?.removeAttribute("checked");
  radioYes && (radioYes.checked = false);
  $("#rsvp-response-no") && ($( "#rsvp-response-no").checked = false);
  document.querySelectorAll('#rsvp-form input, #rsvp-form select, #rsvp-form button').forEach((el) => {
    if (!el.hasAttribute("readonly")) el.disabled = false;
  });

  if (btn) {
    btn.textContent = "Confirmar asistencia";
    btn.classList.remove("rsvp-confirmed");
  }

  hideMsg(msg);
}

document.addEventListener("DOMContentLoaded", () => {
  clearStoredConfirmations();

  const form = $("#rsvp-form");
  const inputNombre = $("#rsvp-name");
  const guestCountWrapper = $("#guest-count-wrapper");
  const reservedSeats = $("#reservedSeats");
  const btnSubmit = $("#btnConfirmarRsvp");
  const radioYes = $("#rsvp-response-yes");
  const msg = $("#msgRsvp");
  const popupBackdrop = $("#rsvpPopupBackdrop");
  const popupName = $("#rsvp-popup-name");
  const popupCount = $("#rsvp-popup-count");
  let popupResponse = null;

  if (!form || !inputNombre || !guestCountWrapper || !radioYes || !msg) return;

  let invitado = getGuestFromURL();

  function paintGuestData() {
    invitado = getGuestFromURL();

    if (!invitado) {
      inputNombre.value = "Nombre del invitado";
      if (reservedSeats) reservedSeats.textContent = "1 lugar";
      return;
    }

    inputNombre.value = invitado.nombre;

    const maxPasses = Math.max(1, Number(invitado.pases || 1));
    if (reservedSeats) reservedSeats.textContent = `${maxPasses} ${maxPasses === 1 ? "lugar" : "lugares"}`;
  }

  function toggleGuestCount() {
    guestCountWrapper.style.display = "grid";
  }

  function openPopup() {
    if (form.classList.contains("is-confirmed")) return;
    const maxPasses = Math.max(1, Number(invitado?.pases || 1));
    const german = document.body.classList.contains("language-german");
    popupCount.innerHTML = Array.from({ length: maxPasses }, (_, index) => {
      const count = index + 1;
      const label = german ? (count === 1 ? "Platz" : "Plätze") : (count === 1 ? "lugar" : "lugares");
      return `<option value="${count}">${count} ${label}</option>`;
    }).join("");
    popupName.value = invitado?.nombre || "";
    popupResponse = null;
    popupBackdrop.hidden = false;
    popupName.focus();
  }

  function closePopup() {
    popupBackdrop.hidden = true;
  }

  paintGuestData();
  toggleGuestCount();
  hideMsg(msg);

  window.addEventListener("guest:updated", paintGuestData);
  radioYes.addEventListener("change", toggleGuestCount);
  const confirmOption = document.querySelector('.rsvp-radio-option[for="rsvp-response-yes"]');
  confirmOption?.addEventListener("click", (event) => {
    event.preventDefault();
    openPopup();
  });
  $("#rsvp-popup-yes")?.addEventListener("click", () => {
    if (!popupName.value.trim()) {
      popupName.focus();
      return;
    }
    popupResponse = "SI";
    radioYes.checked = true;
    inputNombre.value = popupName.value.trim();
    closePopup();
    form.requestSubmit();
  });
  $("#rsvp-popup-no")?.addEventListener("click", () => {
    if (!popupName.value.trim()) {
      popupName.focus();
      return;
    }
    popupResponse = "NO";
    $("#rsvp-response-no").checked = true;
    inputNombre.value = popupName.value.trim();
    closePopup();
    form.requestSubmit();
  });
  popupBackdrop?.addEventListener("click", (event) => {
    if (event.target === popupBackdrop) closePopup();
  });

  (async () => {
    if (!invitado) return;
    try {
      const ya = await apiCheck(getRemoteGuestId(invitado.id));
      if (ya) {
        markConfirmedUI();
      } else {
        resetConfirmUI();
      }
    } catch (error) {
      console.warn("apiCheck inicial falló:", error);
      resetConfirmUI();
    }
  })();

  async function syncFirebaseConfirmation() {
    if (!invitado || !window.RSVPDatabase?.getConfirmationByGuestId) return;
    try {
      const confirmation = await window.RSVPDatabase.getConfirmationByGuestId(getEventId(), invitado.id);
      if (confirmation) {
        markConfirmedUI();
      } else if (form.classList.contains("is-confirmed")) {
        popupResponse = null;
        resetConfirmUI();
      }
    } catch (error) {
      console.warn("No se pudo sincronizar el estado RSVP:", error);
    }
  }

  setInterval(syncFirebaseConfirmation, 3000);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMsg(msg);
    invitado = getGuestFromURL();

    if (!invitado) {
      showMsg(msg, "No se encontró el invitado en la URL. Usa ?id=1.", "error");
      return;
    }

    try {
      const firebaseConfirmation = await window.RSVPDatabase?.getConfirmationByGuestId?.(getEventId(), invitado.id);
      if (firebaseConfirmation || await apiCheck(getRemoteGuestId(invitado.id))) {
        markConfirmedUI("Esta invitación ya tiene una respuesta registrada. Muchas gracias.");
        return;
      }
    } catch (error) {
      console.warn("No se pudo verificar la confirmación existente:", error);
    }

    const selectedResponse = popupResponse || (radioYes.checked ? "SI" : $("#rsvp-response-no")?.checked ? "NO" : null);
    if (!selectedResponse) {
      showMsg(msg, "Selecciona si asistirás o no para continuar.", "error");
      return;
    }

    const respuesta = selectedResponse;
    const pasesSeleccionados = respuesta === "SI"
      ? Math.max(1, Number(popupCount.value || invitado.pases || 1))
      : 0;

    if (btnSubmit) btnSubmit.disabled = true;

    try {
      const res = await apiSend({
        guestId: getRemoteGuestId(invitado.id),
        nombre: inputNombre.value.trim() || invitado.nombre,
        pases: String(pasesSeleccionados),
        respuesta,
      });

      if (res && (res.ok === true || res.success === true)) {
        await saveConfirmationToFirebase(invitado, respuesta, pasesSeleccionados);
        sendRSVPToWhatsApp(invitado, inputNombre.value.trim() || invitado.nombre, respuesta, pasesSeleccionados);
        const okMessage = respuesta === "SI"
          ? "Gracias por confirmar tu asistencia. Nos alegra mucho compartir este día tan especial contigo."
          : "Lamentamos que no puedas acompañarnos. Te tendremos presente y esperamos verte en otra ocasión.";
        markConfirmedUI(okMessage);
        return;
      }

      console.warn("Respuesta del endpoint:", res);
      if (btnSubmit) btnSubmit.disabled = false;
      showMsg(msg, "No se pudo guardar tu respuesta. Intenta de nuevo.", "error");
    } catch (error) {
      console.error("apiSend:", error);
      if (btnSubmit) btnSubmit.disabled = false;
      showMsg(msg, "Error de conexión al enviar tu respuesta.", "error");
    }
  });
});
