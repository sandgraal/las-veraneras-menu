/* ===================================================================
   Las Veraneras — app.js  (Bougainvillea Nights)
   =================================================================== */
'use strict';

/* ── State ─────────────────────────────────────────────────────────── */
let lang = 'es'; // real initial value chosen in init() via detectInitialLang()
let selected = 'all';
let menuData = { categories: [] };
let comboData = [];
let specials = [];
let activeTag = 'all';
let activeAllergen = 'all';
let openDetailId = null;
let siteConfig = {
  restaurantName: 'Las Veraneras',
  tagline: 'Bistro tropical franco-tico en el corazón de Tucurrique',
  taglineEn: 'A tropical French-Tico bistro in the heart of Tucurrique',
  taglineFr: 'Un bistrot franco-tico tropical au coeur de Tucurrique',
  whatsappNumber: '',
  heroImage: 'https://images.pexels.com/photos/34980252/pexels-photo-34980252.jpeg?auto=compress&cs=tinysrgb&w=1800',
  ownerName: 'Pierre Blondin',
  storyImage: 'https://images.unsplash.com/photo-1726859190454-fbbc19e8202d?auto=format&fit=crop&w=1400&q=85',
  address: 'Las Vueltas de Tucurrique, Cartago, Costa Rica',
  phone: '',
  hours: {},
  socialLinks: {},
  geo: {},
  brandStory: {},
  availableLanguages: ['es','en','fr']
};
let cart = JSON.parse(localStorage.getItem('lv-cart') || '{}');

