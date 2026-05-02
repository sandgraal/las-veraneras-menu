/* ===================================================================
   Las Veraneras — app.js  (Bougainvillea Nights)
   =================================================================== */
'use strict';

/* ── State ─────────────────────────────────────────────────────────── */
let lang = localStorage.getItem('lv-lang') || 'es';
let selected = 'all';
let menuData = { categories: [] };
let specials = [];
let siteConfig = {
  restaurantName: 'Las Veraneras',
  tagline: 'Sabores del corazón de Tucurrique',
  taglineEn: 'Flavors from the heart of Tucurrique',
  whatsappNumber: '',
  heroImage: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1600',
  address: 'Las Vueltas de Tucurrique, Cartago, Costa Rica',
  phone: '',
  hours: {},
  socialLinks: {}
};
let cart = JSON.parse(localStorage.getItem('lv-cart') || '{}');

/* ── i18n ───────────────────────────────────────────────────────────── */
const T = {
  es: {
    eyebrow: 'Restaurante · Las Vueltas de Tucurrique',
    seeMenu: 'Ver Menú',
    order: 'Pedir',
    orderWhatsapp: 'Pedir por WhatsApp',
    surprise: 'Sorpréndeme',
    aboutEyebrow: 'Nuestra historia',
    aboutHeading: 'El sabor de las montañas de Tucurrique',
    aboutBody: 'Nacimos en Las Vueltas de Tucurrique para llevar al plato los sabores auténticos de Costa Rica con un toque artesanal. Cada plato cuenta una historia de ingredientes frescos, recetas de familia y el calor de nuestra comunidad.',
    aboutBody2: 'Desde chifrijos tradicionales hasta platos gourmet — en Las Veraneras cada visita es una celebración.',
    specialsHeading: 'Especiales & Eventos',
    hoursTitle: 'Horario',
    followUs: 'Síguenos',
    total: 'Total',
    sendOrder: 'Enviar por WhatsApp',
    successTitle: '¡Pedido enviado!',
    successMsg: 'Tu pedido fue enviado a WhatsApp. Pronto te confirmamos.',
    newOrder: 'Nuevo pedido',
    home: 'Inicio',
    menu: 'Menú',
    specials: 'Especiales',
    all: 'Todo',
    featured: 'Recomendados',
    combos: 'Combos especiales',
    most: 'Más pedidos',
    popular: '🔥 Muy pedido',
    add: 'Agregar',
    noResults: 'No hay resultados',
    ready: '🚀 Pedido listo para enviar',
    empty: 'Sin items en el pedido',
    upsell: '¿Agregar algo más?',
    noWa: 'Configura el número de WhatsApp en el panel de admin (admin.html).',
    copied: 'Pedido copiado al portapapeles.',
    linkCopied: 'Enlace copiado',
    validUntil: 'Válido hasta',
    event: 'Evento',
    notes: 'Notas especiales...'
  },
  en: {
    eyebrow: 'Restaurant · Las Vueltas de Tucurrique',
    seeMenu: 'See Menu',
    order: 'Order',
    orderWhatsapp: 'Order via WhatsApp',
    surprise: 'Surprise me',
    aboutEyebrow: 'Our story',
    aboutHeading: 'The flavors of the Tucurrique mountains',
    aboutBody: 'We were born in Las Vueltas de Tucurrique to bring authentic Costa Rican flavors to the plate with an artisan touch. Every dish tells a story of fresh ingredients, family recipes and the warmth of our community.',
    aboutBody2: 'From traditional chifrijos to gourmet dishes — at Las Veraneras every visit is a celebration.',
    specialsHeading: 'Specials & Events',
    hoursTitle: 'Hours',
    followUs: 'Follow us',
    total: 'Total',
    sendOrder: 'Send via WhatsApp',
    successTitle: 'Order sent!',
    successMsg: 'Your order was sent to WhatsApp. We\'ll confirm shortly.',
    newOrder: 'New order',
    home: 'Home',
    menu: 'Menu',
    specials: 'Specials',
    all: 'All',
    featured: 'Top Picks',
    combos: 'Special Combos',
    most: 'Most ordered',
    popular: '🔥 Most ordered',
    add: 'Add',
    noResults: 'No results',
    ready: '🚀 Order ready to send',
    empty: 'No items in order',
    upsell: 'Add something else?',
    noWa: 'Configure the WhatsApp number in the admin panel (admin.html).',
    copied: 'Order copied to clipboard.',
    linkCopied: 'Link copied',
    validUntil: 'Valid until',
    event: 'Event',
    notes: 'Special notes...'
  }
};

