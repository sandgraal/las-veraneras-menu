let lang = 'es';
let selected = 'all';
let menuData = { categories: [] };
let cart = JSON.parse(localStorage.getItem('lv-cart') || '{}');

const whatsappNumber = '';

const labels = {
  es: {
    all: 'Todo', featured: 'Recomendados', combos: 'Combos fáciles', most: 'Más pedidos',
    popular: 'Muy pedido', add: 'Agregar', order: 'Enviar pedido', noResults: 'No hay resultados',
    ready: '🚀 Pedido listo para enviar', empty: 'Sin items', copied: 'Pedido copiado. Agrega el número de WhatsApp para enviar directo.'
  },
  en: {
    all: 'All', featured: 'Top Picks', combos: 'Easy Combos', most: 'Most ordered',
    popular: 'Most ordered', add: 'Add', order: 'Send order', noResults: 'No results',
    ready: '🚀 Order ready to send', empty: 'No items', copied: 'Order copied. Add the WhatsApp number to send directly.'
  }
};

const combos = [
  { id: 'combo-snack', emoji: '🍔', name: { es: 'Combo Antojo', en: 'Craving Combo' }, description: { es: 'Hamburguesa con papas + helado', en: 'Burger & fries + ice cream' }, items: ['burger', 'helado'], price: '4300', tag: { es: 'Rápido y popular', en: 'Fast and popular' } },
  { id: 'combo-amigos', emoji: '🔥', name: { es: 'Combo Amigos', en: 'Friends Combo' }, description: { es: 'Nachos + 3x1 tacos arreglados + salchipapas', en: 'Nachos + loaded tacos + sausage fries' }, items: ['nachos', 'tacos-arreglados', 'salchipapas'], price: '7200', tag: { es: 'Para compartir', en: 'Shareable' } },
  { id: 'combo-casero', emoji: '🍽️', name: { es: 'Combo Casero', en: 'House Combo' }, description: { es: 'Chifrijo + papas a la francesa', en: 'Chifrijo + french fries' }, items: ['chifrijo', 'papas'], price: '6000', tag: { es: 'Recomendado', en: 'Recommended' } }
];

const upsells = {
  burger: ['helado', 'papas'], nachos: ['mayo', 'tacos-arreglados'], chifrijo: ['papas'],
  salchipapas: ['mayo'], 'pollo-francesa': ['papas'], 'arroz-camarones': ['papas'], camarones: ['papas'], tilapia: ['papas']
};