/* ── i18n ───────────────────────────────────────────────────────────── */
const T = {
  es: {
    eyebrow: 'Restaurante · Las Vueltas de Tucurrique',
    seeMenu: 'Ver Menú',
    order: 'Pedir',
    orderWhatsapp: 'Pedir por WhatsApp',
    surprise: 'Plato sorpresa',
    heroNote: 'Cocina tica con oficio francés, veraneras en flor y pedido directo por WhatsApp.',
    openNow: 'Abierto ahora',
    closedNow: 'Cerrado ahora',
    todayHours: 'Horario de hoy',
    frenchTouch: 'Toque francés',
    localRoots: 'Raíz tica',
    quickOrder: 'Pedido rápido',
    aboutEyebrow: 'Nuestra historia',
    aboutHeading: 'Francia en la mesa, Tucurrique en el corazón',
    aboutBody: 'Las Veraneras une el oficio de un cocinero francés viviendo en Costa Rica con la generosidad de las montañas de Tucurrique.',
    aboutBody2: 'Aquí la salsa francesa se sirve con arroz blanco, las crepas conviven con chifrijo, y cada plato busca sentirse familiar sin perder el detalle artesanal.',
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
    popular: 'Muy pedido',
    add: 'Agregar',
    details: 'Detalles',
    close: 'Cerrar',
    pairWith: 'Combina con',
    addNote: 'Agregar con nota',
    addons: 'Extras y complementos',
    bestFor: 'Ideal para',
    allergens: 'Alérgenos',
    dietary: 'Estilo',
    filters: 'Filtros útiles',
    clearFilters: 'Limpiar filtros',
    allFilters: 'Todos',
    frenchSpecialty: 'Especialidad francesa',
    localFavorite: 'Favorito local',
    quickLunch: 'Almuerzo rápido',
    sharing: 'Para compartir',
    dessert: 'Postre',
    vegetarian: 'Vegetariano',
    noAllergens: 'Sin alérgenos marcados',
    noResults: 'No hay resultados',
    ready: 'Pedido listo para enviar',
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
    surprise: 'Surprise dish',
    heroNote: 'Costa Rican cooking with French craft, bougainvillea in bloom, and direct WhatsApp ordering.',
    openNow: 'Open now',
    closedNow: 'Closed now',
    todayHours: 'Today',
    frenchTouch: 'French touch',
    localRoots: 'Costa Rican roots',
    quickOrder: 'Fast order',
    aboutEyebrow: 'Our story',
    aboutHeading: 'France at the table, Tucurrique at heart',
    aboutBody: 'Las Veraneras blends the craft of a French cook living in Costa Rica with the warmth of the Tucurrique mountains.',
    aboutBody2: 'French sauces sit beside white rice, crepes share the table with chifrijo, and every dish is designed to feel familiar while still carrying a handmade touch.',
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
    popular: 'Most ordered',
    add: 'Add',
    details: 'Details',
    close: 'Close',
    pairWith: 'Pair with',
    addNote: 'Add with note',
    addons: 'Add-ons',
    bestFor: 'Best for',
    allergens: 'Allergens',
    dietary: 'Style',
    filters: 'Useful filters',
    clearFilters: 'Clear filters',
    allFilters: 'All',
    frenchSpecialty: 'French specialty',
    localFavorite: 'Local favorite',
    quickLunch: 'Quick lunch',
    sharing: 'Shareable',
    dessert: 'Dessert',
    vegetarian: 'Vegetarian',
    noAllergens: 'No allergens marked',
    noResults: 'No results',
    ready: 'Order ready to send',
    empty: 'No items in order',
    upsell: 'Add something else?',
    noWa: 'Configure the WhatsApp number in the admin panel (admin.html).',
    copied: 'Order copied to clipboard.',
    linkCopied: 'Link copied',
    validUntil: 'Valid until',
    event: 'Event',
    notes: 'Special notes...'
  },
  fr: {
    eyebrow: 'Restaurant · Las Vueltas de Tucurrique',
    seeMenu: 'Voir le menu',
    order: 'Commander',
    orderWhatsapp: 'Commander sur WhatsApp',
    surprise: 'Plat surprise',
    heroNote: 'Cuisine tica avec savoir-faire francais, veraneras en fleur et commande directe par WhatsApp.',
    openNow: 'Ouvert maintenant',
    closedNow: 'Ferme maintenant',
    todayHours: 'Aujourd hui',
    frenchTouch: 'Touche francaise',
    localRoots: 'Racines ticas',
    quickOrder: 'Commande rapide',
    aboutEyebrow: 'Notre histoire',
    aboutHeading: 'La France a table, Tucurrique au coeur',
    aboutBody: 'Las Veraneras marie le savoir-faire d un cuisinier francais installe au Costa Rica avec la chaleur des montagnes de Tucurrique.',
    aboutBody2: 'Les sauces francaises accompagnent le riz blanc, les crepes partagent la table avec le chifrijo, et chaque plat garde une touche artisanale.',
    specialsHeading: 'Specials et evenements',
    hoursTitle: 'Horaires',
    followUs: 'Suivez-nous',
    total: 'Total',
    sendOrder: 'Envoyer sur WhatsApp',
    successTitle: 'Commande envoyee!',
    successMsg: 'Votre commande a ete envoyee sur WhatsApp. Nous confirmerons bientot.',
    newOrder: 'Nouvelle commande',
    home: 'Accueil',
    menu: 'Menu',
    specials: 'Specials',
    all: 'Tout',
    featured: 'Recommandes',
    combos: 'Combos speciaux',
    most: 'Les plus demandes',
    popular: 'Tres demande',
    add: 'Ajouter',
    details: 'Details',
    close: 'Fermer',
    pairWith: 'Associer avec',
    addNote: 'Ajouter avec note',
    addons: 'Extras et compléments',
    bestFor: 'Ideal pour',
    allergens: 'Allergenes',
    dietary: 'Style',
    filters: 'Filtres utiles',
    clearFilters: 'Effacer',
    allFilters: 'Tous',
    frenchSpecialty: 'Specialite francaise',
    localFavorite: 'Favori local',
    quickLunch: 'Dejeuner rapide',
    sharing: 'A partager',
    dessert: 'Dessert',
    vegetarian: 'Vegetarien',
    noAllergens: 'Aucun allergene indique',
    noResults: 'Aucun resultat',
    ready: 'Commande prete a envoyer',
    empty: 'Aucun article dans la commande',
    upsell: 'Ajouter autre chose?',
    noWa: 'Configurez le numero WhatsApp dans le panneau admin (admin.html).',
    copied: 'Commande copiee dans le presse-papiers.',
    linkCopied: 'Lien copie',
    validUntil: 'Valable jusqu au',
    event: 'Evenement',
    notes: 'Notes speciales...'
  }
};

