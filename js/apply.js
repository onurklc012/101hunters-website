/* Application form → Hunters HQ (/api/v1/public/apply). */
(function () {
  const t = (key, vars) => window.I18N.t(key, vars);

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('applyForm');
    const error = document.getElementById('formError');
    if (!form) return;
    const showError = (text) => { error.textContent = text; error.hidden = false; error.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      error.hidden = true;
      const fd = new FormData(form);
      const modules = fd.getAll('module');

      // Required fields, named the way the visitor sees them.
      const missing = [...form.querySelectorAll('[required]')]
        .filter((el) => (el.type === 'radio' ? !form.querySelector(`[name="${el.name}"]:checked`) : !String(el.value).trim()))
        .map((el) => el.closest('.field')?.querySelector('b')?.textContent.trim())
        .filter((v, i, a) => v && a.indexOf(v) === i);
      if (missing.length) { showError(t('ap.need', { f: missing.join(', ') })); return; }
      if (!modules.length) { showError(t('ap.module.need')); return; }

      const body = {
        full_name: fd.get('full_name').trim(),
        discord: fd.get('discord').trim(),
        age: Number(fd.get('age')) || null,
        city: fd.get('city').trim(),
        callsign: fd.get('callsign').trim(),
        dcs_name: fd.get('dcs_name').trim() || null,
        modules: modules.join(', '),
        experience: fd.get('experience'),
        hotas: fd.get('hotas').trim(),
        head_tracking: fd.get('head_tracking'),
        schedule: fd.get('schedule'),
        rules_accepted: fd.get('rules') === 'yes',
        message: fd.get('message').trim() || null,
        website: fd.get('website') || null,
      };

      const button = form.querySelector('[type=submit]');
      const label = button.textContent;
      button.disabled = true;
      button.textContent = t('ap.sending');
      try {
        const res = await fetch(`${window.SITE.API}/apply`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const detail = Array.isArray(data?.detail) ? data.detail.map((d) => `${(d.loc || []).slice(-1)[0]}: ${d.msg}`).join('; ')
            : data?.detail || `HTTP ${res.status}`;
          showError(t('ap.fail', { e: detail }));
          return;
        }
        const { h } = window.SITE;
        document.getElementById('formArea').replaceChildren(h('div', { class: 'panel success' },
          h('div', { class: 'big' }, '🦅'), h('h2', {}, t('ap.ok.t')), h('p', {}, t('ap.ok')),
          h('a', { class: 'btn btn-fire', href: 'https://discord.com/invite/101huntersqn', target: '_blank', rel: 'noopener' }, t('ap.discord'))));
        scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        showError(t('ap.offline'));
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  });
})();
