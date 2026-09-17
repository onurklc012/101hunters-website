/* =====================================================
   SOUND FX - Web Audio API based sound effects
   Toggle on/off with floating button
   ===================================================== */
(function () {
    'use strict';

    let audioContext = null;
    let soundEnabled = false;

    function getAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    // Generate a short click/tick sound
    function playTick() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) { /* silent fail */ }
    }

    // Generate a whoosh/jet pass sound
    function playWhoosh() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const bufferSize = ctx.sampleRate * 0.3;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const bandpass = ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(2000, ctx.currentTime);
            bandpass.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.3);
            bandpass.Q.value = 2;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            source.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(ctx.destination);
            source.start(ctx.currentTime);
        } catch (e) { /* silent fail */ }
    }

    // Generate intro siren sound
    function playIntroSiren() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.8);
            osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.6);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 2);
        } catch (e) { /* silent fail */ }
    }

    // Create toggle button
    function createSoundToggle() {
        var btn = document.createElement('button');
        btn.className = 'sound-toggle';
        btn.id = 'soundToggle';
        btn.setAttribute('aria-label', 'Toggle sound effects');
        btn.innerHTML = '🔇';
        btn.addEventListener('click', function () {
            soundEnabled = !soundEnabled;
            btn.innerHTML = soundEnabled ? '🔊' : '🔇';
            btn.classList.toggle('active', soundEnabled);
            if (soundEnabled) {
                getAudioContext();
                playTick();
            }
        });
        document.body.appendChild(btn);
    }

    // Attach hover sounds
    function attachSounds() {
        // Hover tick on buttons and links
        var hoverElements = document.querySelectorAll('.btn, .nav-links a, .server-tab, .ops-card, .gallery-item, .footer-socials a, .leader-card');
        hoverElements.forEach(function (el) {
            el.addEventListener('mouseenter', playTick);
        });

        // Whoosh on section scroll reveal
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && soundEnabled) {
                    playWhoosh();
                }
            });
        }, { threshold: 0.2 });

        var sections = document.querySelectorAll('.section');
        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        createSoundToggle();
        attachSounds();

        // Play siren after intro
        var intro = document.getElementById('intro');
        if (intro) {
            var introObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (m) {
                    if (m.target.classList.contains('hidden')) {
                        setTimeout(playIntroSiren, 500);
                        introObserver.disconnect();
                    }
                });
            });
            introObserver.observe(intro, { attributes: true, attributeFilter: ['class'] });
        }
    });
})();