/* ── Upsells data ───────────────────────────────────────────────────── */
const upsells = {
  burger:['helado','papas'], nachos:['mayo','tacos-arreglados'], chifrijo:['papas'],
  salchipapas:['mayo'], 'pollo-francesa':['papas'], 'arroz-camarones':['papas'],
  camarones:['papas'], tilapia:['papas']
};

/* ── Helpers ────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const allItems = () => menuData.categories.flatMap((c,ci) => (c.items||[]).map(i => ({...i, category:c, categoryIndex:ci})));
const findItem = id => allItems().find(i => i.id === id);
const fmt = v => '₡' + String(v||0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const t = key => (T[lang]||T.es)[key] || key;
const bestForLabels = {
  'french-specialty':'frenchSpecialty',
  'local-favorite':'localFavorite',
  'quick-lunch':'quickLunch',
  sharing:'sharing',
  dessert:'dessert'
};
const dietaryLabels = { vegetarian:'vegetarian' };

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
}

function jsArg(value) {
  return esc(JSON.stringify(value ?? null));
}

function localized(value, fallback='') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value[lang] || value.es || value.en || value.fr || fallback;
}

function runTransition(update) {
  if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return document.startViewTransition(update);
  }
  update();
  return null;
}

function languageEnabled(code) {
  const langs = siteConfig.availableLanguages || ['es','en','fr'];
  return langs.includes(code);
}

function todayKey() {
  return ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][new Date().getDay()];
}

function currentOpenState() {
  const raw = siteConfig.hours?.[todayKey()];
  if (!raw || /cerr/i.test(raw)) return { open:false, label: raw || t('closedNow') };
  const match = raw.match(/(\d{1,2}):(\d{2})[–-](\d{1,2}):(\d{2})/);
  if (!match) return { open:false, label: raw };
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  return { open: cur >= start && cur <= end, label: raw };
}

function saveCart() { localStorage.setItem('lv-cart',JSON.stringify(cart)); renderAll(); }
function saveCartOnly() { localStorage.setItem('lv-cart',JSON.stringify(cart)); }

/* ── Config application ─────────────────────────────────────────────── */
function applyConfig(cfg) {
  siteConfig = { ...siteConfig, ...cfg };
  if (cfg.socialLinks) siteConfig.socialLinks = { ...(siteConfig.socialLinks||{}), ...cfg.socialLinks };
  if (cfg.geo) siteConfig.geo = { ...(siteConfig.geo||{}), ...cfg.geo };
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
  if (ht) ht.textContent = localized({ es: cfg.tagline, en: cfg.taglineEn, fr: cfg.taglineFr }, cfg.tagline || '');
  const heroNote = $('hero-note');
  if (heroNote) heroNote.textContent = t('heroNote');
  const heroStatus = $('hero-status');
  if (heroStatus) {
    const state = currentOpenState();
    heroStatus.innerHTML = `<span class="status-dot ${state.open ? 'open' : ''}"></span>${state.open ? t('openNow') : t('closedNow')} · ${t('todayHours')}: ${esc(state.label)}`;
  }
  // Footer
  const ft = $('footer-tagline');
  if (ft) ft.textContent = localized({ es: cfg.tagline, en: cfg.taglineEn, fr: cfg.taglineFr }, cfg.tagline || '');
  const fa = $('footer-address');
  if (fa && cfg.address) fa.textContent = cfg.address;
  const storyImg = $('story-image');
  if (storyImg && (cfg.storyImage || cfg.heroImage)) storyImg.src = cfg.storyImage || cfg.heroImage;
  const aboutBody = $('about-body');
  if (aboutBody) aboutBody.textContent = localized(cfg.brandStory, t('aboutBody'));
  const owner = $('owner-name');
  if (owner) owner.textContent = cfg.ownerName || 'Las Veraneras';
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
  const twImg = document.getElementById('twitter-image');
  if (twImg && cfg.heroImage) twImg.setAttribute('content', cfg.heroImage);
  // JSON-LD
  const menuGraph = {
    '@type':'Menu',
    name: `${cfg.restaurantName || 'Las Veraneras'} Menu`,
    hasMenuSection: (menuData.categories || []).map(cat => ({
      '@type':'MenuSection',
      name: localized(cat.name, cat.id),
      hasMenuItem: (cat.items || []).map(item => ({
        '@type':'MenuItem',
        name: localized(item.name, item.id),
        description: localized(item.description, ''),
        image: item.image || undefined,
        offers: {
          '@type':'Offer',
          price: String(item.price || ''),
          priceCurrency: 'CRC'
        }
      }))
    }))
  };
  const ld = {
    '@context':'https://schema.org',
    '@type':'Restaurant',
    name: cfg.restaurantName || 'Las Veraneras',
    description: localized({ es: cfg.tagline, en: cfg.taglineEn, fr: cfg.taglineFr }, cfg.tagline || ''),
    address: { '@type':'PostalAddress', addressLocality:'Las Vueltas de Tucurrique', addressRegion:'Cartago', addressCountry:'CR', streetAddress: cfg.address || '' },
    telephone: cfg.phone || '',
    openingHours: Object.values(cfg.hours || {}),
    servesCuisine: ['Costa Rican','French','French-Costa Rican'],
    hasMenu: menuGraph,
    url: location.href
  };
  if (cfg.geo?.latitude && cfg.geo?.longitude) {
    ld.geo = { '@type':'GeoCoordinates', latitude: cfg.geo.latitude, longitude: cfg.geo.longitude };
  }
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
// Choose the initial language: explicit ?lang= link > saved choice >
// visitor's browser language > Spanish. Called once at init after config loads.
function detectInitialLang() {
  const enabled = siteConfig.availableLanguages || ['es', 'en', 'fr'];
  const norm = c => String(c || '').trim().slice(0, 2).toLowerCase();
  // 1. Explicit ?lang= (shareable per-language links / hreflang targets)
  const qp = norm(new URLSearchParams(location.search).get('lang'));
  if (qp && enabled.includes(qp)) return qp;
  // 2. Previously chosen language (manual switcher persists this)
  const saved = norm(localStorage.getItem('lv-lang'));
  if (saved && enabled.includes(saved)) return saved;
  // 3. Visitor's browser languages, in preference order
  const navLangs = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || ''];
  for (const l of navLangs) {
    const base = norm(l);
    if (enabled.includes(base)) return base;
  }
  // 4. Fallback to Spanish (primary local language)
  return 'es';
}