/* ── Combos & Upsells data ──────────────────────────────────────────── */
const combos = [
  { id:'combo-snack', emoji:'🍔', name:{es:'Combo Antojo',en:'Craving Combo'}, description:{es:'Hamburguesa con papas + helado',en:'Burger & fries + ice cream'}, items:['burger','helado'], price:'4300', tag:{es:'Rápido y popular',en:'Fast & popular'} },
  { id:'combo-amigos', emoji:'🔥', name:{es:'Combo Amigos',en:'Friends Combo'}, description:{es:'Nachos + 3x1 tacos + salchipapas',en:'Nachos + loaded tacos + sausage fries'}, items:['nachos','tacos-arreglados','salchipapas'], price:'7200', tag:{es:'Para compartir',en:'Shareable'} },
  { id:'combo-casero', emoji:'🍽️', name:{es:'Combo Casero',en:'House Combo'}, description:{es:'Chifrijo + papas a la francesa',en:'Chifrijo + french fries'}, items:['chifrijo','papas'], price:'6000', tag:{es:'Recomendado',en:'Recommended'} }
];
const upsells = {
  burger:['helado','papas'], nachos:['mayo','tacos-arreglados'], chifrijo:['papas'],
  salchipapas:['mayo'], 'pollo-francesa':['papas'], 'arroz-camarones':['papas'],
  camarones:['papas'], tilapia:['papas']
};

/* ── Helpers ────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const allItems = () => menuData.categories.flatMap((c,ci) => c.items.map(i => ({...i, category:c, categoryIndex:ci})));
const findItem = id => allItems().find(i => i.id === id);
const fmt = v => '₡' + String(v||0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const t = key => (T[lang]||T.es)[key] || key;

function saveCart() { localStorage.setItem('lv-cart',JSON.stringify(cart)); renderAll(); }
function saveCartOnly() { localStorage.setItem('lv-cart',JSON.stringify(cart)); }

/* ── Config application ─────────────────────────────────────────────── */
function applyConfig(cfg) {
  siteConfig = { ...siteConfig, ...cfg };
  const num = cfg.whatsappNumber || '';
  const waHref = num ? `https://wa.me/${num.replace(/\D/g,'')}` : '#';
  // Wire all WhatsApp links
  ['navbar-wa','hero-wa','mobile-wa','wa-fab','footer-wa','bn-wa'].forEach(id => {
    const el = $(id);
    if (el) el.href = waHref;
  });
  // Hero image parallax bg
  const heroBg = $('hero-bg');
  if (heroBg && cfg.heroImage) heroBg.style.backgroundImage = `url('${cfg.heroImage}')`;
  // Tagline
  const ht = $('hero-tagline');
  if (ht) ht.textContent = lang === 'es' ? (cfg.tagline || '') : (cfg.taglineEn || cfg.tagline || '');
  // Footer
  const ft = $('footer-tagline');
  if (ft) ft.textContent = cfg.tagline || '';
  const fa = $('footer-address');
  if (fa && cfg.address) fa.textContent = '📍 ' + cfg.address;
  // Hours
  const hl = $('hours-list');
  if (hl && cfg.hours) {
    hl.innerHTML = Object.entries(cfg.hours).map(([day,hrs]) =>
      `<li><span>${day}</span><span>${hrs}</span></li>`
    ).join('');
  }
  // Social links — use DOM APIs and validate http/https to prevent XSS
  const sl = $('social-links');
  if (sl && cfg.socialLinks) {
    const allowedSchemes = ['http:', 'https:'];
    const makeLink = (url, label) => {
      if (!url) return null;
      try {
        const u = new URL(url);
        if (!allowedSchemes.includes(u.protocol)) return null;
      } catch { return null; }
      const a = document.createElement('a');
      a.href = url;
      a.className = 'social-link';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = label;
      return a;
    };
    sl.textContent = '';
    [
      makeLink(cfg.socialLinks.facebook, '📘 Facebook'),
      makeLink(cfg.socialLinks.instagram, '📸 Instagram'),
      makeLink(cfg.socialLinks.tiktok, '🎵 TikTok')
    ].forEach(a => { if (a) sl.appendChild(a); });
  }
  // OG image
  const ogImg = document.getElementById('og-image');
  if (ogImg && cfg.heroImage) ogImg.setAttribute('content', cfg.heroImage);
  // JSON-LD
  const ld = {
    '@context':'https://schema.org',
    '@type':'Restaurant',
    name: cfg.restaurantName || 'Las Veraneras',
    description: cfg.tagline || '',
    address: { '@type':'PostalAddress', addressLocality:'Las Vueltas de Tucurrique', addressRegion:'Cartago', addressCountry:'CR', streetAddress: cfg.address || '' },
    telephone: cfg.phone || '',
    servesCuisine: ['Costa Rican','French'],
    hasMenu: location.href,
    url: location.href
  };
  const ldEl = $('structured-data');
  if (ldEl) ldEl.textContent = JSON.stringify(ld);
}

