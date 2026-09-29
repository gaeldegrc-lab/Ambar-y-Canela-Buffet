// ============================================================
// 1. FECHA DEL EVENTO
// Cambia esta fecha/hora para que el contador corresponda
// exactamente al día del buffet.
// Formato recomendado: YYYY-MM-DDTHH:MM:SS-06:00
// ============================================================
const EVENT_DATE = new Date("2026-11-20T19:00:00-06:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const distance = EVENT_DATE - now;

  const elements = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };

  if (distance <= 0) {
    Object.values(elements).forEach(el => el.textContent = "00");
    return;
  }

  elements.days.textContent = Math.floor(distance / (1000 * 60 * 60 * 24))
    .toString().padStart(2, "0");

  elements.hours.textContent = Math.floor((distance / (1000 * 60 * 60)) % 24)
    .toString().padStart(2, "0");

  elements.minutes.textContent = Math.floor((distance / (1000 * 60)) % 60)
    .toString().padStart(2, "0");

  elements.seconds.textContent = Math.floor((distance / 1000) % 60)
    .toString().padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ============================================================
// 2. ANIMACIONES DE APARICIÓN AL HACER SCROLL
// IntersectionObserver detecta cuando cada elemento entra
// en pantalla y agrega la clase .visible.
// ============================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

document.querySelectorAll(".reveal").forEach(element => {
  revealObserver.observe(element);
});

// ============================================================
// 3. CONFIRMACIÓN DE ASISTENCIA
// Envía los datos al backend PHP.
// ============================================================
const rsvpForm = document.getElementById("rsvpForm");
const rsvpMessage = document.getElementById("rsvpMessage");

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  rsvpMessage.textContent = "Guardando tu confirmación...";

  try {
    const response = await fetch("api/rsvp.php", {
      method: "POST",
      body: new FormData(rsvpForm)
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Error");

    rsvpMessage.textContent = result.message;
    rsvpForm.reset();
  } catch (error) {
    rsvpMessage.textContent =
      "No pudimos guardar tu confirmación. Inténtalo nuevamente.";
  }
});

// ============================================================
// 4. GALERÍA
// Carga fotografías existentes y permite subir nuevas.
// ============================================================
const galleryGrid = document.getElementById("galleryGrid");
const galleryForm = document.getElementById("galleryForm");
const galleryMessage = document.getElementById("galleryMessage");

async function loadGallery() {
  try {
    const response = await fetch("api/gallery.php");
    const images = await response.json();

    galleryGrid.innerHTML = "";

    images.forEach(image => {
      const figure = document.createElement("figure");

      const img = document.createElement("img");
      img.src = image.url;
      img.alt = `Recuerdo de ${image.nombre || "Ámbar y Canela"}`;
      img.loading = "lazy";

      const caption = document.createElement("figcaption");
      caption.textContent = image.nombre || "Recuerdo";

      figure.appendChild(img);
      figure.appendChild(caption);
      galleryGrid.appendChild(figure);
    });
  } catch {
    galleryGrid.innerHTML =
      "<p>No se pudo cargar la galería por el momento.</p>";
  }
}

galleryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  galleryMessage.textContent = "Subiendo fotografía...";

  try {
    const response = await fetch("api/upload.php", {
      method: "POST",
      body: new FormData(galleryForm)
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Error");

    galleryMessage.textContent = result.message;
    galleryForm.reset();
    loadGallery();
  } catch {
    galleryMessage.textContent =
      "No se pudo subir la fotografía.";
  }
});

loadGallery();