function setLang(l) {
  if (!languageEnabled(l)) l = 'es';
  lang = l;
  localStorage.setItem('lv-lang', l);
  document.documentElement.lang = l;
  // Update button states
  ['btn-es','btn-en','btn-fr','mob-btn-es','mob-btn-en','mob-btn-fr'].forEach(id => {
    const btn = $(id);
    if (btn) btn.classList.toggle('active', btn.id.endsWith(l));
  });
  // Update tagline
  const ht = $('hero-tagline');
  if (ht) ht.textContent = localized({ es:siteConfig.tagline, en:siteConfig.taglineEn, fr:siteConfig.taglineFr }, siteConfig.tagline || '');
  const heroNote = $('hero-note');
  if (heroNote) heroNote.textContent = t('heroNote');
  const heroStatus = $('hero-status');
  if (heroStatus) {
    const state = currentOpenState();
    heroStatus.innerHTML = `<span class="status-dot ${state.open ? 'open' : ''}"></span>${state.open ? t('openNow') : t('closedNow')} · ${t('todayHours')}: ${esc(state.label)}`;
  }
  const aboutBody = $('about-body');
  if (aboutBody) aboutBody.textContent = localized(siteConfig.brandStory, t('aboutBody'));
  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (T[l] && T[l][k]) el.textContent = T[l][k];
  });
  // Update order-notes placeholder
  const on = $('order-notes');
  if (on) on.placeholder = t('notes');
  // Re-render dynamic content
  runTransition(renderAll);
}