/* ── WhatsApp click handler ─────────────────────────────────────────── */
function handleWaClick(e) {
  if (!siteConfig.whatsappNumber) {
    e.preventDefault();
    alert(t('noWa'));
  }
}

/* ── Language ───────────────────────────────────────────────────────── */
function setLang(l) {
  lang = l;
  localStorage.setItem('lv-lang', l);
  document.documentElement.lang = l;
  // Update button states
  ['btn-es','btn-en','mob-btn-es','mob-btn-en'].forEach(id => {
    const btn = $(id);
    if (btn) btn.classList.toggle('active', btn.id.includes(l === 'es' ? 'es' : 'en'));
  });
  // Update tagline
  const ht = $('hero-tagline');
  if (ht) ht.textContent = l === 'es' ? (siteConfig.tagline||'') : (siteConfig.taglineEn || siteConfig.tagline || '');
  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (T[l] && T[l][k]) el.textContent = T[l][k];
  });
  // Update order-notes placeholder
  const on = $('order-notes');
  if (on) on.placeholder = t('notes');
  // Re-render dynamic content
  renderAll();
}

/* ── Filters ─────────────────────────────────────────────────────────── */
function setCategory(id) { selected = id; renderAll(); }

function renderFilters() {
  const root = $('filters');
  if (!root) return;
  root.innerHTML = [
    `<button class="filter-btn ${selected==='all'?'active':''}" onclick="setCategory('all')">${t('all')}</button>`,
    ...menuData.categories.map((c,i) =>
      `<button class="filter-btn ${selected===String(i)?'active':''}" onclick="setCategory('${i}')">${c.emoji||''} ${c.name[lang]}</button>`)
  ].join('');
}

/* ── Specials ────────────────────────────────────────────────────────── */
function renderSpecials() {
  const section = $('specials-section');
  const row = $('specials-row');
  if (!section || !row) return;
  if (!specials.length) { section.classList.remove('has-items'); return; }
  section.classList.add('has-items');
  row.innerHTML = specials.map(s => {
    const title = (lang === 'en' ? s.titleEn || s.title : s.title) || '';
    const desc = (lang === 'en' ? s.descriptionEn || s.description : s.description) || '';
    const imgHtml = s.image ? `<img src="${s.image}" alt="${title||''}" width="300" height="160" loading="lazy">` : '';
    const priceHtml = s.price ? `<div class="special-price">${fmt(s.price)}</div>` : '';
    const untilHtml = s.validUntil ? `<span class="special-until">📅 ${t('validUntil')}: ${s.validUntil}</span>` : '';
    const eventBadge = s.isEvent ? `<span class="badge badge-featured" style="margin-left:.4rem">${t('event')}</span>` : '';
    return `<article class="special-card">
      ${imgHtml}
      <div class="special-body">
        <h3>${title} ${eventBadge}</h3>
        <p>${desc}</p>
        ${priceHtml}
        ${untilHtml}
      </div>
    </article>`;
  }).join('');
}

/* ── qty controls ────────────────────────────────────────────────────── */
function qtyControls(id) {
  const qty = cart[id]||0;
  if (!qty) return `<button class="add-btn" onclick="addToCart('${id}',true)">＋ ${t('add')}</button>`;
  return `<div class="stepper"><button onclick="changeQty('${id}',-1)">−</button><span>${qty}</span><button onclick="addToCart('${id}',false)">+</button></div>`;
}

