const firebaseConfig = {
  apiKey: "AIzaSyAqOZQ5YFOdhL6dblHI5wIx10m6n4xt2Fg",
  authDomain: "buenosdeseos-twodesign.firebaseapp.com",
  databaseURL: "https://buenosdeseos-twodesign-default-rtdb.firebaseio.com",
  projectId: "buenosdeseos-twodesign",
  storageBucket: "buenosdeseos-twodesign.firebasestorage.app",
  messagingSenderId: "577908051871",
  appId: "1:577908051871:web:27fbd4e06b3d18da14b7aa"
};

const config = {
  event: {
    defaultEventId: "primera-comunion-2026",
    databaseURL: firebaseConfig.databaseURL,
    eventIdParam: "eventId",
    dateISO: "2026-12-19T08:30:00-06:00",
    legacyFallback: {
      read: false,
      write: false,
      subscribe: false
    }
  },
  admin: {
    adminKey: "twodesign123",
    keyParam: "key",
    legacyKeyParam: "admin"
  },
  seo: {
    titulo: "Primera Comunión | 19.12.2026",
    descripcion: "Te invitamos a celebrar una Primera Comunión el 19 de diciembre de 2026 en Antigua Guatemala.",
    autor: "Two Design",
    keywords: "invitacion de confirmacion, confirmacion catolica, Antigua Guatemala, celebracion religiosa",
    ogImage: "https://i.ibb.co/FFLwB4G/MTERRACOTA.png"
  },
  pareja: {
    nombres: "Carmen Inés & Juan Ignacio",
    portadaEtiqueta: "Nuestra Primera Comunión",
    nombrePrincipal: "Carmen Inés",
    nombreSecundario: "Juan Ignacio",
    novia: "Carmen Inés",
    novio: "Juan Ignacio",
    fecha: "19-12-2026",
    fechaVisible: "19.12.2026",
    fechaDestacada: "19 . 12 . 2026",
    cierreSubtitulo: "Gracias por acompañarnos en nuestro primer encuentro con Jesús."
  },
  ceremonia: {
    mensajeLinea1Superior: "Con mucha alegría, les invitamos a acompañarnos",
    mensajeLinea1Inferior: "en la primera comunión de",
    mensajeDestacado: "Carmen Inés & Juan Ignacio",
    mensajeLinea3Superior: "Esperamos contar con su presencia en este día",
    mensajeLinea3Inferior: "tan especial",
    fechaNota: "19 de Diciembre, 2026"
  },
  musica: {
    titulo: "Nuestra Canción",
    archivo: "music.mp3"
  },
  evento: {
    ceremonia: {
      titulo: "Ceremonia",
      lugar: "Parroquia San Juan Bosco, Santuario María Auxiliadora",
      hora: "8:30 AM",
      direccion: "20 Avenida 13-45, Colonia Mirador II, Zona 11, Ciudad de Guatemala.",
      ubicacionUrl: "https://maps.app.goo.gl/jhviTxunom1bDcUs5"
    },
    recepcion: {
      titulo: "Recepción",
      lugar: "Guatemala Country Club",
      hora: "9:30 AM",
      direccion: "30 Avenida Final, Zona 11, Ciudad de Guatemala, Guatemala",
      ubicacionUrl: "https://maps.app.goo.gl/7sXC8Ynzdr5ybbyv5"
    },
    calendario: {
      detalle: "Nos encantara compartir este dia tan especial contigo.",
      ubicacion: "Parroquia San Juan Bosco, Santuario María Auxiliadora"
    }
  },
  itinerario: {
    titulo: "Itinerario",
    items: [
      { icono: "Images/ICONO-1.png", alt: "Ceremonia", hora: "11:00 AM", texto: "Ceremonia de Confirmacion" },
      { icono: "Images/ICONO-2.png", alt: "Fotografias", hora: "12:00 PM", texto: "Fotografias familiares" },
      { icono: "Images/ICONO-3.png", alt: "Brindis", hora: "1:00 PM", texto: "Brindis de celebracion" },
      { icono: "Images/ICONO-4.png", alt: "Almuerzo", hora: "1:30 PM", texto: "Almuerzo especial" },
      { icono: "Images/ICONO-5.png", alt: "Convivio", hora: "3:00 PM", texto: "Convivio familiar" },
      { icono: "Images/ICONO-6.png", alt: "Cierre", hora: "5:00 PM", texto: "Cierre de la celebracion" }
    ]
  },
  dressCode: {
    titulo: "Codigo de vestimenta",
    subtitulo: "Formal",
    descripcion: "Agradecemos tu presencia con vestimenta formal y en tonos suaves para acompanarnos en esta celebracion religiosa.",
    coloresReservados: [
      { nombre: "Blanco", color: "#FFFFFF" },
      { nombre: "Dorado", color: "#D4AF37" },
      { nombre: "Beige", color: "#D9C6B3" },
      { nombre: "Oliva", color: "#BF9469" }
    ]
  },
  regalo: {
    titulo: "Detalles",
    descripcion: "Su presencia en este día tan especial es nuestro mejor regalo. Si desea tener un detalle con nosotros, lo recibiremos con mucho cariño.",
    transferencia: {
      titular: "",
      medio: "",
      cuenta: "",
      tipo: ""
    }
  },
  textos: {
    mensajeInvitado: "Para nosotros sera un privilegio compartir contigo un momento tan especial.",
    mensajePases: "Hemos reservado {pases} lugares en su honor",
    fechaLabel: "Dia de bendicion",
    versiculo: "Dejen que los niños vengan a mí, y no se lo impidan, porque el reino de los cielos es de quienes son como ellos. - Mateo 19:14"
  },
  deseos: {
    titulo: "Buenos deseos",
    intro: "Dejanos un mensaje especial para este dia tan importante."
  },
  adultos: {
    titulo: "Solo adultos",
    descripcion: "",
    mostrar: false
  },
  rsvp: {
    titulo: "Confirmar asistencia",
    mensaje: "Para nosotros es muy importante que confirmes tu asistencia lo antes posible, o bien nos indiques si no podras acompanarnos."
  },
  galeria: {
    portadaPrincipal: "Images/ENVELOPE-1.png",
    historia: ["Images/S1.png", "Images/S2.png"],
    celebracion: ["Images/C1.png", "Images/C2.png"],
    pareja: ["Images/F1.png", "Images/F2.png"]
  },
  footer: {
    hashtag: "#MiConfirmacion",
    instagramUrl: "https://www.instagram.com/thetwodesign",
    facebookUrl: "https://www.facebook.com/thetwodesign",
    marcaTexto: "Diseño",
    marcaNombre: "Two Design",
    marcaUrl: "https://twodesign.com"
  }
};

window.config = config;
window.firebaseConfig = firebaseConfig;