/* ── Filters ─────────────────────────────────────────────────────────── */
function setCategory(id) { selected = id; runTransition(renderAll); }
function setTag(tag) { activeTag = tag; runTransition(renderAll); }
function setAllergenFilter(value) { activeAllergen = value; runTransition(renderAll); }
function clearMenuFilters() {
  selected = 'all';
  activeTag = 'all';
  activeAllergen = 'all';
  const search = $('search');
  if (search) search.value = '';
  runTransition(renderAll);
}

function renderFilters() {
  const root = $('filters');
  if (!root) return;
  root.innerHTML = [
    `<button class="filter-btn ${selected==='all'?'active':''}" onclick="setCategory('all')" aria-pressed="${selected==='all'}">${t('all')}</button>`,
    ...menuData.categories.map((c,i) =>
      `<button class="filter-btn ${selected===String(i)?'active':''}" onclick="setCategory('${i}')" aria-pressed="${selected===String(i)}">${esc(localized(c.name,c.id))}</button>`)
  ].join('');
  renderSmartFilters();
}

function renderSmartFilters() {
  const root = $('smart-filters');
  if (!root) return;
  const items = allItems();
  const tags = Array.from(new Set(items.flatMap(i => i.bestFor || []))).filter(Boolean);
  const allergens = Array.from(new Set(items.flatMap(i => i.allergens || []))).filter(Boolean);
  const allActive = activeTag==='all' && activeAllergen==='all';
  const tagButtons = tags.map(tag => `<button class="smart-chip ${activeTag===tag?'active':''}" onclick="setTag(${jsArg(tag)})" aria-pressed="${activeTag===tag}">${esc(t(bestForLabels[tag] || tag))}</button>`).join('');
  const allergenButtons = allergens.map(a => `<button class="smart-chip allergen ${activeAllergen===a?'active':''}" onclick="setAllergenFilter(${jsArg(a)})" aria-pressed="${activeAllergen===a}">${esc(a)}</button>`).join('');
  root.innerHTML = `
    <div class="smart-filter-row">
      <span>${t('filters')}</span>
      <button class="smart-chip ${allActive ? 'active' : ''}" onclick="clearMenuFilters()" aria-pressed="${allActive}">${t('allFilters')}</button>
      ${tagButtons}
    </div>
    ${allergens.length ? `<div class="smart-filter-row"><span>${t('allergens')}</span><button class="smart-chip ${activeAllergen==='all'?'active':''}" onclick="setAllergenFilter('all')" aria-pressed="${activeAllergen==='all'}">${t('allFilters')}</button>${allergenButtons}</div>` : ''}
    ${(activeTag !== 'all' || activeAllergen !== 'all' || ($('search')?.value || '').trim()) ? `<button class="clear-filter-btn" onclick="clearMenuFilters()">${t('clearFilters')}</button>` : ''}`;
}

/* ── Specials ────────────────────────────────────────────────────────── */
function renderSpecials() {
  const section = $('specials-section');
  const row = $('specials-row');
  if (!section || !row) return;
  if (!specials.length) { section.classList.remove('has-items'); return; }
  section.classList.add('has-items');
  row.innerHTML = specials.map(s => {
    const title = localized({ es:s.title, en:s.titleEn, fr:s.titleFr }, s.title || '');
    const desc = localized({ es:s.description, en:s.descriptionEn, fr:s.descriptionFr }, s.description || '');
    const imgHtml = s.image ? `<img src="${esc(s.image)}" alt="${esc(title||'')}" width="300" height="160" loading="lazy">` : '';
    const priceHtml = s.price ? `<div class="special-price">${fmt(s.price)}</div>` : '';
    const untilHtml = s.validUntil ? `<span class="special-until">📅 ${t('validUntil')}: ${s.validUntil}</span>` : '';
    const eventBadge = s.isEvent ? `<span class="badge badge-featured" style="margin-left:.4rem">${t('event')}</span>` : '';
    return `<article class="special-card">
      ${imgHtml}
      <div class="special-body">
        <h3>${esc(title)} ${eventBadge}</h3>
        <p>${esc(desc)}</p>
        ${priceHtml}
        ${untilHtml}
      </div>
    </article>`;
  }).join('');
}

