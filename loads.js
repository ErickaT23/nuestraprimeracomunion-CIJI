// ===================== LOADS.JS =====================
// 1) Lista de invitados (ejemplo)
const guests = [
  { id: "1", name: "Familia 1", passes: 4 },
  { id: "2", name: "Invitado 2", passes: 2 },
  { id: "3", name: "Invitado 3", passes: 1 },
  { id: "4", name: "Invitado 4", passes: 2 },
  { id: "5", name: "Invitado 5", passes: 5 },
];

window.LocalGuestSeeds = {
  ...(window.LocalGuestSeeds || {}),
  "primera-comunion-2026": guests.reduce((acc, guest) => {
    acc[String(guest.id)] = {
      id: String(guest.id),
      nombre: guest.name,
      pases: Number(guest.passes || 1),
      activo: true,
    };
    return acc;
  }, {}),
};

window.seedEventGuestsToFirebase = async function seedEventGuestsToFirebase(explicitEventId) {
  const eventId = explicitEventId || window.config?.event?.defaultEventId || "primera-comunion-2026";
  const rsvpDB = window.RSVPDatabase;

  if (!rsvpDB?.migrateLocalGuestsToFirebase) {
    console.warn("RSVPDatabase no está disponible. Revisa que database.js esté cargado.");
    return { ok: false, guests: 0 };
  }

  await rsvpDB.seedEventConfigToFirebase?.(eventId, { force: true });
  const result = await rsvpDB.migrateLocalGuestsToFirebase(eventId, { force: true });
  console.log(`Invitados creados en Firebase: ${result.total || guests.length}`);
  return { ok: true, guests: result.total || guests.length };
};

// Helper: leer parámetros ?id=1
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function applyGuestData(guest) {
  const name = String(guest?.name || guest?.nombre || "Invitado");
  const passes = Math.max(1, Number(guest?.passes ?? guest?.pases ?? 1) || 1);
  const seatsText = `${passes} ${passes === 1 ? "lugar" : "lugares"}`;

  document.getElementById("guestCardName")?.replaceChildren(document.createTextNode(name));
  document.getElementById("guestCardSeats")?.replaceChildren(document.createTextNode(String(passes)));
  document.getElementById("guestCardSeatsTxt")?.replaceChildren(document.createTextNode(passes === 1 ? "lugar" : "lugares"));

  const nameInput = document.getElementById("rsvp-name");
  if (nameInput) nameInput.value = name;
  const reservedSeats = document.getElementById("reservedSeats");
  if (reservedSeats) reservedSeats.textContent = seatsText;

  const popupName = document.getElementById("rsvp-popup-name");
  if (popupName) popupName.value = name;
  const popupCount = document.getElementById("rsvp-popup-count");
  if (popupCount) {
    popupCount.innerHTML = Array.from({ length: passes }, (_, index) => {
      const count = index + 1;
      return `<option value="${count}">${count} ${count === 1 ? "lugar" : "lugares"}</option>`;
    }).join("");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const guestId = getQueryParam("id");

  // Si no hay id, no marcamos error: solo no hay invitado
  if (!guestId) {
    window.currentGuest = null;
    return;
  }

  const guest = guests.find((g) => String(g.id) === String(guestId));

  if (guest) {
    window.currentGuest = guest;

    // Si tienes estos elementos en alguna parte, los llena (opcional)
    const guestNameEl = document.getElementById("guest-name");
    const passesEl = document.getElementById("passes");

    if (guestNameEl) guestNameEl.textContent = guest.name;
    if (passesEl) {
      const p = Number(guest.passes || 1);
      passesEl.textContent = `${p} ${p === 1 ? "pase" : "pases"}`;
    }
    applyGuestData(guest);
    syncGuestFromFirebase(guestId);
  } else {
    window.currentGuest = null;

    const guestNameEl = document.getElementById("guest-name");
    if (guestNameEl) guestNameEl.textContent = "Invitado no encontrado";
    syncGuestFromFirebase(guestId);
  }
});

async function syncGuestFromFirebase(guestId) {
  const eventId = window.config?.event?.defaultEventId || "primera-comunion-2026";
  let lastSignature = "";

  const loadGuest = async () => {
    const database = window.RSVPDatabase;
    if (!database?.getInvitadoById) return false;

    try {
      const guest = await database.getInvitadoById(eventId, guestId);
      if (!guest || guest.activo === false) return true;

      const nextGuest = {
        id: String(guest.id || guestId),
        name: String(guest.nombre || "Invitado"),
        passes: Number(guest.pases || 1),
      };
      const signature = JSON.stringify(nextGuest);
      if (signature === lastSignature) return true;
      lastSignature = signature;
      window.currentGuest = nextGuest;
      applyGuestData(nextGuest);

      const guestNameEl = document.getElementById("guest-name");
      const passesEl = document.getElementById("passes");
      if (guestNameEl) guestNameEl.textContent = nextGuest.name;
      if (passesEl) {
        const p = nextGuest.passes;
        passesEl.textContent = `${p} ${p === 1 ? "pase" : "pases"}`;
      }
      window.dispatchEvent(new CustomEvent("guest:updated"));
      return true;
    } catch (error) {
      console.warn("No se pudo sincronizar el invitado:", error);
      return false;
    }
  };

  let attempts = 0;
  const waitForDatabase = setInterval(async () => {
    attempts += 1;
    if (await loadGuest() || attempts >= 20) clearInterval(waitForDatabase);
  }, 250);

  setInterval(loadGuest, 3000);
}
