/* =========================================================
   CONFIGURATION — modifiez ici vos prix, votre offre et vos avis
   ========================================================= */
const CONFIG = {
  // Date de fin RÉELLE de votre promotion. Une fois passée, le compteur disparaît.
  // (En France, un faux compte à rebours qui se relance est une pratique commerciale trompeuse.)
  OFFER_END: "2026-10-31T23:59:59",
  UNIT_PRICE: 33.9,
  FREE_SHIPPING: 50,
  BUNDLES: {
    1: { label: "1 achetée + 1 offerte", qty: 2, price: 33.9 },
    2: { label: "2 achetées + 2 offertes", qty: 4, price: 67.8 },
    3: { label: "3 achetées + 3 offertes", qty: 6, price: 101.7 },
  },
};

// Remplacez ces EXEMPLES par de vrais avis de vos clientes.
// Publier de faux avis est interdit (art. L121-4 du Code de la consommation).
const REVIEWS = [
  { text: "Exemple d'avis : texte de votre cliente sur la qualité du produit.", name: "Prénom N.", size: "L", date: "à compléter", tag: "Qualité", stars: 5 },
  { text: "Exemple d'avis : texte de votre cliente sur la taille et la coupe.", name: "Prénom N.", size: "XXXL", date: "à compléter", tag: "Taille", stars: 5 },
  { text: "Exemple d'avis : texte de votre cliente sur la douceur du tissu.", name: "Prénom N.", size: "XXL", date: "à compléter", tag: "Douceur", stars: 5 },
  { text: "Exemple d'avis : texte de votre cliente sur la livraison.", name: "Prénom N.", size: "XL", date: "à compléter", tag: "Livraison", stars: 5 },
  { text: "Exemple d'avis : texte d'une cliente qui a recommandé.", name: "Prénom N.", size: "XL", date: "à compléter", tag: "Fidèle", stars: 5 },
];

const GALLERY = [
  "images/produit-beige.svg",
  "images/produit-dos.svg",
  "images/produit-detail.svg",
  "images/produit-noir.svg",
  "images/produit-bleu.svg",
  "images/produit-lilas.svg",
];

/* ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const euro = (n) => n.toFixed(2).replace(".", ",") + " €";

const state = { img: 0, color: "Beige", size: "M", bundle: 2, cart: [] };
try { state.cart = JSON.parse(localStorage.getItem("cart") || "[]"); } catch (e) {}

/* ---------- Header ---------- */
window.addEventListener("scroll", () => {
  $("#header").classList.toggle("scrolled", scrollY > 10);
  const cta = $("#addToCart").getBoundingClientRect();
  $("#stickyBar").classList.toggle("show", cta.bottom < 0);
}, { passive: true });

$("#burger").addEventListener("click", (e) => {
  e.currentTarget.classList.toggle("open");
  $("#nav").classList.toggle("open");
});
$$("#nav a").forEach((a) => a.addEventListener("click", () => {
  $("#burger").classList.remove("open");
  $("#nav").classList.remove("open");
}));

/* ---------- Galerie ---------- */
const mainImg = $("#mainImg");
const thumbs = $("#thumbs");
GALLERY.forEach((src, i) => {
  const b = document.createElement("button");
  b.innerHTML = `<img src="${src}" alt="Vue ${i + 1}" loading="lazy">`;
  b.addEventListener("click", () => showImg(i));
  thumbs.appendChild(b);
});

function showImg(i, src) {
  state.img = (i + GALLERY.length) % GALLERY.length;
  const next = src || GALLERY[state.img];
  $$("button", thumbs).forEach((b, j) => b.classList.toggle("active", j === state.img));
  thumbs.children[state.img].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  if (mainImg.getAttribute("src") === next) return;
  mainImg.classList.add("fade");
  setTimeout(() => { mainImg.src = next; mainImg.classList.remove("fade"); }, 250);
}
showImg(0);
$("#prevImg").addEventListener("click", (e) => { e.stopPropagation(); showImg(state.img - 1); });
$("#nextImg").addEventListener("click", (e) => { e.stopPropagation(); showImg(state.img + 1); });

// Zoom au clic, suit la souris
const wrap = $("#mainWrap");
wrap.addEventListener("click", () => wrap.classList.toggle("zoom"));
wrap.addEventListener("mousemove", (e) => {
  const r = wrap.getBoundingClientRect();
  mainImg.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
});
wrap.addEventListener("mouseleave", () => wrap.classList.remove("zoom"));