/* ── qty controls ────────────────────────────────────────────────────── */
function qtyControls(id) {
  const qty = cart[id]||0;
  if (!qty) return `<button class="add-btn" onclick="addToCart(${jsArg(id)},true)">＋ ${t('add')}</button>`;
  return `<div class="stepper"><button onclick="changeQty(${jsArg(id)},-1)">−</button><span>${qty}</span><button onclick="addToCart(${jsArg(id)},false)">+</button></div>`;
}

/* ── Item card ───────────────────────────────────────────────────────── */
function itemCard(item, compact=false) {
  const badges = [];
  if (item.popular) badges.push(`<span class="badge badge-popular">${t('popular')}</span>`);
  if (item.featured && !compact) badges.push(`<span class="badge badge-featured">${t('featured')}</span>`);
  if ((item.bestFor||[]).includes('french-specialty')) badges.push(`<span class="badge badge-french">${t('frenchTouch')}</span>`);
  if (item.badgeText) badges.push(`<span class="badge badge-custom">${esc(item.badgeText)}</span>`);
  const badgeHtml = badges.join(' ');
  const name = localized(item.name, item.id);
  const desc = localized(item.description, '');
  const alt = localized(item.photoAlt, name);
  const img = item.image
    ? `<img loading="lazy" src="${esc(item.image)}" alt="${esc(alt)}" width="300" height="185" onerror="this.closest('.dish').classList.add('no-image')">`
    : '';
  const tags = [...(item.bestFor||[]).slice(0,2), ...(item.dietaryTags||[]).slice(0,1)]
    .map(tag => `<span>${esc(t(bestForLabels[tag] || dietaryLabels[tag] || tag))}</span>`).join('');
  return `<article class="dish${compact?' compact':''}" id="item-${esc(item.id)}">
    <button class="dish-media" onclick="openDishDetail(${jsArg(item.id)})" aria-label="${esc(t('details'))}: ${esc(name)}">${img}</button>
    <div class="dish-body">
      ${badgeHtml}
      <h3>${esc(name)}</h3>
      <p>${esc(desc)}</p>
      ${tags ? `<div class="dish-tags">${tags}</div>` : ''}
      <div class="dish-bottom">
        <span class="dish-price">${fmt(item.price)}</span>
        <div class="dish-actions">
          <button class="details-btn" onclick="openDishDetail(${jsArg(item.id)})">${t('details')}</button>
          ${qtyControls(item.id)}
          <button class="share-btn" onclick="shareItem(${jsArg(item.id)})" aria-label="Compartir">↗</button>
        </div>
      </div>
    </div>
  </article>`;
}

/* ── Combo card ──────────────────────────────────────────────────────── */
function comboCard(c) {
  const name = localized(c.name, c.id);
  const desc = localized(c.description, '');
  const tag = localized(c.tag, '');
  return `<article class="combo-card">
    <div class="combo-card-inner">
      <div class="combo-top">
        <span class="combo-mark">LV</span>
        <span class="combo-tag">${esc(tag)}</span>
      </div>
      <h3>${esc(name)}</h3>
      <p>${esc(desc)}</p>
      <div class="combo-bottom">
        <span class="combo-price">${fmt(c.price)}</span>
        <button class="combo-add-btn" onclick="addCombo(${jsArg(c.id)})">＋ ${t('add')}</button>
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
    ${comboData.length ? `<div class="sec-title"><span></span><h2>${t('combos')}</h2></div>
    <div class="combo-row">${comboData.map(comboCard).join('')}</div>` : ''}
    ${popular.length ? `
      <div class="sec-title"><span></span><h2>${t('most')}</h2></div>
      <div class="popular-row">${popular.map(i =>
        `<button onclick="focusItem(${jsArg(i.id)})">${esc(localized(i.name,i.id))} <b>${fmt(i.price)}</b></button>`
      ).join('')}</div>` : ''}`;
}