/* ── Item card ───────────────────────────────────────────────────────── */
function itemCard(item, compact=false) {
  const badges = [];
  if (item.popular) badges.push(`<span class="badge badge-popular">${t('popular')}</span>`);
  if (item.featured && !compact) badges.push(`<span class="badge badge-featured">⭐ ${t('featured')}</span>`);
  if (item.badgeText) badges.push(`<span class="badge badge-custom">${item.badgeText}</span>`);
  const badgeHtml = badges.join(' ');
  const img = item.image
    ? `<img loading="lazy" src="${item.image}" alt="${item.name[lang]}" width="300" height="185" onerror="this.closest('.dish').classList.add('no-image')">`
    : '';
  const desc = item.description?.[lang] || '';
  return `<article class="dish${compact?' compact':''}" id="item-${item.id}">
    ${img}
    <div class="dish-body">
      ${badgeHtml}
      <h3>${item.name[lang]}</h3>
      <p>${desc}</p>
      <div class="dish-bottom">
        <span class="dish-price">${fmt(item.price)}</span>
        <div class="dish-actions">
          ${qtyControls(item.id)}
          <button class="share-btn" onclick="shareItem('${item.id}')" aria-label="Compartir">↗</button>
        </div>
      </div>
    </div>
  </article>`;
}

/* ── Combo card ──────────────────────────────────────────────────────── */
function comboCard(c) {
  return `<article class="combo-card">
    <div class="combo-card-inner">
      <div class="combo-top">
        <span style="font-size:1.6rem">${c.emoji}</span>
        <span class="combo-tag">${c.tag[lang]}</span>
      </div>
      <h3>${c.name[lang]}</h3>
      <p>${c.description[lang]}</p>
      <div class="combo-bottom">
        <span class="combo-price">${fmt(c.price)}</span>
        <button class="combo-add-btn" onclick="addCombo('${c.id}')">＋ ${t('add')}</button>
      </div>
    </div>
  </article>`;
}

/* ── Render sections ─────────────────────────────────────────────────── */
function renderConversion() {
  const root = $('conversion');
  if (!root) return;
  const popular = allItems().filter(i => i.popular).slice(0,6);
  root.innerHTML = `
    <div class="sec-title"><span>💸</span><h2>${t('combos')}</h2></div>
    <div class="combo-row">${combos.map(comboCard).join('')}</div>
    ${popular.length ? `
      <div class="sec-title"><span>🔥</span><h2>${t('most')}</h2></div>
      <div class="popular-row">${popular.map(i =>
        `<button onclick="focusItem('${i.id}')">${i.name[lang]} <b>${fmt(i.price)}</b></button>`
      ).join('')}</div>` : ''}`;
}

function renderFeatured() {
  const root = $('featured');
  if (!root) return;
  const featured = allItems().filter(i => i.featured).slice(0,8);
  root.innerHTML = featured.length
    ? `<div class="sec-title"><span>⭐</span><h2>${t('featured')}</h2></div>
       <div class="featured-row">${featured.map(i => itemCard(i,true)).join('')}</div>`
    : '';
}

function renderMenu() {
  const root = $('menu');
  if (!root) return;
  const search = ($('search')?.value||'').trim().toLowerCase();
  let html = '';
  menuData.categories.forEach((cat,idx) => {
    if (selected !== 'all' && selected !== String(idx)) return;
    const matched = cat.items.filter(item => {
      if (!search) return true;
      return [item.name.es||'', item.name.en||'', item.description?.es||'', item.description?.en||''].join(' ').toLowerCase().includes(search);
    });
    if (!matched.length) return;
    html += `<div class="category-block">
      <div class="sec-title"><span>${cat.emoji||'🍴'}</span><h2>${cat.name[lang]}</h2></div>
      <div class="grid">${matched.map(item => itemCard(item)).join('')}</div>
    </div>`;
  });
  root.innerHTML = html || `<p class="empty-msg">${t('noResults')}</p>`;
}

