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

// Galerie projet — carrousel sur une ligne avec flèches
document.querySelectorAll(".gallery-wrap").forEach((wrap) => {
  const track = wrap.querySelector(".gallery-grid");
  const leftBtn = wrap.querySelector(".gallery-arrow-left");
  const rightBtn = wrap.querySelector(".gallery-arrow-right");
  if (!track) return;

  const updateArrows = () => {
    const scrollable = track.scrollWidth > track.clientWidth + 4;
    if (leftBtn) leftBtn.style.display = scrollable && track.scrollLeft > 4 ? "flex" : "none";
    if (rightBtn) {
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      rightBtn.style.display = scrollable && !atEnd ? "flex" : "none";
    }
  };

  const scrollByTile = (dir) => {
    const tile = track.querySelector(".gallery-tile");
    const amount = tile ? tile.getBoundingClientRect().width + 1 : 300;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  leftBtn?.addEventListener("click", () => scrollByTile(-1));
  rightBtn?.addEventListener("click", () => scrollByTile(1));
  track.addEventListener("scroll", updateArrows);
  window.addEventListener("resize", updateArrows);
  updateArrows();
});

// Lightbox galerie projet — avec navigation précédent / suivant
const lightbox = document.querySelector(".lightbox");
if (lightbox) {
  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  // Seules les vignettes ayant une vraie photo sont navigables
  const tiles = Array.from(document.querySelectorAll(".gallery-tile")).filter(
    (tile) => tile.querySelector("img")
  );
  let currentIndex = -1;

  const showAt = (index) => {
    if (!tiles.length) return;
    currentIndex = (index + tiles.length) % tiles.length;
    const img = tiles[currentIndex].querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    const multiple = tiles.length > 1;
    if (prevBtn) prevBtn.style.display = multiple ? "flex" : "none";
    if (nextBtn) nextBtn.style.display = multiple ? "flex" : "none";
  };

  const openLightbox = (index) => {
    showAt(index);
    lightbox.classList.add("open");
  };
  const closeLightbox = () => {
    lightbox.classList.remove("open");
  };

  tiles.forEach((tile, i) => {
    tile.addEventListener("click", () => openLightbox(i));
  });

  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    showAt(currentIndex - 1);
  });
  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    showAt(currentIndex + 1);
  });

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showAt(currentIndex + 1);
    if (e.key === "ArrowLeft") showAt(currentIndex - 1);
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
