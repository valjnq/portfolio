// Menu mobile
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

// Forcer la lecture des vidéos en boucle (iOS Safari est plus strict et
// n'honore pas toujours l'attribut autoplay tout seul : il faut aussi
// déclencher .play() explicitement, avec muted réaffirmé en JS).
document.querySelectorAll(".gallery-tile video[autoplay]").forEach((v) => {
  v.muted = true;
  v.setAttribute("muted", "");
  v.playsInline = true;
  const tryPlay = () => v.play().catch(() => {});
  if (v.readyState >= 2) {
    tryPlay();
  } else {
    v.addEventListener("loadeddata", tryPlay, { once: true });
    v.addEventListener("canplay", tryPlay, { once: true });
  }
});

// Apparition en fondu au scroll (respecte prefers-reduced-motion via CSS)
const revealEls = document.querySelectorAll(".reveal:not(.reveal-group)");

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

// Apparition groupée description + galerie (pages projet) — tout en même temps,
// déclenché dès que N'IMPORTE LEQUEL des éléments du groupe entre dans l'écran
// (important : sur mobile la galerie est visuellement avant la description)
// On attend que toutes les images/vidéos du groupe soient chargées avant de
// révéler, pour éviter le flash "case grise -> photo qui apparaît d'un coup"
// et garder texte + photos parfaitement synchronisés.
const revealGroup = document.querySelectorAll(".reveal-group");
if (revealGroup.length) {
  if ("IntersectionObserver" in window) {
    const showGroup = () => {
      revealGroup.forEach((el) => el.classList.add("is-visible"));
      document
        .querySelectorAll(".gallery-wrap")
        .forEach((el) => el.classList.add("is-visible"));
    };

    const groupObserver2 = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some((entry) => entry.isIntersecting);
        if (anyVisible) {
          groupObserver2.disconnect();

          const imgs = Array.from(document.querySelectorAll(".reveal-group img"));
          const videos = Array.from(document.querySelectorAll(".reveal-group video"));

          const imgReady = imgs.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((resolve) => {
                  img.addEventListener("load", resolve, { once: true });
                  img.addEventListener("error", resolve, { once: true });
                })
          );
          const videoReady = videos.map((v) =>
            v.readyState >= 2
              ? Promise.resolve()
              : new Promise((resolve) => {
                  v.addEventListener("loadeddata", resolve, { once: true });
                  v.addEventListener("error", resolve, { once: true });
                })
          );

          Promise.all([...imgReady, ...videoReady]).then(showGroup);
          // Filet de sécurité : si une image/vidéo ne charge jamais, on révèle
          // quand même après un court délai pour ne pas bloquer l'affichage.
          setTimeout(showGroup, 1200);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    revealGroup.forEach((el) => groupObserver2.observe(el));
  } else {
    revealGroup.forEach((el) => el.classList.add("is-visible"));
    document
      .querySelectorAll(".gallery-wrap")
      .forEach((el) => el.classList.add("is-visible"));
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
  const lightboxVideo = lightbox.querySelector(".lightbox-video");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  // Les vignettes navigables : vraie photo, vidéo embarquée (iframe) OU vidéo locale (fichier)
  const tiles = Array.from(document.querySelectorAll(".gallery-tile")).filter(
    (tile) =>
      tile.querySelector("img") || tile.dataset.embedSrc || tile.dataset.videoSrc
  );
  let currentIndex = -1;

  const showAt = (index) => {
    if (!tiles.length) return;
    currentIndex = (index + tiles.length) % tiles.length;
    const tile = tiles[currentIndex];
    const embedSrc = tile.dataset.embedSrc;
    const videoSrc = tile.dataset.videoSrc;

    if (embedSrc) {
      lightboxImg.style.display = "none";
      lightboxImg.src = "";
      if (lightboxVideo) {
        const autoplaySrc =
          embedSrc + (embedSrc.includes("?") ? "&autoplay=1" : "?autoplay=1");
        lightboxVideo.style.display = "block";
        lightboxVideo.innerHTML =
          '<iframe src="' +
          autoplaySrc +
          '" title="' +
          (tile.getAttribute("aria-label") || "Vidéo") +
          '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      }
    } else if (videoSrc) {
      lightboxImg.style.display = "none";
      lightboxImg.src = "";
      if (lightboxVideo) {
        lightboxVideo.style.display = "block";
        lightboxVideo.innerHTML =
          '<video src="' +
          videoSrc +
          '" controls autoplay playsinline loop></video>';
      }
    } else {
      if (lightboxVideo) {
        lightboxVideo.style.display = "none";
        lightboxVideo.innerHTML = "";
      }
      const img = tile.querySelector("img");
      lightboxImg.style.display = "block";
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
    }

    const multiple = tiles.length > 1;
    if (prevBtn) prevBtn.style.display = multiple ? "flex" : "none";
    if (nextBtn) nextBtn.style.display = multiple ? "flex" : "none";
  };

  const openLightbox = (index) => {
    // Met en pause les vidéos qui jouent en boucle dans la galerie
    // (évite d'avoir la même vidéo qui joue en double, petite ET en grand)
    document.querySelectorAll(".gallery-tile video").forEach((v) => v.pause());
    showAt(index);
    lightbox.classList.add("open");
  };
  const closeLightbox = () => {
    lightbox.classList.remove("open");
    if (lightboxVideo) lightboxVideo.innerHTML = ""; // stoppe la lecture
    // Relance les vidéos en boucle de la galerie
    document.querySelectorAll(".gallery-tile video[autoplay]").forEach((v) => {
      v.play().catch(() => {});
    });
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