function renderCart() {
  const items = allItems();
  const entries = Object.entries(cart).filter(([,q]) => q > 0);
  const cartItemsEl = $('cart-items');
  if (cartItemsEl) {
    if (!entries.length) {
      cartItemsEl.innerHTML = `<p class="cart-empty">${t('empty')}</p>`;
    } else {
      cartItemsEl.innerHTML = entries.map(([id,qty]) => {
        const item = items.find(i => i.id === id);
        if (!item) return '';
        const thumb = item.image
          ? `<img class="cart-thumb" src="${item.image}" alt="${item.name[lang]}" width="44" height="44" loading="lazy">`
          : `<div class="cart-thumb"></div>`;
        return `<div class="cart-row">
          ${thumb}
          <div class="cart-row-info">
            <div class="cart-row-name">${item.name[lang]}</div>
            <div class="cart-row-price">${fmt(Number(item.price)*qty)}</div>
          </div>
          <div class="cart-stepper">
            <button onclick="changeQty('${id}',-1)" aria-label="Quitar uno">−</button>
            <span>${qty}</span>
            <button onclick="changeQty('${id}',1)" aria-label="Agregar uno">+</button>
          </div>
        </div>`;
      }).join('');
    }
  }
  const total = entries.reduce((sum,[id,qty]) => {
    const item = items.find(i => i.id === id);
    return sum + (item ? Number(item.price)*qty : 0);
  }, 0);
  const ct = $('cart-total'); if (ct) ct.textContent = fmt(total);
  const count = entries.reduce((s,[,q]) => s+q, 0);
  const cc = $('cart-count'); if (cc) cc.textContent = count;
  const cfc = $('cart-fab-count'); if (cfc) cfc.textContent = count;
  // Pulsing ring on cart fab when items
  const fab = $('cart-fab');
  if (fab) fab.classList.toggle('pulsing', count > 0);
}

function renderAll() { renderFilters(); renderConversion(); renderFeatured(); renderMenu(); renderCart(); }

/* ── Cart mutations ──────────────────────────────────────────────────── */
function addToCart(id, showUpsell=true) {
  cart[id] = (cart[id]||0) + 1;
  saveCart();
  const fab = $('cart-fab');
  if (fab) { fab.classList.add('bounce'); setTimeout(()=>fab.classList.remove('bounce'),400); }
  if (showUpsell) showUpsellPanel(id);
}

function addCombo(id) {
  const combo = combos.find(c => c.id === id);
  if (!combo) return;
  combo.items.forEach(itemId => { cart[itemId] = (cart[itemId]||0)+1; });
  saveCart();
  $('cart')?.classList.add('open');
  $('cart-backdrop')?.classList.add('show');
}

