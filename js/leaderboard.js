/**
 * 101st Hunter SQN — Website Leaderboard
 * Fetches and displays Caucasus Extended Dynamic Campaign leaderboard
 */

(function () {
    'use strict';

    const LB_CONFIG = {
        primaryApiUrl: 'http://localhost:3001/api/leaderboard',
        fallbackApiUrl: null,
        refreshInterval: 60000, // 60s
    };

    const RANK_ICONS = ['👑', '🥈', '🥉', '⭐', '⭐'];
    const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32', '#8ecae6', '#8ecae6'];

    let refreshTimer = null;

    async function fetchLeaderboard() {
        try {
            const response = await fetch(LB_CONFIG.primaryApiUrl, { cache: 'no-cache' });
            if (!response.ok) throw new Error('API unavailable');
            const data = await response.json();
            return data.primary || data.leaderboards?.[0] || null;
        } catch (err) {
            console.log('[Leaderboard] Fetch failed:', err.message);
            // Return demo data
            return {
                title: '101 Hunter SQN | Caucasus Extended Dynamic Campaign',
                pilots: [
                    { rank: 1, name: '101-Hunter[0101]', credits: 3159 },
                    { rank: 2, name: '101-Yidobaba[0098]', credits: 2210 },
                    { rank: 3, name: '101chemisTR61', credits: 1110 },
                    { rank: 4, name: '★101-EffBee[0010]', credits: 1050 },
                    { rank: 5, name: '101ArmOn1453', credits: 892 },
                ],
                stats: { totalPlayers: 25, activePilots: '25 / 40', highestScore: 3159 },
                lastUpdate: 'Demo data',
            };
        }
    }

    function renderLeaderboard(lb) {
        if (!lb) return;

        const pilots = lb.pilots || [];
        const stats = lb.stats || {};
        const maxCredits = pilots[0]?.credits || 1;

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
                    <div class="lb-podium-name">${pilots[1].name}</div>
                    <div class="lb-podium-credits">${pilots[1].credits.toLocaleString()}</div>
                    <div class="lb-podium-bar" style="height: ${60 + (pilots[1].credits / maxCredits) * 40}px;"></div>
                    <div class="lb-podium-rank">2</div>
                </div>
                <div class="lb-podium-item lb-first">
                    <div class="lb-podium-crown">👑</div>
                    <div class="lb-podium-medal">🥇</div>
                    <div class="lb-podium-name">${pilots[0].name}</div>
                    <div class="lb-podium-credits">${pilots[0].credits.toLocaleString()}</div>
                    <div class="lb-podium-bar" style="height: ${60 + (pilots[0].credits / maxCredits) * 40}px;"></div>
                    <div class="lb-podium-rank">1</div>
                </div>
                <div class="lb-podium-item lb-third">
                    <div class="lb-podium-medal">🥉</div>
                    <div class="lb-podium-name">${pilots[2].name}</div>
                    <div class="lb-podium-credits">${pilots[2].credits.toLocaleString()}</div>
                    <div class="lb-podium-bar" style="height: ${60 + (pilots[2].credits / maxCredits) * 40}px;"></div>
                    <div class="lb-podium-rank">3</div>
                </div>
            `;
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
                        <td class="lb-td-name">${p.name}</td>
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
            const existing = noteEl.querySelector('[data-i18n]');
            if (existing) {
                // Store original i18n text and just set the update info once
                if (!existing.dataset.originalText) {
                    existing.dataset.originalText = existing.textContent;
                }
                existing.textContent = existing.dataset.originalText + ` • ${lb.lastUpdate}`;
            }
        }
    }

    async function initLeaderboard() {
        const lb = await fetchLeaderboard();
        renderLeaderboard(lb);

        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = setInterval(async () => {
            const freshLb = await fetchLeaderboard();
            renderLeaderboard(freshLb);
        }, LB_CONFIG.refreshInterval);
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLeaderboard);
    } else {
        initLeaderboard();
    }
})();