function $(id) { return document.getElementById(id); }
function allItems() { return menuData.categories.flatMap((c, ci) => c.items.map(i => ({ ...i, category: c, categoryIndex: ci }))); }
function findItem(id) { return allItems().find(i => i.id === id); }
function formatPrice(value) { return '₡' + String(value || 0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function saveCart() { localStorage.setItem('lv-cart', JSON.stringify(cart)); renderAll(); }

function setLang(nextLang) {
  lang = nextLang;
  document.documentElement.lang = lang;
  $('btn-es')?.classList.toggle('active', lang === 'es');
  $('btn-en')?.classList.toggle('active', lang === 'en');
  if ($('cart-title')) $('cart-title').textContent = lang === 'es' ? 'Pedido' : 'Order';
  if ($('cart-nudge')) $('cart-nudge').textContent = labels[lang].ready;
  const checkout = document.querySelector('.checkout');
  if (checkout) checkout.textContent = labels[lang].order;
  renderAll();
}

function setCategory(id) { selected = id; renderAll(); }

function renderFilters() {
  const root = $('filters');
  if (!root) return;
  root.innerHTML = [
    `<button class="${selected === 'all' ? 'active' : ''}" onclick="setCategory('all')">${labels[lang].all}</button>`,
    ...menuData.categories.map((c, idx) => `<button class="${selected === String(idx) ? 'active' : ''}" onclick="setCategory('${idx}')">${c.emoji || ''} ${c.name[lang]}</button>`)
  ].join('');
}

function qtyControls(id) {
  const qty = cart[id] || 0;
  if (!qty) return `<button class="add-btn" onclick="addToCart('${id}', true)">＋ ${labels[lang].add}</button>`;
  return `<div class="stepper"><button onclick="changeQty('${id}', -1)">−</button><span>${qty}</span><button onclick="addToCart('${id}', false)">+</button></div>`;
}

function itemCard(item, compact = false) {
  const badge = item.popular ? `<span class="badge">🔥 ${labels[lang].popular}</span>` : '';
  const img = item.image ? `<img loading="lazy" src="${item.image}" alt="${item.name[lang]}" onerror="this.closest('.dish').classList.add('no-image')">` : '';
  return `<article class="dish ${compact ? 'compact' : ''}" id="item-${item.id}">${img}<div class="dish-body">${badge}<h3>${item.name[lang]}</h3><p>${item.description?.[lang] || ''}</p><div class="dish-bottom"><strong>${formatPrice(item.price)}</strong><div class="actions">${qtyControls(item.id)}<button onclick="shareItem('${item.id}')">↗</button></div></div></div></article>`;
}

function comboCard(combo) {
  return `<article class="combo-card"><div class="combo-top"><span>${combo.emoji}</span><b>${combo.tag[lang]}</b></div><h3>${combo.name[lang]}</h3><p>${combo.description[lang]}</p><div class="dish-bottom"><strong>${formatPrice(combo.price)}</strong><button onclick="addCombo('${combo.id}')">＋ ${labels[lang].add}</button></div></article>`;
}

function renderConversion() {
  const root = $('conversion');
  if (!root) return;
  const popular = allItems().filter(i => i.popular).slice(0, 5);
  root.innerHTML = `<div class="section-title"><span>💸</span><h2>${labels[lang].combos}</h2></div><div class="combo-row">${combos.map(comboCard).join('')}</div><div class="section-title"><span>🔥</span><h2>${labels[lang].most}</h2></div><div class="popular-row">${popular.map(i => `<button onclick="focusItem('${i.id}')">${i.name[lang]} <b>${formatPrice(i.price)}</b></button>`).join('')}</div>`;
}

function renderFeatured() {
  const root = $('featured');
  if (!root) return;
  const featured = allItems().filter(i => i.featured).slice(0, 8);
  root.innerHTML = featured.length ? `<div class="section-title"><span>⭐</span><h2>${labels[lang].featured}</h2></div><div class="featured-row">${featured.map(i => itemCard(i, true)).join('')}</div>` : '';
}

function renderMenu() {
  const root = $('menu');
  if (!root) return;
  const search = ($('search')?.value || '').trim().toLowerCase();
  let html = '';
  menuData.categories.forEach((category, idx) => {
    if (selected !== 'all' && selected !== String(idx)) return;
    const matched = category.items.filter(item => !search || [item.name.es, item.name.en, item.description?.es || '', item.description?.en || ''].join(' ').toLowerCase().includes(search));
    if (!matched.length) return;
    html += `<article class="category"><div class="section-title"><span>${category.emoji || '🍴'}</span><h2>${category.name[lang]}</h2></div><div class="grid">${matched.map(item => itemCard(item)).join('')}</div></article>`;
  });
  root.innerHTML = html || `<p class="empty">${labels[lang].noResults}</p>`;
}

function renderCart() {
  const items = allItems();
  const rows = Object.entries(cart).map(([id, qty]) => {
    const item = items.find(i => i.id === id);
    if (!item) return '';
    return `<div class="cart-row"><span>${qty}× ${item.name[lang]}</span><strong>${formatPrice(Number(item.price) * qty)}</strong><div><button onclick="changeQty('${id}', -1)">−</button><button onclick="changeQty('${id}', 1)">+</button></div></div>`;
  }).join('');
  if ($('cart-items')) $('cart-items').innerHTML = rows || `<p class="empty">${labels[lang].empty}</p>`;
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find(i => i.id === id);
    return sum + (item ? Number(item.price) * qty : 0);
  }, 0);
  if ($('cart-total')) $('cart-total').textContent = formatPrice(total);
  if ($('cart-count')) $('cart-count').textContent = Object.values(cart).reduce((a, b) => a + b, 0);
}

