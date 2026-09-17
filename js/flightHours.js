/**
 * 101st Hunter SQN — Fleet Roster & Flight Hours
 * Fetches and displays pilot flight hours from Discord
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

    const FH_CONFIG = {
        apiUrl: IS_LOCAL
            ? 'http://localhost:3001/api/flight-hours'
            : 'https://onurklc012.github.io/101st-server-data/data/flight-hours.json',
        membersUrl: IS_LOCAL
            ? 'http://localhost:3001/api/members'
            : 'https://onurklc012.github.io/101st-server-data/data/members.json',
        refreshInterval: 120000, // 2 min
    };

    const RANK_ICONS = ['🥇', '🥈', '🥉'];
    let flightData = null;
    let membersData = null;
    let refreshTimer = null;
    let showAll = true;

    function formatTime(hours, minutes) {
        return `${hours}s ${minutes}dk`;
    }

    function getProgressColor(index) {
        if (index === 0) return '#ffd700';
        if (index === 1) return '#c0c0c0';
        if (index === 2) return '#cd7f32';
        return '#4a9eff';
    }

    // Match pilot to members data for avatar
    function findMemberAvatar(pilotName) {
        if (!membersData || !membersData.members) return null;
        const cleanPilot = pilotName
            .replace(/[⍟@★✯\[\]()]/g, '')
            .replace(/\d{4,}/g, '')
            .toLowerCase()
            .trim();

        for (const m of membersData.members) {
            const cleanMember = m.displayName
                .replace(/[⍟@★✯\[\]()]/g, '')
                .replace(/\d{4,}/g, '')
                .toLowerCase()
                .trim();
            if (cleanMember.includes(cleanPilot) || cleanPilot.includes(cleanMember)) {
                // Validate avatar URL — only allow Discord CDN URLs
                const avatar = m.avatar || '';
                if (avatar.startsWith('https://cdn.discordapp.com/') || avatar.startsWith('https://i.imgur.com/')) {
                    return avatar;
                }
                return null;
            }
        }
        return null;
    }

    async function fetchFlightData() {
        try {
            const [fhRes, memRes] = await Promise.all([
                fetch(FH_CONFIG.apiUrl, { cache: 'no-cache' }),
                fetch(FH_CONFIG.membersUrl, { cache: 'no-cache' }),
            ]);
            if (fhRes.ok) flightData = await fhRes.json();
            if (memRes.ok) membersData = await memRes.json();
        } catch (err) {
            console.log('[FlightHours] Fetch failed:', err.message);
        }

        // Fallback demo data (all 32 pilots from Discord)
        if (!flightData) {
            flightData = {
                pilots: [
                    { rank: 1, name: '101-Hunter[0101]', hours: 852, minutes: 17, totalMinutes: 51137 },
                    { rank: 2, name: '★101-Emrecan[0444]★', hours: 171, minutes: 54, totalMinutes: 10314 },
                    { rank: 3, name: '101ArmOn1453', hours: 152, minutes: 5, totalMinutes: 9125 },
                    { rank: 4, name: '101-Tunay [5555]', hours: 99, minutes: 54, totalMinutes: 5994 },
                    { rank: 5, name: '★101-EffBee[0010]★', hours: 93, minutes: 47, totalMinutes: 5627 },
                    { rank: 6, name: '101-Yidobaba[0098]', hours: 85, minutes: 12, totalMinutes: 5112 },
                    { rank: 7, name: '101 - Asil Turq [1919]', hours: 76, minutes: 24, totalMinutes: 4584 },
                    { rank: 8, name: '101-Maskot(0019)', hours: 60, minutes: 42, totalMinutes: 3642 },
                    { rank: 9, name: '101chemisTR61', hours: 59, minutes: 23, totalMinutes: 3563 },
                    { rank: 10, name: '101-SKY', hours: 58, minutes: 42, totalMinutes: 3522 },
                    { rank: 11, name: '101-zeshka[0035]', hours: 55, minutes: 36, totalMinutes: 3336 },
                    { rank: 12, name: '101-HotelTango', hours: 43, minutes: 47, totalMinutes: 2627 },
                    { rank: 13, name: '101-Shadow[1881]', hours: 38, minutes: 17, totalMinutes: 2297 },
                    { rank: 14, name: '@101-Longec[0007]@', hours: 36, minutes: 23, totalMinutes: 2183 },
                    { rank: 15, name: '101-Rabik', hours: 29, minutes: 36, totalMinutes: 1776 },
                    { rank: 16, name: '101-Nos', hours: 24, minutes: 48, totalMinutes: 1488 },
                    { rank: 17, name: '101-Cuce [0011]', hours: 22, minutes: 41, totalMinutes: 1361 },
                    { rank: 18, name: '101-MrMercans', hours: 19, minutes: 41, totalMinutes: 1181 },
                    { rank: 19, name: '[-101-]KAAN VIPER', hours: 19, minutes: 6, totalMinutes: 1146 },
                    { rank: 20, name: '101-WOLF [0033]', hours: 16, minutes: 30, totalMinutes: 990 },
                    { rank: 21, name: '101-Antares', hours: 10, minutes: 54, totalMinutes: 654 },
                    { rank: 22, name: '101-DrakeN', hours: 6, minutes: 42, totalMinutes: 402 },
                    { rank: 23, name: '101 - Dagger', hours: 5, minutes: 30, totalMinutes: 330 },
                    { rank: 24, name: '101-Brakelesss', hours: 4, minutes: 35, totalMinutes: 275 },
                    { rank: 25, name: '101-Berserk', hours: 4, minutes: 30, totalMinutes: 270 },
                    { rank: 26, name: '101-WARGOD', hours: 4, minutes: 0, totalMinutes: 240 },
                    { rank: 27, name: '101-Fish', hours: 3, minutes: 53, totalMinutes: 233 },
                    { rank: 28, name: '101-Tango[0001]', hours: 3, minutes: 47, totalMinutes: 227 },
                    { rank: 29, name: 'Arda | "Wraith" 101', hours: 2, minutes: 23, totalMinutes: 143 },
                    { rank: 30, name: '101 treXoS', hours: 1, minutes: 36, totalMinutes: 96 },
                    { rank: 31, name: '101-Vettel', hours: 1, minutes: 11, totalMinutes: 71 },
                    { rank: 32, name: '101-Goblin', hours: 0, minutes: 30, totalMinutes: 30 },
                ],
                stats: {
                    totalFlightTime: '2066s 30dk',
                    pilotCount: 32,
                    totalKills: 4979,
                },
                lastUpdate: 'Son güncelleme: 08.03.2026 18:08 • Her 1 saatte güncellenir',
            };
        }
    }

    function renderFlightHours() {
        if (!flightData) return;

        const pilots = flightData.pilots || [];
        const stats = flightData.stats || {};
        const maxMinutes = pilots[0]?.totalMinutes || 1;

        // Stats
        const totalEl = document.getElementById('fhTotalTime');
        const pilotEl = document.getElementById('fhPilotCount');
        const killEl = document.getElementById('fhTotalKills');
        if (totalEl) totalEl.textContent = stats.totalFlightTime || '--';
        if (pilotEl) pilotEl.textContent = stats.pilotCount || pilots.length;
        if (killEl) killEl.textContent = (stats.totalKills || 0).toLocaleString();

        // Decide how many to show
        const displayPilots = showAll ? pilots : pilots.slice(0, 10);

        // Table
        const tbody = document.getElementById('fhTableBody');
        if (tbody) {
            tbody.innerHTML = displayPilots.map((p, i) => {
                const pct = ((p.totalMinutes / maxMinutes) * 100).toFixed(1);
                const color = getProgressColor(i);
                const avatar = findMemberAvatar(p.name);
                const avatarHtml = avatar
                    ? `<img src="${escapeHTML(avatar)}" alt="" class="fh-avatar" loading="lazy">`
                    : `<span class="fh-avatar-placeholder">✈️</span>`;
                return `
                    <tr class="${i < 3 ? 'fh-row-top' : ''}">
                        <td class="fh-td-rank">
                            ${i < 3
                        ? `<span class="fh-rank-icon">${RANK_ICONS[i]}</span>`
                        : `<span class="fh-rank-num">${p.rank}</span>`
                    }
                        </td>
                        <td class="fh-td-pilot">
                            <div class="fh-pilot-wrap" style="display:flex;align-items:center;overflow:hidden">
                                ${avatarHtml}
                                <span class="fh-pilot-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHTML(p.name)}</span>
                            </div>
                        </td>
                        <td class="fh-td-time">${formatTime(p.hours, p.minutes)}</td>
                        <td class="fh-td-bar">
                            <div class="fh-bar-track">
                                <div class="fh-bar-fill" style="width:${pct}%;background:${color}"></div>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Show more / less button
        const moreBtn = document.getElementById('fhShowMore');
        if (moreBtn) {
            if (pilots.length > 10) {
                moreBtn.style.display = 'inline-flex';
                moreBtn.textContent = showAll ? '▲ Daha Az Göster' : `▼ Tümünü Göster (${pilots.length})`;
                moreBtn.onclick = () => {
                    showAll = !showAll;
                    renderFlightHours();
                };
            } else {
                moreBtn.style.display = 'none';
            }
        }

        // Update note
        const noteEl = document.getElementById('fhUpdateNote');
        if (noteEl && flightData.lastUpdate) {
            const cleaned = flightData.lastUpdate
                .replace(/🕒\s*/, '')
                .replace(/⏰\s*/, '')
                .trim();
            const existing = noteEl.querySelector('[data-i18n]');
            if (existing) {
                if (!existing.dataset.originalText) {
                    existing.dataset.originalText = existing.textContent;
                }
                existing.textContent = existing.dataset.originalText + ` • ⏱ ${cleaned}`;
            }
        }
    }

    async function initFlightHours() {
        await fetchFlightData();
        renderFlightHours();

        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = setInterval(async () => {
            await fetchFlightData();
            renderFlightHours();
        }, FH_CONFIG.refreshInterval);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFlightHours);
    } else {
        initFlightHours();
    }
})();
