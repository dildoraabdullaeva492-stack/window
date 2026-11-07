const axisCatalog = {};
const axisCart = [];
let activeCategory = "all",
  activeSearch = "";

function axisFallback(img) {
  img.onerror = null;
  const c = document.createElement("canvas");
  c.width = 800;
  c.height = 500;
  const ctx = c.getContext("2d"),
    g = ctx.createLinearGradient(0, 0, 800, 500);
  g.addColorStop(0, "#E0F2FE");
  g.addColorStop(0.5, "#F1F5F9");
  g.addColorStop(1, "#DBEAFE");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 800, 500);
  ctx.strokeStyle = "#0062FF";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 752, 452);
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText(img.alt || "AXIS ARCHITECTURAL GLAZING", 48, 255);
  img.src = c.toDataURL("image/png");
}

function axisSyncCatalogImages() {
  document
    .querySelectorAll("#catalog-grid [data-window-id]")
    .forEach((card) => {
      const id = card.getAttribute("data-window-id"),
        imgEl = card.querySelector("img");
      axisCatalog[id] = {
        id,
        title: card.getAttribute("data-title"),
        category: card.getAttribute("data-category"),
        price: Number(card.getAttribute("data-price") || 0),
        uw: card.getAttribute("data-uw"),
        db: card.getAttribute("data-db"),
        glass: card.getAttribute("data-glass"),
        profile: card.getAttribute("data-profile"),
        desc: card.getAttribute("data-desc"),
        src: imgEl ? imgEl.getAttribute("src") : "",
      };
    });
}

function axisApplyFilter() {
  axisSyncCatalogImages();
  document
    .querySelectorAll("#catalog-grid [data-window-id]")
    .forEach((card) => {
      const cat = card.getAttribute("data-category") || "";
      const ok =
        (activeCategory === "all" || cat === activeCategory) &&
        (!activeSearch ||
          card.textContent.toLowerCase().includes(activeSearch));
      card.classList.toggle("hidden-card", !ok);
    });
}

function axisFilter(category, btn) {
  activeCategory = category;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  axisApplyFilter();
}

function axisSearch(q) {
  activeSearch = (q || "").trim().toLowerCase();
  axisApplyFilter();
}
function axisCloseSpecs() {
  document.getElementById("specs-modal")?.classList.remove("open");
}
function axisToggleDrawer(open) {
  document.getElementById("quote-drawer")?.classList.toggle("open", !!open);
}

function axisQuickSpecs(id) {
  axisSyncCatalogImages();
  const it = axisCatalog[id];
  if (!it) return;
  document.getElementById("specs-modal-media").innerHTML =
    `<img src="${it.src}" alt="${it.title}" onerror="axisFallback(this)" />`;
  ["cat", "title", "desc", "uw", "db", "glass", "profile"].forEach((k) => {
    document.getElementById("specs-modal-" + k).textContent =
      it[k === "cat" ? "category" : k];
  });
  document.getElementById("specs-modal-price").textContent =
    "$" + it.price.toLocaleString();
  document.getElementById("specs-modal-add").onclick = () => {
    axisCloseSpecs();
    axisAddQuote(id);
  };
  document.getElementById("specs-modal").classList.add("open");
}

function axisAddQuote(id) {
  axisSyncCatalogImages();
  if (!axisCatalog[id]) return;
  const found = axisCart.find((x) => x.id === id);
  if (found) found.qty += 1;
  else axisCart.push({ id, qty: 1 });
  axisRenderQuote();
  axisToggleDrawer(true);
}

function axisQty(id, delta) {
  const idx = axisCart.findIndex((x) => x.id === id);
  if (idx > -1) {
    axisCart[idx].qty += delta;
    if (axisCart[idx].qty <= 0) axisCart.splice(idx, 1);
  }
  axisRenderQuote();
}

function axisRenderQuote() {
  axisSyncCatalogImages();
  const list = document.getElementById("quote-items");
  if (!list) return;
  let total = 0,
    count = 0;
  list.innerHTML =
    axisCart
      .map((entry) => {
        const it = axisCatalog[entry.id] || {
          title: entry.id,
          price: 4800,
          src: "",
        };
        total += it.price * entry.qty;
        count += entry.qty;
        return `<div class="quote-line-item"><img src="${it.src}" alt="${it.title}" onerror="axisFallback(this)" /><div><strong style="font-size:0.86rem;display:block;">${it.title}</strong><span class="mono-spec" style="font-size:0.76rem;color:#0062FF;">$${it.price.toLocaleString()} × ${entry.qty}</span></div><div style="display:flex;gap:4px;"><button type="button" class="btn-sm-outline" onclick="axisQty('${entry.id}',-1)">-</button><button type="button" class="btn-sm-outline" onclick="axisQty('${entry.id}',1)">+</button></div></div>`;
      })
      .join("") ||
    '<p style="color:#475569;font-size:0.88rem;padding:18px 0;">No architectural systems in estimate yet.</p>';
  document.getElementById("quote-count").textContent = String(count);
  document.getElementById("quote-subtotal").textContent =
    "$" + total.toLocaleString();
  const pct = Math.min(100, Math.round((total / 2500) * 100));
  document.getElementById("laser-bar").style.width = pct + "%";
  document.getElementById("laser-pct").textContent = pct + "%";
  document.getElementById("laser-msg").textContent =
    total >= 2500
      ? "✓ UNLOCKED: Free Precision Laser Site Measurement!"
      : `Add $${(2500 - total).toLocaleString()} for Free Precision Laser Site Measurement`;
}

function axisScenario(btn) {
  document
    .querySelectorAll(".scenario-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("config-img").src = btn.getAttribute("data-img");
  ["title", "uw", "shgc", "db", "cross", "hw1", "hw2", "hw3"].forEach((k) => {
    document.getElementById("config-" + k).textContent = btn.getAttribute(
      "data-" + k,
    );
  });
  document
    .getElementById("config-add-btn")
    .setAttribute("data-target", btn.getAttribute("data-id"));
}

function axisNav(targetId, linkEl, ev) {
  if (ev) ev.preventDefault();
  document
    .querySelectorAll(".nav-link")
    .forEach((a) => a.classList.remove("active"));
  if (linkEl) linkEl.classList.add("active");
  if (targetId === "contact-view") {
    document.body.classList.add("contact-mode");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (!document.getElementById("main-content")) {
    window.location.href = "index.html#" + targetId;
  } else {
    document.body.classList.remove("contact-mode");
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  }
  return false;
}

function axisLogin(ev) {
  if (ev) ev.preventDefault();
  console.log("AXIS GLAZING - CLIENT LOGIN:", {
    email: document.getElementById("login-email").value.trim(),
    password: document.getElementById("login-password").value,
  });
  document.getElementById("login-status").classList.add("visible");
  return false;
}

function axisRegister(ev) {
  if (ev) ev.preventDefault();
  console.log("AXIS GLAZING - ARCHITECT REGISTRATION:", {
    fullName: document.getElementById("reg-name").value.trim(),
    email: document.getElementById("reg-email").value.trim(),
    phone: document.getElementById("reg-phone").value.trim(),
    password: document.getElementById("reg-password").value,
  });
  document.getElementById("reg-status").classList.add("visible");
  return false;
}

document.addEventListener("DOMContentLoaded", () => {
  axisSyncCatalogImages();
  axisRenderQuote();
  setTimeout(
    () =>
      document
        .getElementById("window-preloader")
        ?.classList.add("preload-done"),
    4500,
  );
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => e.isIntersecting && e.target.classList.add("revealed")),
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal-card").forEach((el) => io.observe(el));
});