function renderAll() { renderFilters(); renderConversion(); renderFeatured(); renderMenu(); renderCart(); }

function addToCart(id, show = true) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  $('cart-fab')?.classList.add('bounce');
  setTimeout(() => $('cart-fab')?.classList.remove('bounce'), 400);
  if (show) showUpsell(id);
}

function addCombo(id) {
  const combo = combos.find(c => c.id === id);
  if (!combo) return;
  combo.items.forEach(itemId => cart[itemId] = (cart[itemId] || 0) + 1);
  saveCart();
  toggleCartOpen();
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
}

function showUpsell(id) {
  const picks = (upsells[id] || []).map(findItem).filter(Boolean).slice(0, 2);
  if (!picks.length || !$('upsell')) return;
  $('upsell').innerHTML = `<div class="upsell-card"><button class="upsell-close" onclick="hideUpsell()">×</button><h3>${labels[lang].upsell}</h3>${picks.map(i => `<button onclick="addToCart('${i.id}', false); hideUpsell()">＋ ${i.name[lang]} <b>${formatPrice(i.price)}</b></button>`).join('')}</div>`;
  $('upsell').classList.add('open');
  setTimeout(() => $('upsell')?.classList.remove('open'), 6500);
}

function hideUpsell() { $('upsell')?.classList.remove('open'); }
function toggleCart() { $('cart')?.classList.toggle('open'); }
function toggleCartOpen() { $('cart')?.classList.add('open'); }

function focusItem(id) {
  const el = $('item-' + id);
  if (!el) { selected = 'all'; renderAll(); setTimeout(() => focusItem(id), 100); return; }
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('spotlight');
  setTimeout(() => el.classList.remove('spotlight'), 2500);
}

function surpriseMe() {
  const items = allItems();
  if (!items.length) return;
  focusItem(items[Math.floor(Math.random() * items.length)].id);
}

function orderText() {
  const items = allItems();
  const lines = Object.entries(cart).map(([id, qty]) => {
    const item = items.find(i => i.id === id);
    return item ? `${qty} x ${item.name.es} / ${item.name.en} - ${formatPrice(Number(item.price) * qty)}` : '';
  }).filter(Boolean);
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find(i => i.id === id);
    return sum + (item ? Number(item.price) * qty : 0);
  }, 0);
  const notes = $('order-notes')?.value.trim();
  return `Hola Las Veraneras, quiero pedir:\n${lines.join('\n')}\nTotal: ${formatPrice(total)}${notes ? '\nNotas: ' + notes : ''}`;
}

async function checkout() {
  if (!Object.keys(cart).length) return;
  const text = orderText();
  if (whatsappNumber) {
    location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  } else {
    await navigator.clipboard.writeText(text).catch(() => {});
    alert(labels[lang].copied);
  }
}

async function shareItem(id) {
  const item = findItem(id);
  if (!item) return;
  const url = new URL(location.href);
  url.searchParams.set('item', id);
  const text = `${item.name[lang]} · ${formatPrice(item.price)} · Las Veraneras`;
  if (navigator.share) await navigator.share({ title: item.name[lang], text, url: url.toString() }).catch(() => {});
  else {
    await navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
    alert(lang === 'es' ? 'Enlace copiado' : 'Link copied');
  }
}

async function init() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  } catch (e) {}
  try {
    const fresh = await fetch('data/menu.json?v=20260501-3', { cache: 'no-store' }).then(r => r.ok ? r.json() : null);
    if (fresh?.categories) menuData = fresh;
  } catch (e) {}
  renderAll();
  const item = new URLSearchParams(location.search).get('item');
  if (item) setTimeout(() => focusItem(item), 500);
}

Object.assign(window, { setLang, setCategory, render: renderMenu, addToCart, addCombo, changeQty, hideUpsell, toggleCart, toggleCartOpen, focusItem, surpriseMe, checkout, shareItem });
document.addEventListener('DOMContentLoaded', init);
