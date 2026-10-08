/* Background music: every visit starts with "Ascend to Glory". Browsers only allow sound after the
   visitor has interacted with the page, so if the immediate start is blocked it begins on the first
   click / tap / key press. A visitor who switches it off stays off (remembered in this browser).
   Tracks: Pixabay Content License (free, no attribution required) — credits kept here anyway. */
(function () {
  const TRACKS = [
    { file: 'assets/audio/ascend-to-glory.mp3', title: 'Ascend to Glory', artist: 'Grand_Project' },
    { file: 'assets/audio/epic-hair-metal-synth-rock.mp3', title: 'Epic Hair Metal Synth Rock', artist: 'NickPanek' },
    { file: 'assets/audio/neon-afterglow.mp3', title: 'Neon Afterglow', artist: 'MemoryArcade' },
    { file: 'assets/audio/sunset-rider.mp3', title: 'Sunset Rider', artist: 'FASSounds' },
    { file: 'assets/audio/80s-rocky-upbeat-training.mp3', title: '80s Rocky Upbeat Training', artist: 'DIMMYSAD' },
  ];
  const KEY = 'site.music';
  const VOLUME = 0.35;
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  document.addEventListener('DOMContentLoaded', () => {
    const saved = store.get();
    let index = 0;                                   // always open with Ascend to Glory
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = VOLUME;

    const box = document.createElement('div');
    box.className = 'music';
    box.innerHTML = `
      <button type="button" class="music-btn" aria-pressed="false" aria-label="Music">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>
      <div class="music-info" hidden><span class="music-title"></span>
        <button type="button" class="music-next" aria-label="Next track">⏭</button></div>`;
    document.body.append(box);
    const btn = box.querySelector('.music-btn');
    const info = box.querySelector('.music-info');
    const title = box.querySelector('.music-title');

    const show = () => { title.textContent = `${TRACKS[index].title} — ${TRACKS[index].artist}`; };
    const setUi = (on) => { btn.setAttribute('aria-pressed', on); box.classList.toggle('on', on); info.hidden = !on; };

    async function play() {
      if (audio.dataset.track !== String(index)) { audio.src = TRACKS[index].file; audio.dataset.track = index; }
      show();
      try { await audio.play(); setUi(true); store.set({ on: true, track: index }); } catch { setUi(false); }
    }
    function pause() { audio.pause(); setUi(false); store.set({ on: false, track: index }); }
    function next() { index = (index + 1) % TRACKS.length; play(); }

    btn.addEventListener('click', () => (audio.paused ? play() : pause()));
    box.querySelector('.music-next').addEventListener('click', next);
    audio.addEventListener('ended', next);
    audio.addEventListener('error', () => { if (!audio.paused || box.classList.contains('on')) next(); });

    // On unless this visitor switched it off before: try right away, then again on scrolling and on
    // the first tap / click / key. Browsers accept a tap, click or key as permission for sound;
    // a mouse-wheel scroll usually isn't, so on desktop it may wait for the first click.
    if (saved.on !== false) {
      const EVENTS = ['wheel', 'scroll', 'touchend', 'pointerdown', 'pointerup', 'keydown'];
      const stop = () => EVENTS.forEach((t) => removeEventListener(t, attempt, true));
      let busy = false;
      async function attempt(e) {
        if (busy || !audio.paused || store.get().on === false) { stop(); return; }
        if (e && box.contains(e.target)) return;      // the button handles itself
        busy = true;
        await play();
        busy = false;
        if (!audio.paused) stop();
      }
      EVENTS.forEach((t) => addEventListener(t, attempt, { capture: true, passive: true }));
      attempt();
    }
  });
})();
