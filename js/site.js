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

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  // ── next squadron sortie: Friday 21:00 training, Saturday 21:00 operations (Turkey, UTC+3) ──
  const SORTIES = [{ day: 5, key: 'sortie.training' }, { day: 6, key: 'sortie.ops' }];
  const TR_OFFSET_H = 3;                          // Turkey has no daylight saving time

  function nextSortie(now = new Date()) {
    let best = null;
    for (const s of SORTIES) {
      // 21:00 Turkey time = 18:00 UTC on that weekday
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 21 - TR_OFFSET_H));
      d.setUTCDate(d.getUTCDate() + ((s.day - d.getUTCDay() + 7) % 7));
      if (d.getTime() + 2 * 3600e3 < now.getTime()) d.setUTCDate(d.getUTCDate() + 7);   // over = next week
      if (!best || d < best.at) best = { at: d, key: s.key };
    }
    return best;
  }

  function renderSortie() {
    const el = $('#nextSortie');
    if (!el) return;
    const { at, key } = nextSortie();
    const ms = at.getTime() - Date.now();
    let when;
    if (ms <= 0) when = t('sortie.now');
    else {
      const d = Math.floor(ms / 86400e3), hrs = Math.floor((ms % 86400e3) / 3600e3), min = Math.floor((ms % 3600e3) / 60e3);
      when = d > 0 ? t('sortie.dh', { d, h: hrs }) : hrs > 0 ? t('sortie.hm', { h: hrs, m: min }) : t('sortie.m', { m: min });
    }
    el.textContent = `${t(key)} · ${when}`;
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

  // ── Discord community card ──────────────────────────────────────────────
  async function loadDiscord() {
    try {
      const d = await getJSON('/discord');
      if (d.members) $('#dcMembers').textContent = fmt(d.members);
      if (d.online) $('#dcOnline').textContent = fmt(d.online);
      if (d.invite) $('#discordCard').href = d.invite;
    } catch { /* card still links to Discord */ }
  }

  // ── pilot testimonials (assets/testimonials.json: [{quote, name, role}]) ─
  async function loadVoices() {
    const section = $('#voices');
    if (!section) return;
    let items = [];
    try { items = await (await fetch('assets/testimonials.json', { cache: 'no-cache' })).json(); } catch { return; }
    if (!Array.isArray(items) || !items.length) return;
    const initials = (n) => String(n).replace(/^\W*101\W*/, '').slice(0, 2).toUpperCase();
    $('#voiceList').replaceChildren(...items.map((v) => h('figure', { class: 'panel voice', style: 'margin:0' },
      h('blockquote', {}, v.quote),
      h('figcaption', { class: 'who' }, h('span', {}, initials(v.name)), h('span', {}, h('b', {}, v.name), v.role ? h('small', {}, v.role) : null)))));
    section.hidden = false;
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
    loadDiscord();
    loadVoices();
    setInterval(loadStatus, 30000);
    renderSortie();
    setInterval(renderSortie, 30000);
    setInterval(loadBoards, 300000);
    document.addEventListener('langchange', () => { renderServers(); renderBoard(); renderSortie(); loadSquadron(); });
  });

  window.SITE = { h, toast, API };
})();
