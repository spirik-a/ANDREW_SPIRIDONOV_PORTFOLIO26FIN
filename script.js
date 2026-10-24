// ==========================================
// 1. ЗАХИСТ КОНТЕНТУ (ANTI-THEFT)
// ==========================================
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
document.addEventListener("dragstart", function (e) {
  e.preventDefault();
});
document.addEventListener(
  "keydown",
  function (e) {
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;
    const block = () => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    if (e.code === "F12" || e.keyCode === 123) return block(); // DevTools
    if (isCmdOrCtrl && e.code === "KeyS") return block(); // Save page
    if (isCmdOrCtrl && e.code === "KeyP") return block(); // Print / PDF
    if (isCmdOrCtrl && e.code === "KeyU") return block(); // View source
    if (
      isCmdOrCtrl &&
      (e.code === "KeyI" || e.code === "KeyC" || e.code === "KeyJ") &&
      (isShift || isAlt)
    )
      return block(); // DevTools shortcuts
  },
  true
);

// ==========================================
// 2. ЛОАДЕР (легкий: чекає лише на базові ресурси)
// ==========================================
(function () {
  const screen = document.getElementById("loading-screen");
  const pct = document.getElementById("percent");
  const bar = document.getElementById("progress-bar");
  let p = 0;
  let finished = false;
  const set = (v) => {
    pct.textContent = Math.round(v) + "%";
    bar.style.width = v + "%";
  };
  const tick = setInterval(() => {
    p = Math.min(p + Math.random() * 14, 90);
    set(p);
  }, 120);
  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(tick);
    set(100);
    setTimeout(() => {
      screen.classList.add("done");
      document.body.classList.remove("loading");
    }, 350);
  }
  window.addEventListener("load", finish);
  setTimeout(finish, 4000); // страховка
})();

// ==========================================
// 3. ФІЛЬТРИ, ПЕРЕГЛЯД КЕЙСІВ, КНОПКА "ВГОРУ"
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const viewer = document.getElementById("viewer");
  const vBody = document.getElementById("v-body");
  const vTitle = document.getElementById("v-title");
  const vClose = document.getElementById("v-close");
  const toTop = document.getElementById("back-to-top");
  let lastFocus = null;

  // Якщо мініатюра відсутня, показуємо повну картинку кейсу
  document.querySelectorAll(".card img").forEach((img) => {
    const useFull = () => {
      const full = (img.closest(".card").dataset.imgs || "").split("|")[0];
      if (full && !img.src.endsWith(encodeURI(full))) img.src = full;
    };
    img.addEventListener("error", useFull);
    if (img.complete && img.naturalWidth === 0) useFull();
  });

  // Захист: ніяких перетягувань медіа
  document.querySelectorAll("img,video").forEach((m) => (m.draggable = false));

  // Фільтри
  function applyFilter(f) {
    document.querySelectorAll(".f").forEach((b) =>
      b.classList.toggle("on", b.dataset.f === f)
    );
    document.querySelectorAll(".card").forEach((c) => {
      c.hidden = f !== "all" && !(c.dataset.cat || "").split(" ").includes(f);
    });
  }

  // Перегляд кейсу
  function openCase(el) {
    lastFocus = el;
    vBody.innerHTML = "";
    vTitle.textContent = el.dataset.title || "";
    vBody.classList.toggle("gap", el.hasAttribute("data-gap"));
    if (el.dataset.extra) {
      const t = document.getElementById(el.dataset.extra);
      if (t) vBody.append(t.content.cloneNode(true));
    }
    (el.dataset.imgs || "")
      .split("|")
      .filter(Boolean)
      .forEach((src) => {
        const i = new Image();
        i.loading = "lazy";
        i.draggable = false;
        i.alt = "";
        i.src = src;
        vBody.append(i);
      });
    if (el.dataset.video) {
      const v = document.createElement("video");
      v.src = el.dataset.video;
      v.autoplay = v.loop = v.muted = v.playsInline = true;
      v.setAttribute("muted", "");
      v.draggable = false;
      vBody.append(v);
    }
    viewer.hidden = false;
    document.body.classList.add("lock");
    vBody.scrollTop = 0;
    vClose.focus();
  }
  function closeCase() {
    viewer.hidden = true;
    vBody.innerHTML = "";
    document.body.classList.remove("lock");
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-f]");
    if (f) applyFilter(f.dataset.f);
    const c = e.target.closest("[data-imgs],[data-video]");
    if (c && !viewer.contains(c)) openCase(c);
  });
  vClose.addEventListener("click", closeCase);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !viewer.hidden) closeCase();
  });

  // Кнопка "Вгору"
  window.addEventListener("scroll", () => {
    toTop.style.display = window.scrollY > 800 ? "flex" : "none";
  });
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
});
