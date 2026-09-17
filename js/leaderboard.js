/**
 * 101st Hunter SQN — Website Leaderboard v2.0
 * Fetches and displays leaderboards with tab support for multiple servers
 * Updated: 2026-03-08
 */

(function () {
    'use strict';

    // -- SECURITY: HTML Sanitizer to prevent XSS attacks --
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const LB_CONFIG = {
        primaryApiUrl: IS_LOCAL ? 'http://localhost:3001/api/leaderboard' : 'https://onurklc012.github.io/101st-server-data/data/leaderboard.json',
        fallbackApiUrl: null,
        refreshInterval: 60000, // 60s
    };

    const RANK_ICONS = ['👑', '🥈', '🥉', '⭐', '⭐'];
    const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32', '#8ecae6', '#8ecae6'];

    let refreshTimer = null;
    let allLeaderboards = [];
    let activeLbIndex = 0;

    // Strip Discord markdown (**, __, *, ~~, `) from pilot names
    function cleanName(name) {
        return escapeHTML((name || '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/__(.+?)__/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/~~(.+?)~~/g, '$1')
            .replace(/`(.+?)`/g, '$1')
            .replace(/\*+/g, '')
            .trim());
    }

    // Clean lastUpdate footer text
    function cleanLastUpdate(text) {
        if (!text) return null;
        return text
            .replace(/🕒\s*/, '')
            .replace(/10\s*dk/g, '5 dk')
            .trim();
    }

    // Extract short server name from title
    function getServerLabel(lb) {
        const title = (lb.title || lb.channelName || '').toLowerCase();
        if (title.includes('caucasus')) return '🏔️ Caucasus';
        if (title.includes('syria') || title.includes('suriye')) return '🏜️ Syria';
        if (title.includes('sinai')) return '🐫 Sinai';
        if (title.includes('persian')) return '🛢️ Persian Gulf';
        return lb.title || 'Leaderboard';
    }

    async function fetchLeaderboard() {
        try {
            const response = await fetch(LB_CONFIG.primaryApiUrl, { cache: 'no-cache' });
            if (!response.ok) throw new Error('API unavailable');
            const data = await response.json();
            return data.leaderboards || (data.primary ? [data.primary] : []);
        } catch (err) {
            console.log('[Leaderboard] Fetch failed:', err.message);
            // Return demo data with 2 leaderboards
            return [
                {
                    title: '🏆 101 Hunter SQN | Caucasus Extended Dynamic Campaign',
                    pilots: [
                        { rank: 1, name: 'THE HİTMAN', credits: 170 },
                        { rank: 1, name: '101-Hunter[0101]', credits: 4797 },
                        { rank: 2, name: '101ArmOn1453', credits: 3797 },
                        { rank: 3, name: '101-HotelTango', credits: 3602 },
                        { rank: 4, name: '★101-EffBee[0010]', credits: 2144 },
                        { rank: 5, name: '101-zeshka[0035]', credits: 2064 },
                    ],
                    stats: { totalPlayers: 46, activePilots: '6', highestScore: 4797 },
                    lastUpdate: 'Demo data',
                },
                {
                    title: '🏆 101 Hunter SQN | Syria Extended Dynamic Campaign',
                    pilots: [
                        { rank: 1, name: '101-Hunter[0101]', credits: 2500 },
                        { rank: 2, name: '101ArmOn1453', credits: 1800 },
                        { rank: 3, name: '101-HotelTango', credits: 1200 },
                    ],
                    stats: { totalPlayers: 20, activePilots: '3', highestScore: 2500 },
                    lastUpdate: 'Demo data',
                }
            ];
        }
    }

    // Render leaderboard tabs
    function renderLbTabs() {
        const tabsContainer = document.getElementById('lbTabs');
        if (!tabsContainer) return;

        if (!tabsContainer || allLeaderboards.length <= 1) {
            if (tabsContainer) tabsContainer.style.display = 'none';
            return;
        }

        tabsContainer.style.display = 'flex';
        tabsContainer.innerHTML = allLeaderboards.map((lb, idx) => {
            const label = escapeHTML(getServerLabel(lb));
            const isActive = idx === activeLbIndex;
            const pilots = lb.pilots || [];
            return `
                <button class="lb-tab ${isActive ? 'active' : ''}" data-lb-index="${idx}">
                    <span class="lb-tab-label">${label}</span>
                    <span class="lb-tab-count">${pilots.length} pilot</span>
                </button>
            `;
        }).join('');

        // Event delegation for tab clicks
        tabsContainer.querySelectorAll('.lb-tab').forEach(btn => {
            btn.addEventListener('click', function() {
                switchLbTab(parseInt(this.dataset.lbIndex));
            });
        });
    }

    // Switch leaderboard tab
    function switchLbTab(index) {
        activeLbIndex = index;
        renderLbTabs();
        renderLeaderboard(allLeaderboards[index]);
    };

    function renderLeaderboard(lb) {
        if (!lb) return;

        const pilots = lb.pilots || [];
        const stats = lb.stats || {};
        const maxCredits = pilots[0]?.credits || 1;

        // Update subtitle with server name
        const subtitleEl = document.querySelector('#leaderboard .section-subtitle');
        if (subtitleEl) {
            const title = escapeHTML((lb.title || '').replace(/🏆\s*/, ''));
            subtitleEl.textContent = title || 'Extended Dynamic Campaign';
        }

        // Stats
        const totalEl = document.getElementById('lbTotalPlayers');
        const activeEl = document.getElementById('lbActivePilots');
        const highEl = document.getElementById('lbHighestScore');
        if (totalEl) totalEl.textContent = (stats.totalPlayers || pilots.length || 0).toLocaleString();
        if (activeEl) activeEl.textContent = stats.activePilots || '--';
        if (highEl) highEl.textContent = (stats.highestScore || 0).toLocaleString();

        // Podium (top 3)
        const podiumEl = document.getElementById('lbPodium');
        if (podiumEl && pilots.length >= 3) {
            podiumEl.innerHTML = `
                <div class="lb-podium-item lb-second">
                    <div class="lb-podium-medal">🥈</div>
                    <div class="lb-podium-name">${cleanName(pilots[1].name)}</div>
                    <div class="lb-podium-credits">${pilots[1].credits.toLocaleString()}</div>
                    <div class="lb-podium-bar" style="height: ${60 + (pilots[1].credits / maxCredits) * 40}px;"></div>
                    <div class="lb-podium-rank">2</div>
                </div>
                <div class="lb-podium-item lb-first">
                    <div class="lb-podium-crown">👑</div>
                    <div class="lb-podium-medal">🥇</div>
                    <div class="lb-podium-name">${cleanName(pilots[0].name)}</div>
                    <div class="lb-podium-credits">${pilots[0].credits.toLocaleString()}</div>
                    <div class="lb-podium-bar" style="height: ${60 + (pilots[0].credits / maxCredits) * 40}px;"></div>
                    <div class="lb-podium-rank">1</div>
                </div>
                <div class="lb-podium-item lb-third">
                    <div class="lb-podium-medal">🥉</div>
                    <div class="lb-podium-name">${cleanName(pilots[2].name)}</div>
                    <div class="lb-podium-credits">${pilots[2].credits.toLocaleString()}</div>
                    <div class="lb-podium-bar" style="height: ${60 + (pilots[2].credits / maxCredits) * 40}px;"></div>
                    <div class="lb-podium-rank">3</div>
                </div>
            `;
        } else if (podiumEl) {
            podiumEl.innerHTML = '<p style="text-align:center;color:var(--color-text-secondary);">Yetersiz pilot verisi</p>';
        }

        // Table
        const tbody = document.getElementById('lbTableBody');
        if (tbody) {
            tbody.innerHTML = pilots.map((p, i) => {
                const pct = ((p.credits / maxCredits) * 100).toFixed(1);
                const color = RANK_COLORS[i] || '#8ecae6';
                return `
                    <tr class="${i < 3 ? 'lb-row-top' : ''}">
                        <td class="lb-td-rank">
                            ${i < 3
                        ? `<span class="lb-rank-icon">${RANK_ICONS[i]}</span>`
                        : `<span class="lb-rank-num">${p.rank || i + 1}</span>`
                    }
                        </td>
                        <td class="lb-td-name">${cleanName(p.name)}</td>
                        <td class="lb-td-credits">${p.credits.toLocaleString()}</td>
                        <td class="lb-td-bar">
                            <div class="lb-bar-track">
                                <div class="lb-bar-fill" style="width:${pct}%;background:${color}"></div>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Update note
        const noteEl = document.getElementById('lbUpdateNote');
        if (noteEl && lb.lastUpdate) {
            const cleaned = cleanLastUpdate(lb.lastUpdate);
            const existing = noteEl.querySelector('[data-i18n]');
            if (existing) {
                if (!existing.dataset.originalText) {
                    existing.dataset.originalText = existing.textContent;
                }
                existing.textContent = existing.dataset.originalText + ` • ⏱ ${cleaned}`;
            }
        }
    }

    async function initLeaderboard() {
        allLeaderboards = await fetchLeaderboard();
        if (allLeaderboards.length > 0) {
            activeLbIndex = 0;
            renderLbTabs();
            renderLeaderboard(allLeaderboards[0]);
        }

        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = setInterval(async () => {
            allLeaderboards = await fetchLeaderboard();
            if (allLeaderboards.length > 0) {
                if (activeLbIndex >= allLeaderboards.length) activeLbIndex = 0;
                renderLbTabs();
                renderLeaderboard(allLeaderboards[activeLbIndex]);
            }
        }, LB_CONFIG.refreshInterval);
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLeaderboard);
    } else {
        initLeaderboard();
    }
})();