function renderFeatured() {
  const root = $('featured');
  if (!root) return;
  const featured = allItems().filter(i => i.featured).slice(0,8);
  root.innerHTML = featured.length
    ? `<div class="sec-title"><span></span><h2>${t('featured')}</h2></div>
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
    const matched = (cat.items || []).filter(item => {
      if (activeTag !== 'all' && !(item.bestFor||[]).includes(activeTag) && !(item.dietaryTags||[]).includes(activeTag)) return false;
      if (activeAllergen !== 'all' && !(item.allergens||[]).includes(activeAllergen)) return false;
      if (!search) return true;
      return [
        item.name?.es||'', item.name?.en||'', item.name?.fr||'',
        item.description?.es||'', item.description?.en||'', item.description?.fr||'',
        localized(item.story,''), localized(item.frenchInfluence,'')
      ].join(' ').toLowerCase().includes(search);
    });
    if (!matched.length) return;
    html += `<div class="category-block menu-chunk">
      <div class="sec-title"><span></span><h2>${esc(localized(cat.name,cat.id))}</h2></div>
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
        const name = localized(item.name, item.id);
        const thumb = item.image
          ? `<img class="cart-thumb" src="${esc(item.image)}" alt="${esc(name)}" width="44" height="44" loading="lazy">`
          : `<div class="cart-thumb"></div>`;
        return `<div class="cart-row">
          ${thumb}
          <div class="cart-row-info">
            <div class="cart-row-name">${esc(name)}</div>
            <div class="cart-row-price">${fmt(Number(item.price)*qty)}</div>
          </div>
          <div class="cart-stepper">
            <button onclick="changeQty(${jsArg(id)},-1)" aria-label="Quitar uno">−</button>
            <span>${qty}</span>
            <button onclick="changeQty(${jsArg(id)},1)" aria-label="Agregar uno">+</button>
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

function renderAll() {
  renderFilters();
  renderConversion();
  renderFeatured();
  renderMenu();
  renderCart();
  if (openDetailId && $('dish-detail')?.classList.contains('open')) openDishDetail(openDetailId, true);
}

/* ── Cart mutations ──────────────────────────────────────────────────── */
function addToCart(id, showUpsell=true) {
  cart[id] = (cart[id]||0) + 1;
  saveCart();
  const fab = $('cart-fab');
  if (fab) { fab.classList.add('bounce'); setTimeout(()=>fab.classList.remove('bounce'),400); }
  if (showUpsell) showUpsellPanel(id);
}

function addCombo(id) {
  const combo = comboData.find(c => c.id === id);
  if (!combo) return;
  combo.items.forEach(itemId => { cart[itemId] = (cart[itemId]||0)+1; });
  saveCart();
  runTransition(() => {
    $('cart')?.classList.add('open');
    $('cart-backdrop')?.classList.add('show');
  });
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
  runTransition(() => {
    const open = c.classList.toggle('open');
    b?.classList.toggle('show', open);
  });
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
      ${picks.map(i => `<button class="upsell-item-btn" onclick="addToCart(${jsArg(i.id)},false);hideUpsell()">
        <span>${esc(localized(i.name,i.id))}</span>
        <strong>${fmt(i.price)}</strong>
      </button>`).join('')}
    </div>`;
  panel.classList.add('open');
  clearTimeout(panel._timer);
  panel._timer = setTimeout(() => panel.classList.remove('open'), 7000);
}

function hideUpsell() { $('upsell')?.classList.remove('open'); }