// Swipe mobile
let sx = 0;
wrap.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
wrap.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 40) showImg(state.img + (dx < 0 ? 1 : -1));
});

/* ---------- Options ---------- */
$$(".swatch").forEach((s) => s.addEventListener("click", () => {
  $$(".swatch").forEach((x) => x.classList.remove("active"));
  s.classList.add("active");
  state.color = s.dataset.color;
  $("#colorName").textContent = state.color;
  $("#stickyImg").src = s.dataset.img;
  const idx = GALLERY.indexOf(s.dataset.img);
  showImg(idx >= 0 ? idx : state.img, s.dataset.img);
}));

$$("#sizes button").forEach((b) => b.addEventListener("click", () => {
  $$("#sizes button").forEach((x) => x.classList.remove("active"));
  b.classList.add("active");
  state.size = b.textContent;
  $("#sizeName").textContent = state.size;
}));

function updateBundle() {
  const b = CONFIG.BUNDLES[state.bundle];
  animatePrice($("#ctaPrice"), b.price);
  $("#stickyPrice").textContent = euro(b.price);
  $("#stickyDesc").textContent = b.label;
}
$$("#bundles input").forEach((i) => i.addEventListener("change", () => {
  state.bundle = +i.value;
  updateBundle();
}));

function animatePrice(el, to) {
  const from = parseFloat(el.textContent.replace(",", ".")) || 0;
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min((t - t0) / 400, 1);
    el.textContent = euro(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Compte à rebours ---------- */
const end = new Date(CONFIG.OFFER_END).getTime();
const cdEls = { D: $("#cdD"), H: $("#cdH"), M: $("#cdM"), S: $("#cdS") };
function tickCountdown() {
  const diff = end - Date.now();
  if (diff <= 0) {
    $("#countdown").classList.add("ended");
    $(".countdown__label").textContent = "Offre terminée";
    return clearInterval(cdTimer);
  }
  const v = {
    D: Math.floor(diff / 864e5),
    H: Math.floor((diff / 36e5) % 24),
    M: Math.floor((diff / 6e4) % 60),
    S: Math.floor((diff / 1e3) % 60),
  };
  for (const k in v) {
    const txt = String(v[k]).padStart(2, "0");
    if (cdEls[k].textContent !== txt) {
      cdEls[k].textContent = txt;
      cdEls[k].classList.remove("tick");
      void cdEls[k].offsetWidth;
      cdEls[k].classList.add("tick");
    }
  }
}
const cdTimer = setInterval(tickCountdown, 1000);
tickCountdown();

/* ---------- Panier ---------- */
function saveCart() {
  try { localStorage.setItem("cart", JSON.stringify(state.cart)); } catch (e) {}
}
function renderCart() {
  const box = $("#cartItems");
  const total = state.cart.reduce((s, i) => s + i.price, 0);
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = euro(total);
  const left = CONFIG.FREE_SHIPPING - total;
  $("#shipText").textContent = left > 0
    ? `Plus que ${euro(left)} pour la livraison offerte`
    : "🎉 La livraison vous est offerte !";
  $("#shipBar").style.width = Math.min(100, (total / CONFIG.FREE_SHIPPING) * 100) + "%";
  box.innerHTML = state.cart.length
    ? state.cart.map((i, n) => `
      <div class="item">
        <img src="${i.img}" alt="">
        <div><b>Culotte gainante post-partum</b><small>${i.label}<br>${i.color} · Taille ${i.size}</small></div>
        <div class="item__right"><b>${euro(i.price)}</b><button class="item__remove" data-i="${n}">Retirer</button></div>
      </div>`).join("")
    : `<p class="empty">Votre panier est vide.</p>`;
  $$(".item__remove", box).forEach((b) => b.addEventListener("click", () => {
    state.cart.splice(+b.dataset.i, 1);
    saveCart(); renderCart();
  }));
}
function openCart(open = true) {
  $("#drawer").classList.toggle("show", open);
  $("#overlay").classList.toggle("show", open);
}
function addToCart() {
  const b = CONFIG.BUNDLES[state.bundle];
  state.cart.push({
    label: b.label, qty: b.qty, price: b.price,
    color: state.color, size: state.size,
    img: $(".swatch.active").dataset.img,
  });
  saveCart(); renderCart();
  const c = $("#cartCount");
  c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
  openCart();
}
$("#addToCart").addEventListener("click", addToCart);
$("#stickyAdd").addEventListener("click", addToCart);
$("#cartOpen").addEventListener("click", () => openCart());
$("#cartClose").addEventListener("click", () => openCart(false));
$("#overlay").addEventListener("click", () => openCart(false));
$("#checkout").addEventListener("click", () => {
  // Branchez ici votre solution de paiement (Shopify, Stripe Checkout, etc.)
  toast(state.cart.length ? "Paiement à connecter (Shopify / Stripe)" : "Votre panier est vide");
});
renderCart();

/* ---------- Modal ---------- */
$$("[data-open]").forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  $("#" + a.dataset.open).classList.add("show");
}));
$$(".modal").forEach((m) => m.addEventListener("click", (e) => {
  if (e.target === m || e.target.closest("[data-close]")) m.classList.remove("show");
}));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { $$(".modal").forEach((m) => m.classList.remove("show")); openCart(false); }
});

