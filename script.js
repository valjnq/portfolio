// Menu mobile
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

// Apparition en fondu au scroll (respecte prefers-reduced-motion via CSS)
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

// Apparition groupée des cartes du portfolio (toutes en même temps)
const workGrid = document.querySelector(".work-grid");
if (workGrid) {
  if ("IntersectionObserver" in window) {
    const groupObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            workGrid.querySelectorAll(".fade-card").forEach((el) => {
              el.classList.add("is-visible");
            });
            groupObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    groupObserver.observe(workGrid);
  } else {
    workGrid.querySelectorAll(".fade-card").forEach((el) => {
      el.classList.add("is-visible");
    });
  }
}

// Lightbox galerie projet
const lightbox = document.querySelector(".lightbox");
if (lightbox) {
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const tiles = document.querySelectorAll(".gallery-tile");

  const openLightbox = (src, caption) => {
    lightboxImg.src = src;
    lightboxCaption.textContent = caption || "";
    lightbox.classList.add("open");
  };
  const closeLightbox = () => {
    lightbox.classList.remove("open");
  };

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const src = tile.dataset.full || tile.querySelector("img")?.src;
      const caption = tile.dataset.caption || "";
      if (src) openLightbox(src, caption);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

// Formulaire de contact — feedback simple sans backend
const form = document.querySelector(".contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    // Si un service comme Formspree est configuré (voir action= dans le HTML),
    // laisser la soumission suivre son cours normalement.
  });
}
