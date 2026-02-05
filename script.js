const buttons = document.querySelectorAll(".glass-btn");
const video = document.querySelector(".bg-video");
const root = document.documentElement;
const source = video ? video.querySelector("source") : null;
const toggle = document.querySelector("#theme-toggle");
const toggleWrap = document.querySelector(".theme-toggle");
const tonReveal = document.querySelector(".meta-reveal");
const clockHHMM = document.querySelector("#clock-hhmm");
const clockSS = document.querySelector("#clock-ss");
const clockDate = document.querySelector("#clock-date");
const priceToggle = document.querySelector(".price-toggle");
const pricePanel = document.querySelector(".price-panel");
const clickSound = document.querySelector("#click-sound");
const transitionClass = "theme-transition";
let transitionTimer = null;
let toggleTimer = null;

const darkBackgrounds = [
  "bacrkgound/background.jpg",
  "background/background.jpg",
  "background.jpg"
];

const lightBackgrounds = [
  "bacrkgound/background_light.jpg",
  "bacrkgound/background-light.jpg",
  "background_light.jpg",
  "background-light.jpg",
  "light_background.jpg",
  "light-background.jpg",
  "background.jpg"
];

const applyBackground = (path) => {
  root.style.setProperty("--bg-image", `url("${path}")`);
  if (video) {
    video.setAttribute("poster", path);
  }
};

const loadFirstAvailable = (candidates, index = 0) => {
  if (index >= candidates.length) {
    return;
  }
  const img = new Image();
  img.onload = () => applyBackground(candidates[index]);
  img.onerror = () => loadFirstAvailable(candidates, index + 1);
  img.src = candidates[index];
};

const tryPlay = () => {
  if (!video) {
    return;
  }
  const result = video.play();
  if (result && typeof result.catch === "function") {
    result.catch(() => {});
  }
};

const setVideoSource = (src) => {
  if (!video || !source || !src) {
    return;
  }
  if (source.getAttribute("src") === src) {
    return;
  }
  root.classList.remove("video-ready");
  source.setAttribute("src", src);
  video.load();
  tryPlay();
};


const enableThemeTransition = () => {
  root.classList.add(transitionClass);
  if (transitionTimer) {
    clearTimeout(transitionTimer);
  }
  transitionTimer = window.setTimeout(() => {
    root.classList.remove(transitionClass);
  }, 450);
};

const animateToggle = () => {
  if (!toggleWrap) {
    return;
  }
  toggleWrap.classList.add("is-animating");
  if (toggleTimer) {
    clearTimeout(toggleTimer);
  }
  toggleTimer = window.setTimeout(() => {
    toggleWrap.classList.remove("is-animating");
  }, 360);
};

const setTheme = (isLight, useTransition = false) => {
  if (useTransition) {
    enableThemeTransition();
    animateToggle();
  }
  root.classList.toggle("theme-light", isLight);
  loadFirstAvailable(isLight ? lightBackgrounds : darkBackgrounds);
  if (video) {
    const src = isLight ? video.dataset.light : video.dataset.dark;
    setVideoSource(src);
  }
  if (toggle) {
    toggle.checked = isLight;
  }
};

const playClick = () => {
  if (!clickSound) {
    return;
  }
  try {
    clickSound.currentTime = 0;
    const result = clickSound.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  } catch (error) {
    // ignore
  }
};

const THEME_KEY = "theme";
const media = window.matchMedia("(prefers-color-scheme: light)");
let storedTheme = null;
try {
  storedTheme = localStorage.getItem(THEME_KEY);
} catch (error) {
  storedTheme = null;
}

const initialIsLight = storedTheme
  ? storedTheme === "light"
  : media.matches;

setTheme(initialIsLight);

if (!storedTheme) {
  if (media.addEventListener) {
    media.addEventListener("change", (event) => setTheme(event.matches, true));
  } else if (media.addListener) {
    media.addListener((event) => setTheme(event.matches, true));
  }
}

const formatTwo = (value) => String(value).padStart(2, "0");

const updateClock = () => {
  if (!clockHHMM && !clockDate) {
    return;
  }
  const now = new Date();
  const hh = formatTwo(now.getHours());
  const mm = formatTwo(now.getMinutes());
  const ss = formatTwo(now.getSeconds());

  if (clockHHMM) {
    clockHHMM.textContent = `${hh}:${mm}`;
  }
  if (clockSS) {
    clockSS.textContent = ss;
  }
  if (clockDate) {
    const dateText = new Intl.DateTimeFormat("ru-RU", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    }).format(now).replace(".", "");
    clockDate.textContent = dateText;
  }
};

updateClock();
window.setInterval(updateClock, 1000);

if (toggle) {
  toggle.addEventListener("change", () => {
    playClick();
    const next = toggle.checked ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      // ignore
    }
    setTheme(next === "light", true);
  });
}

if (tonReveal) {
  tonReveal.addEventListener("click", () => {
    playClick();
    tonReveal.classList.add("is-revealed");
  });
}

const setPriceOpen = (open) => {
  if (!priceToggle || !pricePanel) {
    return;
  }
  priceToggle.setAttribute("aria-expanded", String(open));
  pricePanel.classList.toggle("is-open", open);
  pricePanel.style.maxHeight = open ? `${pricePanel.scrollHeight}px` : "0px";
};

if (priceToggle && pricePanel) {
  setPriceOpen(false);
  priceToggle.addEventListener("click", () => {
    playClick();
    const isOpen = pricePanel.classList.contains("is-open");
    setPriceOpen(!isOpen);
  });
  window.addEventListener("resize", () => {
    if (pricePanel.classList.contains("is-open")) {
      pricePanel.style.maxHeight = `${pricePanel.scrollHeight}px`;
    }
  });
}

buttons.forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    button.style.setProperty("--mx", `${x}%`);
    button.style.setProperty("--my", `${y}%`);
  });

  button.addEventListener("pointerleave", () => {
    button.style.removeProperty("--mx");
    button.style.removeProperty("--my");
  });

  button.addEventListener("click", (event) => {
    if (event.defaultPrevented) {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const href = button.getAttribute("href");
    if (!href) {
      return;
    }
    playClick();
    event.preventDefault();
    button.classList.remove("is-pressed");
    void button.offsetWidth;
    button.classList.add("is-pressed");

    const target = button.getAttribute("target");
    window.setTimeout(() => {
      if (target === "_blank") {
        window.open(href, "_blank", "noopener");
      } else {
        window.location.href = href;
      }
    }, 320);
  });
});

if (video) {
  video.addEventListener("canplay", () => {
    root.classList.add("video-ready");
  });

  tryPlay();
  document.addEventListener("pointerdown", tryPlay, { once: true });
  document.addEventListener("touchstart", tryPlay, { once: true, passive: true });
}