/* ---------- Avant / Après ---------- */
const compare = $("#compare");
const after = $("#compareAfter");
const handle = $("#compareHandle");
let dragging = false;
function setCompare(x) {
  const r = compare.getBoundingClientRect();
  const p = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
  after.style.clipPath = `inset(0 0 0 ${p}%)`;
  handle.style.left = p + "%";
}
compare.addEventListener("pointerdown", (e) => { dragging = true; compare.setPointerCapture(e.pointerId); setCompare(e.clientX); });
compare.addEventListener("pointermove", (e) => dragging && setCompare(e.clientX));
compare.addEventListener("pointerup", () => (dragging = false));
compare.addEventListener("pointercancel", () => (dragging = false));

const tabs = $$(".tabs button");
const pill = $(".tabs__pill");
function movePill(btn) {
  pill.style.width = btn.offsetWidth + "px";
  pill.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
}
tabs.forEach((t) => t.addEventListener("click", () => {
  tabs.forEach((x) => x.classList.remove("active"));
  t.classList.add("active");
  movePill(t);
  // Remplacez par vos photos "sous une robe" si vous en avez
  compare.classList.toggle("robe", t.dataset.tab === "robe");
}));
window.addEventListener("load", () => movePill($(".tabs button.active")));
window.addEventListener("resize", () => movePill($(".tabs button.active")));

/* ---------- Avis ---------- */
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
const avg = REVIEWS.reduce((s, r) => s + r.stars, 0) / REVIEWS.length;
$("#avgScore").textContent = avg.toFixed(1).replace(".", ",");
$("#statScore").dataset.count = avg.toFixed(1);

$("#reviewGrid").innerHTML = REVIEWS.map((r) => `
  <article class="review reveal">
    <div class="review__top"><span class="stars">${stars(r.stars)}</span><small>${r.tag}</small></div>
    <p>${r.text}</p>
    <div class="review__author">
      <span class="avatar">${r.name[0]}</span>
      <div>${r.name}<small>Taille ${r.size} · ${r.date}</small></div>
    </div>
  </article>`).join("");

let q = 0;
const dots = $("#quoteDots");
REVIEWS.forEach((_, i) => {
  const d = document.createElement("button");
  d.setAttribute("aria-label", "Avis " + (i + 1));
  d.addEventListener("click", () => { showQuote(i); restartQuote(); });
  dots.appendChild(d);
});
function showQuote(i) {
  q = (i + REVIEWS.length) % REVIEWS.length;
  const r = REVIEWS[q];
  const bq = $("#quoteText");
  bq.classList.add("out");
  setTimeout(() => {
    bq.textContent = r.text;
    $("#quoteMeta").innerHTML = `<span class="stars">${stars(r.stars)}</span><b>${r.name}</b><span>Taille ${r.size}</span>`;
    bq.classList.remove("out");
  }, 350);
  $$("button", dots).forEach((d, j) => d.classList.toggle("active", j === q));
}
let quoteTimer;
const restartQuote = () => { clearInterval(quoteTimer); quoteTimer = setInterval(() => showQuote(q + 1), 6000); };
showQuote(0); restartQuote();

/* ---------- Apparition au scroll + compteurs ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    io.unobserve(en.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 70 + "ms";
  io.observe(el);
});

const countIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const to = parseFloat(el.dataset.count);
    const dec = +el.dataset.decimals || 0;
    const suf = el.dataset.suffix || "";
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / 1400, 1);
      el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec).replace(".", ",") + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countIO.unobserve(el);
  });
}, { threshold: 0.5 });
$$("[data-count]").forEach((el) => countIO.observe(el));

/* ---------- Divers ---------- */
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 2600);
}
$("#newsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  toast("Merci ! Vous êtes inscrite 💌");
});
$("#year").textContent = new Date().getFullYear();
updateBundle();
