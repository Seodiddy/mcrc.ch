/*!
 * H₂ Concierge Lens v1.0 · Liquid Glass Concierge layer for hydration-h2.com
 *
 * Drop-in: load concierge-lens.css + this file on every page. No framework needed.
 * - Clicking any existing "H2 Concierge" link (href to concierge.hydration-h2.com)
 *   or any element with [data-cc-open] opens the lens instead of the old app.
 *   If this script fails to load, those links keep working as before.
 * - On screens ≤1024px a round glass "H₂" button is added to the header,
 *   before .header__burger.
 * - Answers come from the existing engine: POST {apiUrl} with
 *   { messages:[{role,content}], language } → SSE lines `data: {"type":"delta","text":…}`.
 *   The final text may contain <quick_replies>a|b</quick_replies> and
 *   <metadata>{"recommended_product":"s900-plus","show_order_cta":true,"price":2480}</metadata>,
 *   exactly as the current Concierge app parses them.
 *
 * Options (all optional) — set before this script loads:
 *   window.H2_CONCIERGE = { apiUrl, demo, enabled, orderUrl, leadEndpoint, mobileOrb, ... }
 * URL switches for testing: ?cc=off (disable), ?cc=demo (canned answers, no backend).
 */
(() => {
  'use strict';
  if (window.H2ConciergeLens) return;

  const params = new URLSearchParams(location.search);
  const USER = window.H2_CONCIERGE || {};
  const CFG = {
    enabled: true,
    apiUrl: '/api/concierge',          // same-origin proxy to https://concierge.hydration-h2.com/api/chat
    demo: false,
    orderUrl: '/order',
    leadEndpoint: null,                // optional: POST JSON {name,email,country,message,product,language}
    name: 'H₂ Concierge',
    trailRoot: 'H₂',
    currency: 'EUR',
    mobileOrb: true,
    triggers: '[data-cc-open], a[href^="https://concierge.hydration-h2.com"]',
    homeTriggers: '.site-header a[href^="https://concierge.hydration-h2.com"], .site-header [data-cc-open], [data-cc-orb]',
    ...USER,
  };
  CFG.products = Object.assign({
    's900-plus': {
      name: 'Hydration-H₂ S 900 Plus', short: 'S 900 Plus', tag: 'personal', article: '8101',
      h2: '600 ml/min', o2: '300 ml/min', users: 1, format: 'compact', price: 2480,
      image: '/images/products/s-900-plus-new.png', url: '/products/s-900-plus', mentions: /S\s?900/i,
    },
    's3000-pro': {
      name: 'Hydration-H₂ S 3000 Pro', short: 'S 3000 Pro', tag: 'professional', article: '8102',
      h2: '2,000 ml/min', o2: '1,000 ml/min', users: 2, format: 'floor', price: 4680,
      image: '/images/products/s-3000-pro-lifestyle.png', url: '/products/s-3000-pro', mentions: /S\s?3000/i,
    },
  }, USER.products || {});
  if (params.get('cc') === 'off' || CFG.enabled === false) return;
  if (params.get('cc') === 'demo') CFG.demo = true;

  /* ------------------------------ copy ------------------------------ */
  const COPY = {
    en: {
      openingQ: "Have you come across molecular hydrogen before, or is this new to you?", openOpts: ["Yes, I know it well", "I've heard about it", "Brand new to me"], typeOwn: "Or type your own answer…", optResearch: 'Research', optDaily: 'Daily use', optFit: 'Which system fits me?',
      researchQ: 'What does the human research show?', dailyQ: 'How does H₂ fit into a normal day?', fitQ: 'Which system fits me?',
      ask: 'Ask anything…', send: 'Send', close: 'Close Concierge', consulting: 'Looking into it', showing: 'Let me show you',
      sources: ['Research', 'Product knowledge', 'Expert FAQ'], nextLbl: 'You may also want', explain: 'Explain further',
      productEyebrow: 'For regular personal use', proEyebrow: 'For professional use',
      explore: 'Explore {name}', compareWith: 'Compare with {name}', compareMsg: 'Compare the {a} with the {b}.',
      compareQ: '{a} or {b}?', personal: 'Personal', professional: 'Professional', choose: 'Choose {name}',
      lblH2: 'H₂ output', lblO2: 'O₂ output', lblUsers: 'Users', lblFormat: 'Format', lblPrice: 'Price',
      users1: 'Designed for one user', users2: 'Up to two simultaneous users', fmtCompact: 'Compact desktop format', fmtFloor: 'Mobile floor-standing format',
      users1s: 'One', users2s: 'Up to two', fmtCompactS: 'Desktop', fmtFloorS: 'Floor-standing', inclVat: 'incl. VAT',
      ready: 'Ready to explore {name}?', viewProduct: 'View product', order: 'Request information & order', compare: 'Compare', finalQ: 'Ask one final question',
      formTitle: 'Request information & order', fName: 'Name', fEmail: 'Email', fCountry: 'Country', fMsg: 'Anything we should know?', optional: 'optional',
      submit: 'Send request', reply: 'Our team will get back to you within 24 hours.', needName: 'Please add your name.', needEmail: 'Please add a valid email address.',
      sent: 'Your request has been sent.', viewing: 'You’re now viewing the relevant product.', another: 'Ask another question',
      errorRetry: 'Could not connect. Please try again.', retry: 'Try again', sendFail: 'Your request could not be sent. Please try again.',
      disclaimer: 'H₂ inhalation devices are wellness products. Not intended to diagnose, treat, cure, or prevent any disease.',
      trailYour: 'Your question', trailCompare: 'Compare', trailOrder: 'Order',
    },
    de: {
      openingQ: "Wie vertraut sind Sie mit molekularem Wasserstoff — oder begegnet Ihnen das Konzept heute zum ersten Mal?", openOpts: ["Ja, ich kenne es gut", "Ich habe davon gehört", "Völlig neu für mich"], typeOwn: "Oder eigene Antwort eingeben…", optResearch: 'Forschung', optDaily: 'Im Alltag', optFit: 'Welches System passt zu mir?',
      researchQ: 'Was zeigt die Forschung am Menschen?', dailyQ: 'Wie passt H₂ in einen ganz normalen Tag?', fitQ: 'Welches System passt zu mir?',
      ask: 'Fragen Sie, was Sie möchten …', send: 'Senden', close: 'Concierge schließen', consulting: 'Ich sehe nach', showing: 'Ich zeige es Ihnen',
      sources: ['Forschung', 'Produktwissen', 'Experten-FAQ'], nextLbl: 'Das könnte Sie auch interessieren', explain: 'Mehr erklären',
      productEyebrow: 'Für die regelmäßige persönliche Anwendung', proEyebrow: 'Für den professionellen Einsatz',
      explore: '{name} entdecken', compareWith: 'Mit {name} vergleichen', compareMsg: 'Vergleichen Sie den {a} mit dem {b}.',
      compareQ: '{a} oder {b}?', personal: 'Persönlich', professional: 'Professionell', choose: '{name} wählen',
      lblH2: 'H₂-Leistung', lblO2: 'O₂-Leistung', lblUsers: 'Nutzer', lblFormat: 'Format', lblPrice: 'Preis',
      users1: 'Für eine Person', users2: 'Bis zu zwei Personen gleichzeitig', fmtCompact: 'Kompaktes Tischgerät', fmtFloor: 'Mobiles Standgerät',
      users1s: 'Eine Person', users2s: 'Bis zu zwei', fmtCompactS: 'Tischgerät', fmtFloorS: 'Standgerät', inclVat: 'inkl. MwSt.',
      ready: 'Möchten Sie den {name} entdecken?', viewProduct: 'Produkt ansehen', order: 'Informationen & Bestellung anfragen', compare: 'Vergleichen', finalQ: 'Eine letzte Frage stellen',
      formTitle: 'Informationen & Bestellung anfragen', fName: 'Name', fEmail: 'E-Mail', fCountry: 'Land', fMsg: 'Möchten Sie uns noch etwas mitteilen?', optional: 'optional',
      submit: 'Anfrage senden', reply: 'Unser Team meldet sich innerhalb von 24 Stunden.', needName: 'Bitte geben Sie Ihren Namen an.', needEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
      sent: 'Ihre Anfrage wurde gesendet.', viewing: 'Sie sehen jetzt das passende Produkt.', another: 'Eine andere Frage stellen',
      errorRetry: 'Verbindung konnte nicht aufgebaut werden. Bitte erneut versuchen.', retry: 'Erneut versuchen', sendFail: 'Ihre Anfrage konnte nicht gesendet werden. Bitte erneut versuchen.',
      disclaimer: 'H₂-Inhalationsgeräte sind Wellness-Produkte. Nicht zur Diagnose, Behandlung, Heilung oder Vorbeugung von Krankheiten.',
      trailYour: 'Ihre Frage', trailCompare: 'Vergleich', trailOrder: 'Bestellung',
    },
    es: {
      openingQ: "¿Estás familiarizado con el hidrógeno molecular, o es la primera vez que te encuentras con este concepto?", openOpts: ["Sí, lo conozco bien", "He oído hablar de ello", "Es nuevo para mí"], typeOwn: "O escribe tu propia respuesta…", optResearch: 'Investigación', optDaily: 'En el día a día', optFit: '¿Qué sistema es para mí?',
      researchQ: '¿Qué muestra la investigación en humanos?', dailyQ: '¿Cómo encaja el H₂ en un día normal?', fitQ: '¿Qué sistema es para mí?',
      ask: 'Pregunte lo que quiera…', send: 'Enviar', close: 'Cerrar Concierge', consulting: 'Lo estoy consultando', showing: 'Permítame mostrárselo',
      sources: ['Investigación', 'Conocimiento del producto', 'FAQ de expertos'], nextLbl: 'También podría interesarle', explain: 'Explíquemelo más',
      productEyebrow: 'Para uso personal habitual', proEyebrow: 'Para uso profesional',
      explore: 'Descubrir {name}', compareWith: 'Comparar con {name}', compareMsg: 'Compare el {a} con el {b}.',
      compareQ: '¿{a} o {b}?', personal: 'Personal', professional: 'Profesional', choose: 'Elegir {name}',
      lblH2: 'Salida de H₂', lblO2: 'Salida de O₂', lblUsers: 'Usuarios', lblFormat: 'Formato', lblPrice: 'Precio',
      users1: 'Para un usuario', users2: 'Hasta dos usuarios a la vez', fmtCompact: 'Formato compacto de sobremesa', fmtFloor: 'Formato móvil de pie',
      users1s: 'Uno', users2s: 'Hasta dos', fmtCompactS: 'Sobremesa', fmtFloorS: 'De pie', inclVat: 'IVA incl.',
      ready: '¿Descubrimos el {name}?', viewProduct: 'Ver el producto', order: 'Solicitar información y pedido', compare: 'Comparar', finalQ: 'Una última pregunta',
      formTitle: 'Solicitar información y pedido', fName: 'Nombre', fEmail: 'Correo electrónico', fCountry: 'País', fMsg: '¿Algo que debamos saber?', optional: 'opcional',
      submit: 'Enviar solicitud', reply: 'Nuestro equipo le responderá en un plazo de 24 horas.', needName: 'Indique su nombre, por favor.', needEmail: 'Indique un correo electrónico válido, por favor.',
      sent: 'Su solicitud ha sido enviada.', viewing: 'Ya está viendo el producto indicado.', another: 'Hacer otra pregunta',
      errorRetry: 'No se pudo conectar. Inténtelo de nuevo.', retry: 'Reintentar', sendFail: 'No se pudo enviar su solicitud. Inténtelo de nuevo.',
      disclaimer: 'Los dispositivos de inhalación de H₂ son productos de bienestar. No están destinados a diagnosticar, tratar, curar ni prevenir ninguna enfermedad.',
      trailYour: 'Su pregunta', trailCompare: 'Comparar', trailOrder: 'Pedido',
    },
    bg: {
      openingQ: "Колко сте запознати с молекулярния водород — или срещате това понятие за първи път днес?", openOpts: ["Да, познавам го добре", "Чувал съм за него", "Напълно ново за мен"], typeOwn: "Или напишете свой отговор…", optResearch: 'Изследвания', optDaily: 'В ежедневието', optFit: 'Коя система е за мен?',
      researchQ: 'Какво показват изследванията при хора?', dailyQ: 'Как H₂ се вписва в един обикновен ден?', fitQ: 'Коя система е за мен?',
      ask: 'Попитайте каквото пожелаете…', send: 'Изпратете', close: 'Затворете Concierge', consulting: 'Проверявам', showing: 'Нека Ви покажа',
      sources: ['Изследвания', 'Познания за продукта', 'Експертни въпроси'], nextLbl: 'Може да Ви е полезно още', explain: 'Обяснете по-подробно',
      productEyebrow: 'За редовна лична употреба', proEyebrow: 'За професионална употреба',
      explore: 'Разгледайте {name}', compareWith: 'Сравнете със {name}', compareMsg: 'Сравнете {a} с {b}.',
      compareQ: '{a} или {b}?', personal: 'Лично', professional: 'Професионално', choose: 'Изберете {name}',
      lblH2: 'H₂ дебит', lblO2: 'O₂ дебит', lblUsers: 'Потребители', lblFormat: 'Формат', lblPrice: 'Цена',
      users1: 'За един потребител', users2: 'До двама потребители едновременно', fmtCompact: 'Компактен настолен формат', fmtFloor: 'Мобилен подов формат',
      users1s: 'Един', users2s: 'До двама', fmtCompactS: 'Настолен', fmtFloorS: 'Подов', inclVat: 'с ДДС',
      ready: 'Да разгледаме ли {name}?', viewProduct: 'Вижте продукта', order: 'Заявка за информация и поръчка', compare: 'Сравнете', finalQ: 'Един последен въпрос',
      formTitle: 'Заявка за информация и поръчка', fName: 'Име', fEmail: 'Имейл', fCountry: 'Държава', fMsg: 'Нещо, което трябва да знаем?', optional: 'по желание',
      submit: 'Изпратете заявката', reply: 'Нашият екип ще се свърже с Вас в рамките на 24 часа.', needName: 'Моля, въведете името си.', needEmail: 'Моля, въведете валиден имейл адрес.',
      sent: 'Вашата заявка е изпратена.', viewing: 'Вече разглеждате подходящия продукт.', another: 'Задайте друг въпрос',
      errorRetry: 'Няма връзка. Моля, опитайте отново.', retry: 'Опитайте отново', sendFail: 'Заявката не можа да бъде изпратена. Моля, опитайте отново.',
      disclaimer: 'Устройствата за инхалация на H₂ са продукти за благосъстояние. Не са предназначени за диагностика, лечение или профилактика на заболявания.',
      trailYour: 'Вашият въпрос', trailCompare: 'Сравнение', trailOrder: 'Поръчка',
    },
  };
  if (USER.copy) for (const l of Object.keys(USER.copy)) COPY[l] = Object.assign({}, COPY[l] || COPY.en, USER.copy[l]);
  const LANG = (() => { const l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase(); return COPY[l] ? l : 'en'; })();
  const LOCALE = { en: 'en-IE', de: 'de-DE', es: 'es-ES', bg: 'bg-BG' }[LANG];
  const t = (k, vars) => {
    let s = COPY[LANG][k] ?? COPY.en[k] ?? k;
    if (vars && typeof s === 'string') for (const [a, b] of Object.entries(vars)) s = s.split('{' + a + '}').join(b);
    return s;
  };

  /* ------------------------------ utilities ------------------------------ */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, REDUCED ? Math.min(ms, 60) : ms));
  const vp = () => ({ w: window.visualViewport ? visualViewport.width : innerWidth, h: window.visualViewport ? visualViewport.height : innerHeight });
  const isMobile = () => vp().w < 700;
  const inView = r => r && r.width > 0 && r.bottom > 80 && r.top < vp().h - 40 && r.right > 0 && r.left < vp().w;
  const visible = el => !!el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden';
  const ICON_SEND = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_CLOSE = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  /* Light formatting for engine text: **bold**, line breaks, "- " bullets. Escaped first. */
  function fmt(text) {
    const lines = esc(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').split('\n');
    let out = '', inList = false;
    for (const line of lines) {
      const m = line.match(/^\s*[-•*]\s+(.*)$/);
      if (m) { if (!inList) { out += '<ul>'; inList = true; } out += `<li>${m[1]}</li>`; continue; }
      if (inList) { out += '</ul>'; inList = false; }
      out += (out && !out.endsWith('</ul>') ? '<br>' : '') + line;
    }
    return out + (inList ? '</ul>' : '');
  }

  /* Chromium gets true lensing; Safari/Firefox and low-power devices get the frosted rim. */
  const TRUE_LENS = (() => {
    const brands = navigator.userAgentData && navigator.userAgentData.brands;
    const chromium = !!(brands && brands.some(b => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand)));
    const lowPower = (navigator.deviceMemory && navigator.deviceMemory < 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    return chromium && !lowPower && !matchMedia('(prefers-reduced-transparency: reduce)').matches;
  })();

  /* Products: config data, enriched with the matching card on the current page when there is one. */
  function product(id) {
    const p = CFG.products[id]; if (!p) return null;
    let el = document.querySelector(`[data-cc-object="${id}"]`);
    if (!el) { const a = document.querySelector(`.device-card a[href="${p.url}"], .device-card a[href="${p.url}/"]`); el = a && a.closest('.device-card'); }
    const img = el && (el.querySelector('[data-cc-img]') || el.querySelector('img'));
    const pagePrice = document.querySelector(`[data-price-article="${p.article}"] [data-price-value]`);
    return { id, ...p, el: el && visible(el) ? el : null, img: img && visible(img) ? img : null, pagePrice: pagePrice && pagePrice.textContent.trim() };
  }
  // the site's own price element wins: it already shows the visitor's chosen currency
  const priceText = (o, override) => o.pagePrice
    || new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CFG.currency, maximumFractionDigits: 0 }).format(override || o.price);
  const imgSrc = o => (o.img && (o.img.currentSrc || o.img.src)) || o.image;

  /* ======================================================================
     ENGINE: the existing Concierge backend (unchanged)
     ====================================================================== */
  async function chat(messages, onText) {
    if (CFG.demo) return demoChat(messages, onText);
    const r = await fetch(CFG.apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages, language: LANG }) });
    if (!r.ok || !r.body) throw new Error('Chat API error ' + r.status);
    const reader = r.body.getReader(), dec = new TextDecoder();
    let buf = '', out = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n'); buf = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const d = line.slice(6).trim(); if (!d) continue;
        let j; try { j = JSON.parse(d); } catch { continue; }
        if (j.type === 'delta' && j.text) { out += j.text; onText && onText(out); }
        else if (j.type === 'error') throw new Error(j.message || 'Stream error');
      }
    }
    return out;
  }
  function parse(raw) {
    let quick = [];
    const q = raw.match(/<quick_replies>([\s\S]*?)<\/quick_replies>/i);
    if (q) { const c = q[1].trim(); quick = (c.includes('|') ? c.split('|') : c.split(/\n+/)).map(s => s.trim()).filter(s => s && !s.startsWith('<')); }
    const message = raw.replace(/<quick_replies>[\s\S]*?(<\/quick_replies>|$)/gi, '').replace(/<metadata>[\s\S]*?(<\/metadata>|$)/gi, '').replace(/<\/?[a-z_]*$/i, '').trim();
    let meta = {};
    const m = raw.match(/<metadata>\s*([\s\S]*?)\s*<\/metadata>/i);
    if (m) { try { meta = JSON.parse(m[1]); } catch { /* ignore */ } }
    return { message, quick, orderCta: meta.show_order_cta === true, product: CFG.products[meta.recommended_product] ? meta.recommended_product : null, price: meta.price || null };
  }
  /* The frontend decides how an answer is presented (architecture §14); the backend is untouched. */
  const FIG_RE = /(\d{1,3}(?:[.,  ]\d{3})*\+?)\s+((?:human\s+)?(?:clinical\s+)?(?:studies|publications|trials)|(?:klinische[n]?\s+)?(?:Studien|Publikationen)(?:\s+am\s+Menschen)?|estudios(?:\s+clínicos)?(?:\s+en\s+humanos)?|publicaciones(?:\s+científicas)?|(?:клинични\s+)?(?:проучвания|изследвания|публикации)(?:\s+при\s+хора)?)/i;
  function shape(p, intent) {
    const text = p.message;
    const paras = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    const stepRe = /^\s*\d+[.)]\s+(.+)$/;
    const allLines = text.split('\n');
    const steps = allLines.filter(l => stepRe.test(l)).map(l => l.match(stepRe)[1]);
    const mentions = Object.keys(CFG.products).filter(id => CFG.products[id].mentions.test(text));
    const fig = text.match(FIG_RE);
    const a = { ...p, intent, lead: paras[0] || text, more: paras.slice(1).join('\n\n') };
    if (p.product) a.type = 'product';
    else if (mentions.length >= 2 && (intent === 'fit' || intent === 'compare' || text.length < 900)) a.type = 'comparison';
    else if (steps.length >= 2) {
      a.type = 'guidance'; a.steps = steps;
      const first = allLines.findIndex(l => stepRe.test(l)), last = allLines.length - 1 - [...allLines].reverse().findIndex(l => stepRe.test(l));
      a.lead = allLines.slice(0, first).join('\n').trim();
      a.more = allLines.slice(last + 1).join('\n').trim();
    }
    else if (fig || intent === 'research') { a.type = 'research'; if (fig) a.figure = { value: fig[1], label: fig[2] }; }
    else a.type = 'detailed';
    return a;
  }

  /* Demo mode (?cc=demo): canned answers in the backend's own format, streamed. No backend needed. */
  async function demoChat(messages, onText) {
    const q = (messages[messages.length - 1].content || '').toLowerCase();
    const raw =
      /compar|vergleich|сравн|fit|passt|para mí|за мен/.test(q) ? 'Demo mode. The engine compares the S 900 Plus and the S 3000 Pro here and gives its recommendation.<quick_replies>Which machine is for home?</quick_replies>'
      : /home|900|zuhause|casa|дом/.test(q) ? 'Demo mode. The engine explains here why the **S 900 Plus** suits regular personal use at home.\n\nA second paragraph appears behind "Explain further".<quick_replies>How long is a session?|Compare with the S 3000 Pro</quick_replies><metadata>{"recommended_product":"s900-plus","show_order_cta":true}</metadata>'
      : /day|alltag|día|ден/.test(q) ? 'Demo mode. The engine gives practical guidance here:\n1. First step from the engine.\n2. Second step from the engine.\n3. Third step from the engine.<quick_replies>Which machine is for home?</quick_replies>'
      : /research|forsch|investig|изслед|stud/.test(q) ? 'Demo mode. The engine summarises the research here. The website cites 74+ human clinical studies.\n\nDeeper explanation appears behind "Explain further".<quick_replies>Which machine is for home?|How long is a session?</quick_replies>'
      : 'Demo mode. The engine answers the visitor’s own question here.\n\nA second paragraph appears behind "Explain further".';
    let out = '';
    await wait(900);
    for (const part of raw.match(/.{1,14}/gs)) { out += part; onText && onText(out); await wait(40); }
    return out;
  }

  /* ======================================================================
     LIQUID GLASS: displacement map for the lens's current shape (Chromium)
     ====================================================================== */
  function sdf(px, py, w, h, kind, r) {
    if (kind === 'ellipse') { const a = w / 2, b = h / 2; return (Math.hypot(px / a, py / b) - 1) * Math.min(a, b); }
    const rr = Math.min(r, w / 2, h / 2);
    const qx = Math.abs(px) - (w / 2 - rr), qy = Math.abs(py) - (h / 2 - rr);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rr;
  }
  let mapKey = '';
  function buildMap(w, h, kind, r) {
    if (!TRUE_LENS) return;
    const key = [Math.round(w), Math.round(h), kind, Math.round(r)].join();
    if (key === mapKey) return; mapKey = key;
    const s = 0.4, W = Math.max(8, Math.ceil(w * s)), H = Math.max(8, Math.ceil(h * s));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'), img = ctx.createImageData(W, H), d = img.data, band = Math.min(w, h) * 0.2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const px = (x + .5) / s - w / 2, py = (y + .5) / s - h / 2, e = -sdf(px, py, w, h, kind, r);
      let dx = 0, dy = 0;
      if (e > 0 && e < band) {
        const gx = sdf(px + 1, py, w, h, kind, r) - sdf(px - 1, py, w, h, kind, r);
        const gy = sdf(px, py + 1, w, h, kind, r) - sdf(px, py - 1, w, h, kind, r);
        const gl = Math.hypot(gx, gy) || 1, k = Math.pow(1 - e / band, 2.4);
        dx = -gx / gl * k; dy = -gy / gl * k;
      }
      const i = (y * W + x) * 4; d[i] = 128 + dx * 127; d[i + 1] = 128 + dy * 127; d[i + 2] = 128; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    mapEl.setAttribute('href', c.toDataURL()); mapEl.setAttribute('width', w); mapEl.setAttribute('height', h);
  }
  let dispNow = 0, dispRaf = 0;
  function setDisp(v, ms = 700) {
    if (!TRUE_LENS) return;
    const from = dispNow, t0 = performance.now();
    cancelAnimationFrame(dispRaf);
    const step = now => {
      const p = Math.min(1, (now - t0) / (REDUCED ? 1 : ms)), e = 1 - Math.pow(1 - p, 3);
      dispNow = from + (v - from) * e; dispEl.setAttribute('scale', dispNow.toFixed(1));
      if (p < 1) dispRaf = requestAnimationFrame(step);
    };
    dispRaf = requestAnimationFrame(step);
  }

  /* ======================================================================
     DOM
     ====================================================================== */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML = '<filter id="cc-lens-filter" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB" primitiveUnits="userSpaceOnUse"><feImage x="0" y="0" width="600" height="600" preserveAspectRatio="none" result="map"/><feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="soft"/><feDisplacementMap in="soft" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>';
  const mapEl = svg.querySelector('feImage'), dispEl = svg.querySelector('feDisplacementMap');

  const anchor = document.createElement('div');
  anchor.className = 'cc-anchor'; anchor.hidden = true;
  anchor.innerHTML = `<div class="cc-lens" role="dialog" aria-modal="false" aria-label="${esc(CFG.name)}" lang="${LANG}">
    <div class="cc-g cc-g-refract"></div><div class="cc-g cc-g-frost"></div><div class="cc-g cc-g-tint"></div>
    <div class="cc-g cc-g-light"></div><div class="cc-g cc-g-glow"></div><div class="cc-g cc-g-rim"></div><div class="cc-g cc-g-spec"></div>
    <button class="cc-close" type="button" aria-label="${esc(t('close'))}">${ICON_CLOSE}</button>
    <div class="cc-stage"></div></div>`;
  const lens = anchor.firstElementChild, stage = lens.querySelector('.cc-stage'), glowLayer = lens.querySelector('.cc-g-glow');
  const measure = document.createElement('div'); measure.className = 'cc-measure'; measure.setAttribute('aria-hidden', 'true');
  const live = document.createElement('div'); live.className = 'cc-sr'; live.setAttribute('aria-live', 'polite');
  if (TRUE_LENS) lens.classList.add('cc-true-lens');

  const S = { open: false, busy: false, closing: false, origin: null, view: null, arg: null, answer: null, product: null, messages: [], lifted: new Map() };

  /* ------------------------------ geometry ------------------------------ */
  function geometryFor(tpl) {
    const { w: vw, h: vh } = vp(), mobile = isMobile();
    const maxD = Math.min(vh * 0.92, vw * 0.94);
    const base = mobile ? vw * 0.88 : Math.max(440, Math.min(vh * 0.7, vw * 0.9, 760));
    const measureAt = cw => { measure.innerHTML = `<div class="cc-lens" style="width:auto;height:auto;box-shadow:none"><div class="cc-stage" style="position:static;translate:none;width:${cw}px"><div class="cc-v ${tpl.cls || ''}" style="max-height:none">${tpl.body}</div></div></div>`; return measure.querySelector('.cc-stage').offsetHeight; };
    if (mobile) {
      // first impression stays a round lens on phones too; only longer answers adapt their form
      if (tpl.round) { const d = Math.min(vw * 0.96, vh * 0.72); return { w: d, h: d, r: d / 2, shape: 'circle', cw: d * 0.84, ch: d * 0.8, mobileRound: true }; }
      const d = base * Math.min(tpl.f, 1), cwC = d * 0.7;
      if (tpl.shape === 'circle' && measureAt(cwC) <= d * 0.68) return { w: d, h: d, r: d / 2, shape: 'circle', cw: cwC, ch: d * 0.72, mobileRound: true };
      const w = vw * 0.92, cw = w - 48, h = Math.min(measureAt(cw) + 120, vh * 0.86);
      return { w, h, r: 44, shape: 'rect', cw, ch: h - 112 };
    }
    if (tpl.shape === 'rect') {
      const w = Math.min(560, vw * 0.92), cw = w - 96, h = Math.min(measureAt(cw) + 150, vh * 0.9);
      return { w, h, r: 56, shape: 'rect', cw, ch: h - 140 };
    }
    if (tpl.shape === 'ellipse') {
      let h = base * tpl.f, w = Math.min(h * 1.5, vw * 0.94);
      const cw = w * (tpl.cw || 0.68), hc = measureAt(cw);
      if (hc > h * 0.66) { h = Math.min(hc / 0.66, vh * 0.94); w = Math.min(Math.max(w, h * 1.3), vw * 0.94); }
      return { w, h, r: '50%', shape: 'ellipse', cw, ch: h * 0.7 };
    }
    let d = Math.min(base * tpl.f, maxD), cw = d * (tpl.cw || 0.64);
    const hc = measureAt(cw);
    if (hc > d * 0.7) { d = Math.min(hc / 0.7, maxD); cw = d * (tpl.cw || 0.64); }
    return { w: d, h: d, r: d / 2, shape: 'circle', cw, ch: d * 0.74 };
  }
  const sizeF = g => Math.max(0, Math.min(1, (Math.min(g.w, g.h) - 280) / 480));
  const dispFor = (g, k = 1) => Math.min(g.w, g.h) * (0.07 + 0.07 * sizeF(g)) * k;
  // hero orb: the lens opens where the orb is (desktop), kept fully inside the viewport
  function dockShift(g) {
    if (!S.bigOrigin || !S.origin || isMobile()) return null;
    const b = S.origin.getBoundingClientRect(), { w: vw, h: vh } = vp(), m = 16;
    const mx = Math.max(0, vw / 2 - g.w / 2 - m), my = Math.max(0, vh / 2 - g.h / 2 - m);
    const x = b.left + b.width / 2 - vw / 2, y = b.top + b.height / 2 - vh / 2;
    return { x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) };
  }
  const homeT = () => S.dock ? `${S.dock.x}px ${S.dock.y}px` : '';
  function applyGeom(g, instant) {
    S.geom = g;
    if (S.dock && S.open) { S.dock = dockShift(g) || S.dock; anchor.style.translate = homeT(); }
    const f = sizeF(g), set = (k, v) => lens.style.setProperty(k, v);
    if (instant) lens.classList.add('cc-no-anim');
    set('--w', g.w + 'px'); set('--h', g.h + 'px'); set('--r', typeof g.r === 'string' ? g.r : g.r + 'px');
    set('--cw', g.cw + 'px'); set('--ch', g.ch + 'px');
    set('--sh-y', (16 + 34 * f).toFixed(1) + 'px'); set('--sh-b', (36 + 74 * f).toFixed(1) + 'px');
    set('--frost-b', (15 + 12 * f).toFixed(1) + 'px'); set('--rim-glow', (20 + 40 * f).toFixed(1) + 'px');
    lens.classList.toggle('cc-shape-rect', g.shape === 'rect');
    const inset = g.shape === 'rect' ? '18px' : g.shape === 'ellipse' ? '17%' : '14.5%';
    set('--close-t', g.mobileRound ? '2.5%' : g.shape === 'ellipse' ? '12%' : inset);
    set('--close-r', g.mobileRound ? 'calc(50% - 17px)' : inset);
    lens.classList.toggle('cc-round-m', !!g.mobileRound);
    if (instant) { void lens.offsetWidth; lens.classList.remove('cc-no-anim'); }
    if (S.open && !S.closing && !lens.classList.contains('cc-consulting')) setDisp(dispFor(g), 700);
    const r = typeof g.r === 'string' ? Math.min(g.w, g.h) / 2 : g.r;
    clearTimeout(applyGeom.tm); applyGeom.tm = setTimeout(() => buildMap(g.w, g.h, g.shape === 'ellipse' ? 'ellipse' : 'rect', r), instant ? 0 : 720);
    clearTimeout(applyGeom.sh); applyGeom.sh = setTimeout(senseBehind, instant ? 0 : 760);
  }

  /* ------------------------------ views ------------------------------ */
  const trail = items => {
    const all = [CFG.trailRoot, ...items];
    return `<nav class="cc-trail" aria-label="Path">${all.map((x, i) => {
      const last = i === all.length - 1;
      const node = i === 0 && !last ? `<button type="button" data-cc-act="home">${esc(x)}</button>` : `<span${last ? ' aria-current="step"' : ''}>${esc(x)}</span>`;
      return (i ? '<i aria-hidden="true">→</i>' : '') + node;
    }).join('')}</nav>`;
  };
  const askBar = (ph = t('ask')) => `<form class="cc-ask" data-cc-ask><input name="q" type="text" autocomplete="off" enterkeyhint="send" placeholder="${esc(ph)}" aria-label="${esc(ph)}"><button type="submit" aria-label="${esc(t('send'))}">${ICON_SEND}</button></form>`;
  const chip = (label, act, primary) => `<button type="button" class="cc-chip${primary ? ' cc-chip--primary' : ''}" data-cc-act="${esc(act)}">${esc(label)}</button>`;
  const quickChips = a => (a.quick || []).slice(0, 4).map(q => chip(q, 'say:' + q)).join('');
  const slot = (o, cls = '') => `<div class="cc-slot ${cls}" data-cc-slot="${o.id}"><img src="${esc(imgSrc(o))}" alt="${esc(o.name)}"></div>`;
  const other = id => Object.keys(CFG.products).find(k => k !== id);

  const VIEWS = {
    invite: () => ({ shape: 'circle', round: true, f: 1, body: `
      <p class="cc-eyebrow">${esc(CFG.name)}</p>
      <h2 class="cc-display">${esc(t('openingQ'))}</h2>
      <div class="cc-choices">${t('openOpts').map(o => chip(o, 'say:' + o)).join('')}</div>
      ${CFG.fitLink === false ? '' : `<button type="button" class="cc-linkish" data-cc-act="fit">${esc(t('optFit'))} →</button>`}
      ${askBar(t('typeOwn'))}` }),

    consult: q => ({ shape: 'circle', round: true, f: .9, body: `
      ${q ? `<p class="cc-asked">${esc(q)}</p>` : ''}
      <p class="cc-consult-lbl">${esc(t('consulting'))}</p>
      <div class="cc-sources" aria-hidden="true">${t('sources').map(s => `<span>${esc(s)}</span>`).join('')}</div>` }),

    stream: q => ({ shape: 'circle', f: 1.08, cls: 'cc-streaming', body: `
      <p class="cc-asked">${esc(q)}</p>
      <div class="cc-answer" data-cc-live></div>` }),

    showing: () => ({ shape: 'circle', round: true, f: .9, body: `<p class="cc-consult-lbl">${esc(t('showing'))}</p>` }),

    error: () => ({ shape: 'circle', round: true, f: .82, body: `
      <p class="cc-answer">${esc(t('errorRetry'))}</p>
      <div class="cc-choices">${chip(t('retry'), 'retry', true)}${chip(t('close'), 'close')}</div>` }),

    research: a => ({ shape: 'circle', f: 1.08, body: `
      ${trail([t('optResearch')])}
      <p class="cc-asked">${esc(a.question)}</p>
      <div class="cc-answer">${fmt(a.lead)}</div>
      ${a.figure ? `<div class="cc-figure"><b>${esc(a.figure.value)}</b><span>${esc(a.figure.label)}</span></div>` : ''}
      ${a._more && a.more ? `<div class="cc-more">${fmt(a.more)}</div>` : ''}
      <div class="cc-choices">${a.more && !a._more ? chip(t('explain'), 'more', true) : ''}${quickChips(a)}</div>
      <p class="cc-disclaimer">${esc(t('disclaimer'))}</p>
      ${askBar()}` }),

    guidance: a => ({ shape: 'circle', f: 1.06, body: `
      ${trail([t('optDaily')])}
      <p class="cc-asked">${esc(a.question)}</p>
      ${a.lead ? `<div class="cc-answer">${fmt(a.lead)}</div>` : ''}
      <ol class="cc-steps">${a.steps.map(s => `<li><span>${fmt(s)}</span></li>`).join('')}</ol>
      ${a.more ? `<div class="cc-more">${fmt(a.more)}</div>` : ''}
      ${a.quick && a.quick.length ? `<div class="cc-next"><span class="cc-next-lbl">${esc(t('nextLbl'))}</span><div class="cc-choices">${quickChips(a)}</div></div>` : ''}
      ${askBar()}` }),

    detailed: a => ({ shape: 'circle', f: a._more ? 1.14 : 1, body: `
      ${trail([t('trailYour')])}
      <p class="cc-asked">${esc(a.question)}</p>
      <div class="cc-answer${a.lead.length < 160 ? ' cc-answer--xl' : ''}">${fmt(a.lead)}</div>
      ${a._more && a.more ? `<div class="cc-more">${fmt(a.more)}</div>` : ''}
      <div class="cc-choices">${a.more && !a._more ? chip(t('explain'), 'more', true) : ''}${quickChips(a)}</div>
      ${askBar()}` }),

    product: a => {
      const o = product(a.product), alt = product(other(o.id));
      return { shape: 'circle', f: 1.14, cw: .7, body: `
      ${trail([o.short])}
      <p class="cc-asked">${esc(a.question)}</p>
      <div class="cc-product">
        ${slot(o)}
        <div class="cc-product__txt">
          <p class="cc-eyebrow">${esc(t(o.tag === 'professional' ? 'proEyebrow' : 'productEyebrow'))}</p>
          <p class="cc-product__name">${esc(o.name)}</p>
          <div class="cc-specs"><span>${esc(o.h2)} H₂</span><span>${esc(t(o.users === 2 ? 'users2' : 'users1'))}</span><span>${esc(t(o.format === 'floor' ? 'fmtFloor' : 'fmtCompact'))}</span></div>
          <p class="cc-price">${esc(priceText(o, a.price))} <small>${esc(t('inclVat'))}</small></p>
        </div>
      </div>
      <div class="cc-answer">${fmt(a.lead)}</div>
      ${a._more && a.more ? `<div class="cc-more">${fmt(a.more)}</div>` : ''}
      <div class="cc-choices">${chip(t('explore', { name: o.short }), 'convert:' + o.id, true)}${a.more && !a._more ? chip(t('explain'), 'more') : ''}${alt ? chip(t('compareWith', { name: alt.short }), 'compare') : ''}${quickChips(a)}</div>
      ${askBar()}` };
    },

    comparison: a => {
      const ids = Object.keys(CFG.products).slice(0, 2), [x, y] = ids.map(product);
      const zone = o => `<div class="cc-zone">
        ${slot(o)}
        <p class="cc-eyebrow">${esc(t(o.tag))}</p>
        <h3>${esc(o.short)}</h3>
        <dl>
          <div><dt>${esc(t('lblH2'))}</dt><dd>${esc(o.h2)}</dd></div>
          <div><dt>${esc(t('lblO2'))}</dt><dd>${esc(o.o2)}</dd></div>
          <div><dt>${esc(t('lblUsers'))}</dt><dd>${esc(t(o.users === 2 ? 'users2s' : 'users1s'))}</dd></div>
          <div><dt>${esc(t('lblFormat'))}</dt><dd>${esc(t(o.format === 'floor' ? 'fmtFloorS' : 'fmtCompactS'))}</dd></div>
          <div><dt>${esc(t('lblPrice'))}</dt><dd>${esc(priceText(o))}</dd></div>
        </dl>
        ${chip(t('choose', { name: o.short }), 'convert:' + o.id, o.id === ids[0])}
      </div>`;
      return { shape: 'ellipse', f: 1.06, cw: .64, body: `
      ${trail([t('trailCompare')])}
      <p class="cc-asked">${esc(t('compareQ', { a: x.short, b: y.short }))}</p>
      ${a.lead ? `<div class="cc-answer">${fmt(a.lead)}</div>` : ''}
      <div class="cc-compare">${zone(x)}<div class="cc-compare__rule" aria-hidden="true"></div>${zone(y)}</div>
      ${a.more ? `<div class="cc-more">${fmt(a.more)}</div>` : ''}
      ${askBar()}` };
    },

    convert: id => {
      const o = product(id);
      return { shape: 'circle', f: 1, body: `
      ${trail([o.short])}
      ${slot(o, 'cc-thumb')}
      <h2 class="cc-display">${esc(t('ready', { name: o.short }))}</h2>
      <div class="cc-convert">${chip(t('viewProduct'), 'view:' + o.id)}${chip(t('order'), 'order:' + o.id, true)}${chip(t('compare'), 'compare')}${chip(t('finalQ'), 'focus')}</div>
      ${askBar()}` };
    },

    order: id => {
      const o = product(id);
      return { shape: 'rect', f: 1, cls: 'cc-left', body: `
      ${trail([o.short, t('trailOrder')])}
      <h2 class="cc-display" style="font-size:1.45rem">${esc(t('formTitle'))}</h2>
      <div class="cc-for">${slot(o)}<div><b>${esc(o.name)}</b><span>${esc(priceText(o))} ${esc(t('inclVat'))}</span></div></div>
      <form class="cc-form" data-cc-order="${o.id}" novalidate>
        <div class="cc-row2">
          <div class="cc-field"><label for="cc-name">${esc(t('fName'))}</label><input id="cc-name" name="name" autocomplete="name" required></div>
          <div class="cc-field"><label for="cc-email">${esc(t('fEmail'))}</label><input id="cc-email" name="email" type="email" autocomplete="email" inputmode="email" required></div>
        </div>
        <div class="cc-field"><label for="cc-country">${esc(t('fCountry'))}</label><input id="cc-country" name="country" autocomplete="country-name"></div>
        <div class="cc-field"><label for="cc-msg">${esc(t('fMsg'))} <small>(${esc(t('optional'))})</small></label><textarea id="cc-msg" name="message"></textarea></div>
        <p class="cc-note" data-cc-err role="alert" hidden></p>
        <button class="cc-chip cc-chip--primary" type="submit">${esc(t('submit'))}</button>
        <p class="cc-note">${esc(t('reply'))}</p>
      </form>` };
    },

    complete: () => ({ shape: 'circle', round: true, f: .82, body: `
      <svg class="cc-done" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32"/><path d="M20 33l8 8 16-17"/></svg>
      <h2 class="cc-display">${esc(t('sent'))}</h2>
      <p class="cc-more" style="text-align:center">${esc(t('reply'))}</p>
      <div class="cc-choices">${chip(t('another'), 'home')}${chip(t('close'), 'close', true)}</div>` }),

    viewing: id => ({ shape: 'circle', round: true, f: .58, cw: .74, body: `
      <p class="cc-answer" style="font-size:1rem">${esc(t('viewing'))}</p>
      <div class="cc-choices">${chip(t('order'), 'order:' + id, true)}${chip(t('close'), 'close')}</div>` }),
  };

  /* --------------------------- choreography --------------------------- */
  function slotRects() {
    const m = new Map();
    stage.querySelectorAll('.cc-v:not(.cc-leave) [data-cc-slot]').forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.width) m.set(s.dataset.ccSlot, { r, radius: getComputedStyle(s).borderRadius });
    });
    return m;
  }
  function fly(src, from, to, fromRadius, toRadius, dur) {
    const f = document.createElement('img');
    f.className = 'cc-flyer'; f.src = src; f.alt = '';
    Object.assign(f.style, { left: to.left + 'px', top: to.top + 'px', width: to.width + 'px', height: to.height + 'px', borderRadius: toRadius });
    document.body.appendChild(f);
    const a = f.animate([
      { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px', borderRadius: fromRadius },
      { left: to.left + 'px', top: to.top + 'px', width: to.width + 'px', height: to.height + 'px', borderRadius: toRadius },
    ], { duration: REDUCED ? 1 : dur, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'both' });
    return a.finished.then(() => f, () => f);
  }
  /* Return: lifted content goes back into the page when the next state no longer holds it */
  async function returnObjects(keep, prev) {
    const jobs = [];
    for (const [id, o] of S.lifted) {
      if (keep.includes(id)) continue;
      S.lifted.delete(id);
      const pr = prev.get(id), sr = o.img && o.img.getBoundingClientRect();
      if (pr && sr && inView(sr)) jobs.push(fly(imgSrc(o), pr.r, sr, pr.radius, '0px', 650).then(f => { o.img.classList.remove('cc-lifted'); f.remove(); }));
      else if (o.img) o.img.classList.remove('cc-lifted');
    }
    await Promise.all(jobs);
  }
  /* Point + Reveal: bring page content into sight beside the lens */
  async function pointAt(ids) {
    const objs = ids.map(product).filter(o => o && o.el && !S.lifted.has(o.id));
    if (!objs.length) return;
    const cards = objs.map(o => o.el), { w: vw, h: vh } = vp(), mobile = isMobile();
    const top = Math.min(...cards.map(c => c.getBoundingClientRect().top + scrollY));
    const bottom = Math.max(...cards.map(c => c.getBoundingClientRect().bottom + scrollY));
    const target = Math.max(0, (top + bottom) / 2 - vh / 2 + 36);
    if (!REDUCED) {
      if (objs.length === 1 && !mobile) {
        const r = cards[0].getBoundingClientRect(), left = r.left + r.width / 2 < vw / 2;
        anchor.style.translate = `${left ? vw * 0.24 : -vw * 0.24}px 0`; anchor.style.scale = '.62';
      } else { anchor.style.translate = `0 ${vh * 0.3}px`; anchor.style.scale = mobile ? '.34' : '.42'; }
    }
    const dist = Math.abs(scrollY - target);
    scrollTo({ top: target, behavior: REDUCED ? 'auto' : 'smooth' });
    await wait(Math.min(1100, 450 + dist * 0.35));
    cards.forEach(c => c.classList.add('cc-point'));
    await wait(900);
    anchor.style.translate = homeT(); anchor.style.scale = '';
    setTimeout(() => cards.forEach(c => c.classList.remove('cc-point')), 700);
  }
  /* Lift: page content travels into the lens (or glides between lens states) */
  async function liftInto(viewEl, prev) {
    await Promise.all([...viewEl.querySelectorAll('[data-cc-slot]')].map(async s => {
      const o = product(s.dataset.ccSlot), to = s.getBoundingClientRect(), radius = getComputedStyle(s).borderRadius;
      let from = prev.get(o.id), fromRadius = from && from.radius; from = from && from.r;
      if (!from && o.img) { const sr = o.img.getBoundingClientRect(); if (inView(sr)) { from = sr; fromRadius = '0px'; } }
      if (!S.lifted.has(o.id) && o.img) { S.lifted.set(o.id, o); o.img.classList.add('cc-lifted'); }
      if (from) { const f = await fly(imgSrc(o), from, to, fromRadius, radius, 850); s.classList.add('cc-landed'); requestAnimationFrame(() => f.remove()); }
      else s.classList.add('cc-landed');
    }));
  }

  function tplFor(name, arg) {
    const tpl = VIEWS[name](arg);
    if (tpl.round && isMobile()) tpl.cls = (tpl.cls || '') + ' cc-compact';
    return tpl;
  }
  async function render(name, arg, opts = {}) {
    const tpl = tplFor(name, arg);
    const prev = slotRects();
    const keep = [...tpl.body.matchAll(/data-cc-slot="([^"]+)"/g)].map(m => m[1]);
    const old = [...stage.children];
    old.forEach(v => { v.classList.remove('cc-enter'); v.classList.add('cc-leave'); v.querySelectorAll('[id]').forEach(n => n.removeAttribute('id')); v.querySelectorAll('[data-cc-slot]').forEach(s => { s.style.visibility = 'hidden'; }); });
    const ret = returnObjects(keep, prev);
    applyGeom(geometryFor(tpl), opts.instant);
    await wait(opts.instant ? 0 : 200);
    old.forEach(v => v.remove());
    const el = document.createElement('div');
    el.className = `cc-v cc-enter ${tpl.cls || ''}`;
    el.innerHTML = tpl.body;
    stage.appendChild(el);
    S.view = name; S.arg = arg;
    const heading = el.querySelector('.cc-display, .cc-answer, .cc-consult-lbl');
    if (heading && !opts.silent) live.textContent = heading.textContent;
    if (keep.length) { await wait(opts.instant ? 0 : 720); await liftInto(el, prev); }
    await ret;
    return el;
  }

  /* ask → consult → stream → present */
  const COMPARE_RE = /compar|vergleich|сравн|\bvs\.?\b|versus/i;
  async function ask(question, intent) {
    if (S.busy) return;
    if (!intent && COMPARE_RE.test(question)) intent = 'compare';
    S.busy = true;
    // same first message as the current Concierge app: "<opening question> — <visitor's answer>"
    S.messages.push({ role: 'user', content: S.messages.length ? question : `${t('openingQ')} — ${question}` });
    S.pending = { question, intent };
    try { await answerPending(); } finally { S.busy = false; }
  }
  async function answerPending() {
    const { question, intent } = S.pending;
    lens.classList.add('cc-consulting');
    setDisp(dispFor(S.geom, 1.5), 500);
    const el = await render('consult', question, { silent: true });
    live.textContent = t('consulting');
    const spans = [...el.querySelectorAll('.cc-sources span')];
    let i = 0;
    const tick = setInterval(() => { spans.forEach((s, j) => s.classList.toggle('cc-on', j === i % spans.length)); i++; }, 480);
    let streamEl = null, latest = '', frame = 0, switching = null;
    const onText = raw => {
      latest = raw;
      if (!streamEl && !switching) {
        switching = (async () => {
          clearInterval(tick); lens.classList.remove('cc-consulting');
          const v = await render('stream', question, { silent: true });
          streamEl = v.querySelector('[data-cc-live]');
        })();
      }
      if (streamEl && !frame) frame = requestAnimationFrame(() => {
        frame = 0; streamEl.innerHTML = fmt(parse(latest).message);
        const v = streamEl.closest('.cc-v'); v.scrollTop = v.scrollHeight;
      });
    };
    let raw;
    try { raw = await chat(S.messages, onText); }
    catch (err) {
      console.error('[H2 Concierge]', err);
      clearInterval(tick); lens.classList.remove('cc-consulting');
      if (switching) await switching;
      S.messages.pop();
      await render('error');
      return;
    }
    clearInterval(tick); lens.classList.remove('cc-consulting');
    if (switching) await switching;
    S.messages.push({ role: 'assistant', content: raw });
    setDisp(dispFor(S.geom), 900);
    const a = shape(parse(raw), intent);
    a.question = question;
    S.answer = a;
    if (a.type === 'product' || a.type === 'comparison') {
      const ids = a.type === 'product' ? [a.product] : Object.keys(CFG.products).slice(0, 2);
      if (ids.some(id => { const o = product(id); return o && o.el && !S.lifted.has(id); })) { await render('showing'); await pointAt(ids); }
    }
    await render(a.type, a);
  }

  /* ------------------------------ open / close ------------------------------ */
  async function open(origin) {
    if (S.open || S.busy) return;
    S.busy = true; S.open = true; S.origin = origin;
    lens.style.visibility = 'hidden';
    lens.classList.add('cc-immaterial');
    anchor.hidden = false;
    document.querySelectorAll(CFG.homeTriggers).forEach(b => b.classList.add('cc-is-out'));
    origin.setAttribute('aria-expanded', 'true');
    const el = await render('invite', null, { instant: true });
    buildMap(S.geom.w, S.geom.h, 'rect', S.geom.w / 2);
    el.classList.remove('cc-enter'); el.style.opacity = '0';
    const b = origin.getBoundingClientRect(), { w: vw, h: vh } = vp();
    const dx = b.left + b.width / 2 - vw / 2, dy = b.top + b.height / 2 - vh / 2, k = Math.max(b.height / S.geom.w, .04);
    // a large orb (hero) becomes the lens itself: no drop from the nav, and the orb steps aside
    S.bigOrigin = b.height > 120;
    const drop = S.bigOrigin ? 0 : b.height * 1.5;
    S.dock = dockShift(S.geom);
    const ox = S.dock ? S.dock.x : 0, oy = S.dock ? S.dock.y : 0;
    anchor.style.transition = 'none'; anchor.style.translate = homeT(); void anchor.offsetWidth; anchor.style.transition = '';
    // seed → growing lens: born at the button, separates from the nav, travels to the centre
    const flight = lens.animate([
      { transform: `translate(${dx - ox}px, ${dy - oy}px) scale(${k})`, offset: 0 },
      { transform: `translate(${dx - ox}px, ${dy - oy + drop}px) scale(${k * 1.35})`, offset: .16 },
      { transform: 'translate(0, 0) scale(1)', offset: 1 },
    ], { duration: REDUCED ? 1 : 1050, easing: 'cubic-bezier(.3,.75,.2,1)' });
    lens.style.visibility = '';
    if (S.bigOrigin) { origin.style.transition = 'none'; origin.style.opacity = '0'; }
    setDisp(0, 1);
    // materialise through light and lensing, not a fade
    requestAnimationFrame(() => requestAnimationFrame(() => lens.classList.remove('cc-immaterial')));
    setTimeout(() => setDisp(dispFor(S.geom), 1000), 160);
    await wait(720);
    el.style.opacity = ''; el.classList.add('cc-enter');
    await flight.finished.catch(() => {});
    S.busy = false;
    const first = el.querySelector('.cc-chip'); first && first.focus({ preventScroll: true });
  }
  async function close() {
    if (!S.open || S.closing) return;
    S.closing = true; S.busy = true;
    lens.classList.remove('cc-consulting');
    const prev = slotRects();
    [...stage.children].forEach(v => v.classList.add('cc-leave'));
    const ret = returnObjects([], prev);
    const { w: vw, h: vh } = vp(), d = isMobile() ? vw * .6 : Math.min(vh * .5, 420);
    applyGeom({ w: d, h: d, r: d / 2, shape: 'circle', cw: d * .6, ch: d * .7 });
    anchor.style.translate = homeT(); anchor.style.scale = '';
    await Promise.all([ret, wait(420)]);
    stage.innerHTML = '';
    const home = [S.origin, ...document.querySelectorAll(CFG.homeTriggers)].find(x => x && visible(x) && inView(x.getBoundingClientRect()));
    const b = (home || S.origin).getBoundingClientRect();
    const cx = S.dock ? S.dock.x : 0, cy = S.dock ? S.dock.y : 0;
    const dx = b.left + b.width / 2 - vw / 2 - cx, dy = b.top + b.height / 2 - vh / 2 - cy, k = Math.max(b.height / d, .04);
    setDisp(0, 600);
    lens.classList.add('cc-immaterial');
    const back = lens.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${dx}px, ${dy + (b.height > 120 ? 0 : b.height * 1.2)}px) scale(${k * 1.3})`, offset: .82 },
      { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
    ], { duration: REDUCED ? 1 : 850, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
    const rimOut = [...lens.querySelectorAll('.cc-g-rim, .cc-g-spec')].map(l => l.animate(
      [{ opacity: 1 }, { opacity: 1, offset: .72 }, { opacity: 0 }], { duration: REDUCED ? 1 : 850, fill: 'forwards' }));
    await back.finished.catch(() => {});
    if (S.bigOrigin && S.origin) { S.origin.style.opacity = ''; S.origin.style.transition = ''; }
    anchor.hidden = true; back.cancel(); rimOut.forEach(a => a.cancel());
    S.dock = null; anchor.style.transition = 'none'; anchor.style.translate = ''; void anchor.offsetWidth; anchor.style.transition = '';
    lens.classList.remove('cc-immaterial');
    document.querySelectorAll(CFG.homeTriggers).forEach(x => x.classList.remove('cc-is-out'));
    if (home) { home.classList.remove('cc-merging'); void home.offsetWidth; home.classList.add('cc-merging'); }
    S.origin && S.origin.setAttribute('aria-expanded', 'false');
    if (S.kbd) (home || S.origin).focus({ preventScroll: true });
    Object.assign(S, { open: false, closing: false, busy: false, view: null, answer: null });
  }
  async function closeThenGo(url) { await close(); location.href = url; }

  /* ------------------------------ interaction ------------------------------ */
  lens.addEventListener('click', async e => {
    if (e.target.closest('.cc-close')) return close();
    const btn = e.target.closest('[data-cc-act]');
    if (!btn || S.busy) return;
    const act = btn.dataset.ccAct, i = act.indexOf(':'), verb = i < 0 ? act : act.slice(0, i), arg = i < 0 ? '' : act.slice(i + 1);
    const step = async fn => { S.busy = true; try { await fn(); } finally { S.busy = false; } };
    switch (verb) {
      case 'intent': return ask(t(arg === 'research' ? 'researchQ' : arg === 'daily' ? 'dailyQ' : 'fitQ'), arg);
      case 'say': return ask(arg);
      case 'compare': { const [x, y] = Object.keys(CFG.products).map(product); return ask(t('compareMsg', { a: x.short, b: y.short }), 'compare'); }
      // side-by-side from the website's own product facts; nothing is sent to the engine
      case 'fit': return step(() => render('comparison', { type: 'comparison', lead: '', more: '', quick: [] }));
      case 'retry': return ask(S.pending.question, S.pending.intent);
      case 'home': S.messages = []; return step(() => render('invite'));   // a fresh conversation, as in the current app
      case 'close': return close();
      case 'focus': { const inp = stage.querySelector('.cc-v:not(.cc-leave) [data-cc-ask] input'); inp && inp.focus(); return; }
      case 'more': S.answer._more = true; return step(() => render(S.answer.type, S.answer));
      case 'convert': S.product = arg; return step(() => render('convert', arg));
      case 'order':
        if (!CFG.leadEndpoint) return closeThenGo(CFG.orderUrl + (CFG.orderUrl.includes('?') ? '&' : '?') + 'product=' + encodeURIComponent(arg));
        return step(async () => { await render('order', arg); const n = stage.querySelector('#cc-name'); n && n.focus({ preventScroll: true }); });
      case 'view': {
        const o = product(arg);
        if (!o.el) return closeThenGo(o.url);
        return step(async () => {
          await render('viewing', arg);
          await pointAt([arg]);
          o.el.classList.add('cc-point');
          if (!isMobile() && !REDUCED) { const r = o.el.getBoundingClientRect(); anchor.style.translate = `${r.left + r.width / 2 < vp().w / 2 ? vp().w * 0.26 : -vp().w * 0.26}px 0`; }
          setTimeout(() => o.el.classList.remove('cc-point'), 2600);
        });
      }
    }
  });
  lens.addEventListener('submit', async e => {
    e.preventDefault();
    if (S.busy) return;
    const f = e.target;
    if (f.matches('[data-cc-ask]')) {
      const inp = f.elements.namedItem('q'), q = inp.value.trim();
      if (!q) { inp.focus(); return; }
      return ask(q);
    }
    if (f.matches('[data-cc-order]')) {
      const el = n => f.elements.namedItem(n), err = f.querySelector('[data-cc-err]');
      const name = el('name').value.trim(), email = el('email').value.trim(), ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      el('name').setAttribute('aria-invalid', !name); el('email').setAttribute('aria-invalid', !ok);
      if (!name || !ok) { err.hidden = false; err.textContent = !name ? t('needName') : t('needEmail'); (!name ? el('name') : el('email')).focus(); return; }
      S.busy = true;
      try {
        const r = await fetch(CFG.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          name, email, country: el('country').value.trim(), message: el('message').value.trim(),
          product: f.dataset.ccOrder, article: CFG.products[f.dataset.ccOrder].article, language: LANG, page: location.href, conversation: S.messages,
        }) });
        if (!r.ok) throw new Error('Lead endpoint ' + r.status);
        await render('complete');
        const c = stage.querySelector('.cc-chip--primary'); c && c.focus({ preventScroll: true });
      } catch (x) { console.error('[H2 Concierge]', x); err.hidden = false; err.textContent = t('sendFail'); }
      finally { S.busy = false; }
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.open) close(); });

  /* touch light + gel response */
  function glowAt(x, y) {
    if (REDUCED) return;
    const r = lens.getBoundingClientRect(), i = document.createElement('i');
    i.style.setProperty('--px', (x - r.left) + 'px'); i.style.setProperty('--py', (y - r.top) + 'px');
    i.style.setProperty('--gs', Math.max(r.width, r.height) * 2.2 + 'px');
    i.addEventListener('animationend', () => i.remove());
    glowLayer.appendChild(i);
  }
  lens.addEventListener('pointerdown', e => {
    glowAt(e.clientX, e.clientY); lens.classList.add('cc-press');
    if (TRUE_LENS && !REDUCED) dispEl.setAttribute('scale', (dispNow * 1.25).toFixed(1));
  });
  const release = () => { if (!lens.classList.contains('cc-press')) return; lens.classList.remove('cc-press'); if (TRUE_LENS) dispEl.setAttribute('scale', dispNow.toFixed(1)); };
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
  lens.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('button')) { const r = e.target.getBoundingClientRect(); glowAt(r.left + r.width / 2, r.top + r.height / 2); }
  });
  /* "I'm listening" */
  lens.addEventListener('focusin', e => { if (e.target.matches('input, textarea')) lens.classList.add('cc-listening'); });
  lens.addEventListener('focusout', e => { if (e.target.matches('input, textarea')) lens.classList.remove('cc-listening'); });
  lens.addEventListener('input', () => {
    if (!TRUE_LENS || REDUCED) return;
    dispEl.setAttribute('scale', (dispNow * 1.12).toFixed(1));
    clearTimeout(lens._flex); lens._flex = setTimeout(() => dispEl.setAttribute('scale', dispNow.toFixed(1)), 160);
  });
  /* rim light follows the pointer */
  let lightRaf = 0;
  addEventListener('pointermove', e => {
    if (!S.open || lightRaf || e.pointerType !== 'mouse') return;
    lightRaf = requestAnimationFrame(() => {
      lightRaf = 0;
      const r = lens.getBoundingClientRect();
      lens.style.setProperty('--la', (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90).toFixed(0) + 'deg');
    });
  }, { passive: true });
  /* adaptive shadow: more separation over text, lighter over calm surfaces */
  const TEXTY = 'p, h1, h2, h3, h4, h5, li, a, dd, dt, summary, label, b, strong, small, span, td, th';
  function senseBehind() {
    if (!S.open || anchor.hidden) return;
    const r = lens.getBoundingClientRect(); let text = 0, n = 0;
    for (let i = 1; i <= 5; i++) for (let j = 1; j <= 5; j++) {
      const u = i / 6 - .5, v = j / 6 - .5;
      if (u * u + v * v > .25) continue;
      const under = document.elementsFromPoint(r.left + (u + .5) * r.width, r.top + (v + .5) * r.height)
        .find(el => !anchor.contains(el) && !el.classList.contains('cc-flyer'));
      if (!under) continue;
      n++; if (under.matches(TEXTY)) text++;
    }
    lens.style.setProperty('--sh-a', (.14 + .2 * (n ? text / n : 0)).toFixed(3));
  }
  let senseT = 0;
  addEventListener('scroll', () => { if (!S.open || senseT) return; senseT = setTimeout(() => { senseT = 0; senseBehind(); }, 140); }, { passive: true });
  /* stay fitted to the screen (rotation, resize, mobile keyboard) */
  let rz;
  const refit = () => { clearTimeout(rz); rz = setTimeout(() => {
    if (!S.open || S.busy || !S.view || !stage.querySelector('.cc-v:not(.cc-leave)')) return;
    applyGeom(geometryFor(tplFor(S.view, S.arg)));
  }, 180); };
  addEventListener('resize', refit);
  window.visualViewport && visualViewport.addEventListener('resize', refit);

  /* ------------------------------ mount ------------------------------ */
  function mount() {
    document.body.append(svg, anchor, measure, live);
    // mobile: round glass "H₂" button in the header, unless the site already placed one
    if (CFG.mobileOrb && !document.querySelector('[data-cc-orb]')) {
      const burger = document.querySelector('.header__burger');
      if (burger) {
        const orb = document.createElement('button');
        orb.type = 'button'; orb.className = 'cc-orb';
        orb.setAttribute('data-cc-open', ''); orb.setAttribute('data-cc-orb', '');
        orb.setAttribute('aria-haspopup', 'dialog');
        orb.innerHTML = '<span class="cc-orb__dot" aria-hidden="true"></span><span>H2 Concierge</span>';
        burger.parentNode.insertBefore(orb, burger);
      }
    }
    // narrow phones: if the capsule would touch the logo, stack the words ("H2 / Concierge")
    const fitOrb = () => {
      const orb = document.querySelector('[data-cc-orb]'), logo = document.querySelector('.header__logo, .site-header a[href="/"]');
      if (!orb || !logo || !visible(orb)) return;
      orb.classList.remove('cc-orb--stack');
      const lr = logo.getBoundingClientRect(), logoRight = lr.left + Math.max(lr.width, logo.scrollWidth);   // the wordmark can overflow its own box
      if (orb.getBoundingClientRect().left < logoRight + 8) orb.classList.add('cc-orb--stack');
    };
    fitOrb(); addEventListener('resize', fitOrb);
    document.fonts && document.fonts.ready.then(fitOrb);
    // every existing Concierge link becomes a lens trigger (the plain link still works without JS)
    document.addEventListener('click', e => {
      const trg = e.target.closest(CFG.triggers);
      if (!trg || anchor.contains(trg)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return;   // allow "open in new tab"
      e.preventDefault();
      if (S.open) return;
      // close the mobile menu first if the trigger lives inside it
      const burger = document.querySelector('.header__burger[aria-expanded="true"]');
      if (burger && !trg.closest('.site-header .header__inner, .header__right') && trg.closest('.mobile-nav, nav, [class*="mobile"]')) burger.click();
      S.kbd = e.detail === 0;   // keyboard activation: return focus on close
      const origin = visible(trg) && inView(trg.getBoundingClientRect()) ? trg
        : [...document.querySelectorAll(CFG.homeTriggers)].find(x => visible(x) && inView(x.getBoundingClientRect())) || trg;
      setTimeout(() => open(origin), burger ? 320 : 0);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();

  window.H2ConciergeLens = {
    version: '1.0.0',
    open: (q) => { const o = [...document.querySelectorAll(CFG.homeTriggers)].find(x => visible(x)) || document.body; return open(o).then(() => q && ask(q)); },
    close,
    config: CFG,
  };
})();