/* ── Dish detail panel ──────────────────────────────────────────────── */
function openDishDetail(id, immediate=false) {
  const item = findItem(id);
  const panel = $('dish-detail');
  if (!item || !panel) return;
  openDetailId = id;
  const name = localized(item.name, item.id);
  const desc = localized(item.description, '');
  const story = localized(item.story, '');
  const influence = localized(item.frenchInfluence, '');
  const pairings = (item.pairings || []).map(findItem).filter(Boolean).slice(0,3);
  const addons = (item.addons || []).map(findItem).filter(Boolean).slice(0,3);
  const tags = [...(item.bestFor||[]), ...(item.dietaryTags||[])]
    .map(tag => `<span>${esc(t(bestForLabels[tag] || dietaryLabels[tag] || tag))}</span>`).join('');
  const allergens = (item.allergens || []).length
    ? item.allergens.map(a => `<span>${esc(a)}</span>`).join('')
    : `<span>${t('noAllergens')}</span>`;
  panel.innerHTML = `
    <div class="dish-detail-card" role="document">
      <button class="dish-detail-close" onclick="closeDishDetail()" aria-label="${t('close')}">×</button>
      ${item.image ? `<img class="dish-detail-image" src="${esc(item.image)}" alt="${esc(localized(item.photoAlt,name))}" width="720" height="420">` : ''}
      <div class="dish-detail-body">
        <div class="dish-detail-kicker">${(item.bestFor||[]).includes('french-specialty') ? t('frenchTouch') : t('localRoots')}</div>
        <h2>${esc(name)}</h2>
        <p class="dish-detail-desc">${esc(desc)}</p>
        ${story ? `<p class="dish-detail-story">${esc(story)}</p>` : ''}
        ${influence ? `<div class="detail-note"><strong>${t('frenchTouch')}</strong><span>${esc(influence)}</span></div>` : ''}
        ${tags ? `<div class="detail-meta"><strong>${t('bestFor')}</strong><div>${tags}</div></div>` : ''}
        <div class="detail-meta"><strong>${t('allergens')}</strong><div>${allergens}</div></div>
        ${addons.length ? `<div class="detail-meta"><strong>${t('addons')}</strong><div>${addons.map(i => `<button onclick="addToCart(${jsArg(i.id)},false)">${esc(localized(i.name,i.id))} · ${fmt(i.price)}</button>`).join('')}</div></div>` : ''}
        ${pairings.length ? `<div class="detail-meta"><strong>${t('pairWith')}</strong><div>${pairings.map(i => `<button onclick="focusItem(${jsArg(i.id)});closeDishDetail()">${esc(localized(i.name,i.id))}</button>`).join('')}</div></div>` : ''}
        <div class="dish-detail-actions">
          <span class="dish-detail-price">${fmt(item.price)}</span>
          ${qtyControls(item.id)}
        </div>
      </div>
    </div>`;
  const show = () => {
    panel.classList.add('open');
    $('dish-detail-backdrop')?.classList.add('show');
  };
  if (immediate) show();
  else runTransition(show);
}

function closeDishDetail() {
  openDetailId = null;
  runTransition(() => {
    $('dish-detail')?.classList.remove('open');
    $('dish-detail-backdrop')?.classList.remove('show');
  });
}

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
  const name = localized(item.name, item.id);
  const text = `${name} · ${fmt(item.price)} · Las Veraneras`;
  if (navigator.share) {
    await navigator.share({title:name, text, url:url.toString()}).catch(()=>{});
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
    const [menuRes, configRes, specialsRes, combosRes] = await Promise.all([
      fetch('data/menu.json', {cache:'no-store'}),
      fetch('data/config.json', {cache:'no-store'}),
      fetch('data/specials.json', {cache:'no-store'}),
      fetch('data/combos.json', {cache:'no-store'})
    ]);
    if (menuRes.ok) { const d = await menuRes.json(); if (d?.categories) menuData = d; }
    if (configRes.ok) { const d = await configRes.json(); if (d) applyConfig(d); }
    if (specialsRes.ok) { const d = await specialsRes.json(); if (Array.isArray(d)) specials = d; }
    if (combosRes.ok) { const d = await combosRes.json(); if (Array.isArray(d)) comboData = d; }
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
  setLang(detectInitialLang()); // auto-detect & apply initial language
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
  setLang, setCategory, setTag, setAllergenFilter, clearMenuFilters,
  renderMenu, renderAll, addToCart, addCombo, changeQty, openDishDetail, closeDishDetail,
  hideUpsell, toggleCart, focusItem, surpriseMe, checkout, shareItem,
  handleWaClick, toggleMobileMenu, closeSuccess, loadData
});

document.addEventListener('DOMContentLoaded', init);
