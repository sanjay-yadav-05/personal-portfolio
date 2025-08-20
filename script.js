/* ====== Hamburger menu ====== */
function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

/* ====== Projects slider ====== */
(function () {
  const container = document.querySelector("#projects .slider-container");
  const track = document.querySelector("#projects .slider-track");
  const btnPrev = document.querySelector("#projects .slider-btn.left");
  const btnNext = document.querySelector("#projects .slider-btn.right");

  if (!container || !track || !btnPrev || !btnNext) return;

  let tx = 0;                // current translateX
  let paused = false;        // pause on hover
  let stepping = false;      // true while arrow transition is running
  let lastTs = 0;

  function getGapPx() {
    const cs = getComputedStyle(track);
    // Prefer columnGap for flex row; fallback to gap
    const gp = parseFloat(cs.columnGap || cs.gap || "0");
    return isNaN(gp) ? 0 : gp;
  }

  function itemFullWidth(el) {
    const gap = getGapPx();
    return el.getBoundingClientRect().width + gap;
  }

  const PX_PER_SEC = 40; // auto scroll speed (px/sec). Tweak as needed.

  function advance(dtMs) {
    const px = (PX_PER_SEC * dtMs) / 1000;
    tx -= px;

    // If first card fully moved out, append it to the end and compensate tx
    let first = track.firstElementChild;
    if (!first) return;

    let step = itemFullWidth(first);
    while (-tx >= step && first) {
      tx += step;                    // snap back by width of first item
      track.appendChild(first);      // move first to end
      first = track.firstElementChild;
      step = first ? itemFullWidth(first) : 0;
    }

    track.style.transform = `translateX(${tx}px)`;
  }

  function raf(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;

    if (!paused && !stepping) {
      advance(dt);
    }
    requestAnimationFrame(raf);
  }

  // Hover to pause/resume
  container.addEventListener("mouseenter", () => (paused = true));
  container.addEventListener("mouseleave", () => (paused = false));

  // Step to next (move left by one card)
  function stepNext() {
    if (stepping) return;
    stepping = true;
    paused = true;

    const first = track.firstElementChild;
    if (!first) return (stepping = false);

    const step = itemFullWidth(first);
    const target = tx - step;

    track.style.transition = "transform 400ms ease";
    track.style.transform = `translateX(${target}px)`;

    track.addEventListener(
      "transitionend",
      () => {
        // Normalize: move first to end and reset tx to remove large negative drift
        track.style.transition = "none";
        track.appendChild(first);
        tx = target + step; // compensate because we moved the first card to the end
        track.style.transform = `translateX(${tx}px)`;
        // resume
        stepping = false;
        paused = false;
      },
      { once: true }
    );
  }

  // Step to previous (move right by one card)
  function stepPrev() {
    if (stepping) return;
    stepping = true;
    paused = true;

    const last = track.lastElementChild;
    if (!last) return (stepping = false);

    const step = itemFullWidth(last);

    // Instantly put last at the front and shift left by its width,
    // then animate back to the original position (visual right movement)
    track.style.transition = "none";
    tx -= step; // pre-shift left to make space
    track.style.transform = `translateX(${tx}px)`;
    track.insertBefore(last, track.firstElementChild);

    // Next frame: animate back
    requestAnimationFrame(() => {
      track.style.transition = "transform 400ms ease";
      const target = tx + step; // move right visually
      track.style.transform = `translateX(${target}px)`;
      track.addEventListener(
        "transitionend",
        () => {
          track.style.transition = "none";
          tx = target;
          stepping = false;
          paused = false;
        },
        { once: true }
      );
    });
  }

  btnNext.addEventListener("click", stepNext);
  btnPrev.addEventListener("click", stepPrev);

  // Recompute on resize to keep things smooth
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // No hard recompute needed; widths are measured dynamically.
      // Just ensure transform is applied with current tx.
      track.style.transform = `translateX(${tx}px)`;
    }, 150);
  });

  requestAnimationFrame(raf);
})();




document.addEventListener("DOMContentLoaded", () => {
  const collapsibles = document.querySelectorAll(".details-container.collapsible");

  collapsibles.forEach(section => {
    const title = section.querySelector(".experience-sub-title");
    title.addEventListener("click", () => {
      section.classList.toggle("active");
    });
  });
});


const roles = ["Software Developer", "Web Developer", "Full Stack Engineer", "AI Enthusiast"];
let roleIndex = 0;
let charIndex = 0;
let deleting = false;
const roleElement = document.getElementById("changing-role");

function typeEffect() {
  const current = roles[roleIndex];
  
  if (!deleting) {
    roleElement.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeEffect, 1200); // pause before deleting
      return;
    }
  } else {
    roleElement.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  
  setTimeout(typeEffect, deleting ? 60 : 120); // speed control
}

typeEffect();
