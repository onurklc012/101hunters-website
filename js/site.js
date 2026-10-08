/* 101st Hunter Squadron website: navigation, live data from Hunters HQ, live map, gallery. */
(function () {
  // Local preview (python -m http.server on this PC) talks to HQ directly.
  const API = location.hostname === 'localhost' ? 'http://127.0.0.1:8100/api/v1/public'
    : 'https://hq.101huntersqn.com/api/v1/public';
  const $ = (sel, root = document) => root.querySelector(sel);
  const t = (key, vars) => window.I18N.t(key, vars);
  const fmt = (n) => new Intl.NumberFormat(window.I18N.lang === 'en' ? 'en-US' : 'tr-TR').format(n);

  /** Small DOM builder: text always goes in as text, never as HTML. */
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c.nodeType ? c : String(c));
    return el;
  }

  async function getJSON(path) {
    const res = await fetch(API + path, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(res.status);
    return res.json();
  }

  let toastTimer;
  function toast(text) {
    const el = $('#toast');
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = h('textarea', { style: 'position:fixed;opacity:0' }, text);
      document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    toast(t('srv.copied', { v: text }));
  }

  // ── chrome: header, menu, reveal, hero video ────────────────────────────
  function setupChrome() {
    const header = $('.site-header');
    const onScroll = () => header.classList.toggle('solid', scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const nav = $('#nav');
    const toggle = $('.menu-toggle');
    toggle?.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    nav?.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', false); } });

    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

    // The 13 MB hero video only on big screens, not on phones / data saver / reduced motion.
    const video = $('#heroVideo');
    const lowData = navigator.connection?.saveData || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (video && !lowData && matchMedia('(min-width: 900px)').matches) {
      video.src = 'assets/video/hero-bg.mp4';
      video.play().catch(() => {});
    }
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  // ── squadron numbers ────────────────────────────────────────────────────
  function countUp(el, value) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.textContent = fmt(value); return; }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / 1400);
      el.textContent = fmt(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  async function loadSquadron() {
    try {
      const s = await getJSON('/squadron');
      document.querySelectorAll('[data-stat]').forEach((el) => countUp(el, s[el.dataset.stat] ?? 0));
    } catch { /* numbers stay as dashes */ }
  }

  // ── servers ─────────────────────────────────────────────────────────────
  let lastStatus = null;

  function renderServers() {
    const box = $('#serverList');
    const strip = $('#liveText');
    const dot = $('#liveDot');
    if (!box) return;
    if (!lastStatus) {
      box.replaceChildren(h('div', { class: 'notice' }, t('srv.down')));
      strip.textContent = t('live.offline');
      dot.className = 'dot off';
      return;
    }
    const list = lastStatus.servers;
    const on = list.filter((s) => s.state === 'online');
    const pilots = on.reduce((n, s) => n + (s.players || 0), 0);
    strip.textContent = t('live.summary', { on: on.length, all: list.length, p: pilots });
    dot.className = `dot ${on.length ? 'ok' : 'off'}`;
    if (!list.length) { box.replaceChildren(h('div', { class: 'notice' }, t('srv.none'))); return; }

    const copyBtn = (label, value) => h('button', { class: 'copy', type: 'button', onclick: () => copy(value), title: t('srv.copy') },
      h('span', {}, value), h('small', {}, label));
    box.replaceChildren(...list.map((s) => h('article', { class: 'panel server' },
      h('div', { class: 'server-top' },
        h('h3', {}, s.name.replace(/^101(st)?\s+Hunters?\s+SQN\s*\|\s*/i, '')),
        h('span', { class: `badge ${s.state}` }, h('span', { class: `dot ${s.state === 'online' ? 'ok' : s.state === 'offline' ? 'off' : 'warn'}` }), t(`st.${s.state}`))),
      h('dl', { class: 'server-meta' },
        h('div', {}, h('dt', {}, t('srv.mission')), h('dd', {}, (s.mission || '—').replace(/_/g, ' '))),
        h('div', {}, h('dt', {}, t('srv.map')), h('dd', {}, s.theatre || '—')),
        h('div', {}, h('dt', {}, t('srv.players')), h('dd', {}, s.state === 'online' ? String(s.players) : '—'))),
      s.state !== 'offline' && (s.address || s.srs?.address) ? h('div', { class: 'connect' },
        s.address ? copyBtn(t('srv.game'), s.address) : null,
        s.srs?.address ? copyBtn(t('srv.srs'), s.srs.address) : null) : null)));
  }

  async function loadStatus() {
    try { lastStatus = await getJSON('/status'); } catch { lastStatus = null; }
    renderServers();
  }

  // ── leaderboards ────────────────────────────────────────────────────────
  let boards = null;
  let activeBoard = 'flight_hours';

  function boardRows(key) {
    if (!boards) return [];
    const rows = boards[key] || [];
    switch (key) {
      case 'flight_hours': return rows.map((r) => ({ who: r.name, val: `${fmt(Math.round(r.hours))} ${t('unit.h')}` }));
      case 'refuels': return rows.map((r) => ({
        who: r.name, val: `${r.total} ${t('unit.refuel')}`,
        sub: Object.entries(r.modules).sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m} ×${n}`).join(', ') }));
      case 'aircraft': return rows.map((r) => ({ who: r.name, val: `${fmt(Math.round(r.value))} ${t('unit.h')}` }));
      default: return rows.map((r) => ({ who: r.name, val: `${fmt(r.value)} ${t('unit.kills')}` }));
    }
  }

  function renderBoard() {
    const body = $('#boardBody');
    if (!body) return;
    if (!boards) { body.replaceChildren(h('div', { class: 'notice' }, t('srv.down'))); return; }
    const rows = boardRows(activeBoard);
    if (!rows.length) { body.replaceChildren(h('div', { class: 'notice' }, t('board.none'))); return; }
    const medals = ['🥇', '🥈', '🥉'];
    const top = rows.slice(0, 3);
    const podium = h('div', { class: 'podium' }, ...[1, 0, 2].filter((i) => top[i]).map((i) =>
      h('div', { class: `p${i + 1}` }, h('div', { class: 'medal' }, medals[i]), h('div', { class: 'who' }, top[i].who),
        h('div', { class: 'val' }, top[i].val), top[i].sub ? h('div', { class: 'sub', style: 'color:var(--faint);font-size:12px;margin-top:4px' }, top[i].sub) : null)));
    const rest = rows.slice(3, 25);
    const list = h('ol', { class: 'rank-list', start: 4 }, ...rest.map((r, i) =>
      h('li', {}, h('span', { class: 'n' }, String(i + 4)), h('span', { class: 'who' }, r.who, r.sub ? h('span', { class: 'sub' }, r.sub) : null),
        h('span', { class: 'val' }, r.val))));
    const when = new Date(boards.updated_at).toLocaleTimeString(window.I18N.lang === 'en' ? 'en-GB' : 'tr-TR', { hour: '2-digit', minute: '2-digit' });
    body.replaceChildren(podium, rest.length ? list : '', h('div', { class: 'boards-foot' }, t('board.updated', { t: when })));
  }

  async function loadBoards() {
    try { boards = await getJSON('/leaderboards'); } catch { boards = null; }
    renderBoard();
  }

  function setupBoardTabs() {
    $('#boardTabs')?.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-board]');
      if (!tab) return;
      activeBoard = tab.dataset.board;
      document.querySelectorAll('#boardTabs .tab').forEach((b) => b.classList.toggle('on', b === tab));
      renderBoard();
    });
  }

  // ── live map ────────────────────────────────────────────────────────────
  let map, layer, mapData = null, mapServer = null, fitted = false;

  function ensureMap() {
    if (map || !window.L || !$('#mapCanvas')) return !!map;
    map = L.map('mapCanvas', { zoomControl: true, attributionControl: true, worldCopyJump: true }).setView([36.6, 37.5], 6);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 13, attribution: 'Tiles © Esri',
    }).addTo(map);
    layer = L.layerGroup().addTo(map);
    return true;
  }

  function renderMap() {
    const tabs = $('#mapTabs');
    const empty = $('#mapEmpty');
    if (!tabs || !ensureMap()) return;
    const servers = mapData?.servers || [];
    if (!servers.find((s) => s.name === mapServer)) { mapServer = servers[0]?.name ?? null; fitted = false; }
    tabs.replaceChildren(...servers.map((s) => h('button', {
      class: `tab ${s.name === mapServer ? 'on' : ''}`, type: 'button',
      onclick: () => { mapServer = s.name; fitted = false; renderMap(); },
    }, s.name.replace(/^101(st)?\s+Hunters?\s+SQN\s*\|\s*/i, ''), h('span', { class: 'count' }, String(s.aircraft.length)))));
    layer.clearLayers();
    const current = servers.find((s) => s.name === mapServer);
    empty.hidden = !!current?.aircraft.length;
    if (!current) return;
    const points = [];
    for (const a of current.aircraft) {
      const side = a.side === 'blue' || a.side === 'red' ? a.side : 'neutral';
      const marker = L.marker([a.lat, a.lon], { icon: L.divIcon({ className: '', html: `<div class="ac-icon ${side}"></div>`, iconSize: [14, 14] }) });
      const tip = document.createElement('div');
      tip.append(h('b', {}, a.name || '?'), h('br'), `${a.type || ''} · ${fmt(a.alt_ft)} ft · ${fmt(a.speed_kts)} kts`);
      marker.bindTooltip(tip, { direction: 'top', offset: [0, -8] });
      marker.addTo(layer);
      points.push([a.lat, a.lon]);
    }
    if (points.length && !fitted) { map.fitBounds(points, { padding: [40, 40], maxZoom: 8 }); fitted = true; }
  }

  async function loadMap() {
    try { mapData = await getJSON('/livemap'); } catch { mapData = null; }
    renderMap();
  }

  // ── gallery + lightbox ──────────────────────────────────────────────────
  async function setupGallery() {
    const grid = $('#galleryGrid');
    if (!grid) return;
    let items = [];
    try { items = await (await fetch('assets/img/gallery/gallery.json')).json(); } catch { return; }
    grid.replaceChildren(...items.map((it, i) => h('button', { type: 'button', 'data-i': i, 'aria-label': `${i + 1} / ${items.length}` },
      h('img', { src: it.thumb, alt: '', loading: 'lazy', width: 640, height: Math.round(640 * it.h / it.w) }))));
    const box = $('#lightbox');
    const img = $('img', box);
    let cur = 0;
    const show = (i) => { cur = (i + items.length) % items.length; img.src = items[cur].src; box.hidden = false; };
    const close = () => { box.hidden = true; img.removeAttribute('src'); };
    grid.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) show(Number(b.dataset.i)); });
    $('.close', box).addEventListener('click', close);
    $('.prev', box).addEventListener('click', () => show(cur - 1));
    $('.next', box).addEventListener('click', () => show(cur + 1));
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupChrome();
    if (!$('#serverList')) return;               // other pages only need the chrome
    setupBoardTabs();
    setupGallery();
    loadSquadron();
    loadStatus();
    loadBoards();
    loadMap();
    setInterval(loadStatus, 30000);
    setInterval(loadMap, 10000);
    setInterval(loadBoards, 300000);
    document.addEventListener('langchange', () => { renderServers(); renderBoard(); renderMap(); loadSquadron(); });
  });

  window.SITE = { h, toast, API };
})();