function changeQty(id, delta) {
  cart[id] = (cart[id]||0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
}

/* ── Cart panel ──────────────────────────────────────────────────────── */
function toggleCart() {
  const c = $('cart'), b = $('cart-backdrop');
  if (!c) return;
  const open = c.classList.toggle('open');
  b?.classList.toggle('show', open);
}

/* ── Upsell ──────────────────────────────────────────────────────────── */
function showUpsellPanel(id) {
  const picks = (upsells[id]||[]).map(findItem).filter(Boolean).slice(0,3);
  const panel = $('upsell');
  if (!picks.length || !panel) return;
  panel.innerHTML = `
    <div class="upsell-handle"></div>
    <button class="upsell-close" onclick="hideUpsell()">✕</button>
    <h3>${t('upsell')}</h3>
    <div class="upsell-items">
      ${picks.map(i => `<button class="upsell-item-btn" onclick="addToCart('${i.id}',false);hideUpsell()">
        <span>${i.name[lang]}</span>
        <strong>${fmt(i.price)}</strong>
      </button>`).join('')}
    </div>`;
  panel.classList.add('open');
  clearTimeout(panel._timer);
  panel._timer = setTimeout(() => panel.classList.remove('open'), 7000);
}

function hideUpsell() { $('upsell')?.classList.remove('open'); }

/* ── Checkout ────────────────────────────────────────────────────────── */
function orderText() {
  const items = allItems();
  const lines = Object.entries(cart).filter(([,q])=>q>0).map(([id,qty]) => {
    const item = items.find(i => i.id === id);
    return item ? `${qty}x ${item.name.es} — ${fmt(Number(item.price)*qty)}` : '';
  }).filter(Boolean);
  const total = Object.entries(cart).reduce((s,[id,q]) => {
    const it = items.find(i => i.id === id);
    return s + (it ? Number(it.price)*q : 0);
  }, 0);
  const notes = $('order-notes')?.value.trim();
  return `Hola Las Veraneras! 🌺\n\n*Pedido:*\n${lines.join('\n')}\n\n*Total: ${fmt(total)}*${notes?'\n\n_Notas: '+notes+'_':''}`;
}

async function checkout() {
  if (!Object.keys(cart).some(k => (cart[k]||0)>0)) return;
  const text = orderText();
  const num = siteConfig.whatsappNumber;
  if (num) {
    const clean = num.replace(/\D/g,'');
    location.href = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    setTimeout(showSuccess, 1500);
  } else {
    try { await navigator.clipboard.writeText(text); } catch(e) {}
    alert(t('copied'));
  }
}

function showSuccess() {
  const el = $('order-success');
  if (el) el.classList.add('show');
  // Clear cart
  cart = {};
  saveCartOnly();
  renderCart();
}

function closeSuccess() {
  const el = $('order-success');
  if (el) el.classList.remove('show');
  cart = {};
  saveCartOnly();
  renderAll();
  $('cart')?.classList.remove('open');
  $('cart-backdrop')?.classList.remove('show');
}

/* ── Focus / share ───────────────────────────────────────────────────── */
function focusItem(id) {
  const el = $('item-'+id);
  if (!el) { selected='all'; renderAll(); setTimeout(()=>focusItem(id),100); return; }
  el.scrollIntoView({behavior:'smooth',block:'center'});
  el.classList.add('spotlight');
  setTimeout(()=>el.classList.remove('spotlight'),2500);
}

function surpriseMe() {
  const items = allItems();
  if (!items.length) return;
  focusItem(items[Math.floor(Math.random()*items.length)].id);
}

async function shareItem(id) {
  const item = findItem(id);
  if (!item) return;
  const url = new URL(location.href);
  url.searchParams.set('item', id);
  const text = `${item.name[lang]} · ${fmt(item.price)} · Las Veraneras`;
  if (navigator.share) {
    await navigator.share({title:item.name[lang], text, url:url.toString()}).catch(()=>{});
  } else {
    await navigator.clipboard.writeText(`${text} ${url}`).catch(()=>{});
    alert(t('linkCopied'));
  }
}

/* ── Mobile menu ─────────────────────────────────────────────────────── */
function toggleMobileMenu() {
  const m = $('mobile-menu'), h = $('hamburger');
  if (!m) return;
  const open = m.classList.toggle('open');
  h?.classList.toggle('open', open);
}

/* ── Scroll observers ────────────────────────────────────────────────── */
function initScrollObservers() {
  // Navbar scrolled class
  window.addEventListener('scroll', () => {
    $('navbar')?.classList.toggle('scrolled', window.scrollY > 10);
  }, {passive:true});

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, {threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── Pull-to-refresh ─────────────────────────────────────────────────── */
function initPullToRefresh() {
  let startY = 0;
  document.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, {passive:true});
  document.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - startY;
    if (dy > 80 && window.scrollY < 5) loadData();
  }, {passive:true});
}

/* ── Data loading ────────────────────────────────────────────────────── */
async function loadData() {
  try {
    const [menuRes, configRes, specialsRes] = await Promise.all([
      fetch('data/menu.json', {cache:'no-store'}),
      fetch('data/config.json', {cache:'no-store'}),
      fetch('data/specials.json', {cache:'no-store'})
    ]);
    if (menuRes.ok) { const d = await menuRes.json(); if (d?.categories) menuData = d; }
    if (configRes.ok) { const d = await configRes.json(); if (d) applyConfig(d); }
    if (specialsRes.ok) { const d = await specialsRes.json(); if (Array.isArray(d)) specials = d; }
  } catch(e) {
    console.warn('Las Veraneras: failed to load data', e);
  }
}

/* ── Init ────────────────────────────────────────────────────────────── */
async function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }

  await loadData();
  setLang(lang); // apply initial language
  renderSpecials();
  renderAll();

  // Deep link to item
  const item = new URLSearchParams(location.search).get('item');
  if (item) setTimeout(()=>focusItem(item), 600);

  initScrollObservers();
  initPullToRefresh();
}

/* ── Exports ─────────────────────────────────────────────────────────── */
Object.assign(window, {
  setLang, setCategory, renderMenu, addToCart, addCombo, changeQty,
  hideUpsell, toggleCart, focusItem, surpriseMe, checkout, shareItem,
  handleWaClick, toggleMobileMenu, closeSuccess, loadData
});

document.addEventListener('DOMContentLoaded', init);
