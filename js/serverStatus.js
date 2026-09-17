// =====================================================
// SERVER STATUS - Fetches and displays DCS server info
// Supports multiple servers with tab switching
// =====================================================

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

// Detect if running locally
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const SERVER_CONFIG = {
    primaryApiUrl: IS_LOCAL ? 'http://localhost:3001/api/server-status' : 'https://onurklc012.github.io/101st-server-data/data/server-status.json',
    fallbackApiUrl: IS_LOCAL ? null : 'https://onurklc012.github.io/101st-server-data/data/server-status.json',
    refreshInterval: 30000,
    demoMode: false
};

// Demo fallback data — shown when API is unavailable (deployed site)
const DEMO_SERVERS = [
    {
        online: true,
        friendlyName: 'Caucasus',
        serverName: '101 Hunter SQN | Caucasus | Server',
        mission: '101_Hunter_SQN_v9_5',
        map: 'Caucasus',
        mapId: 'caucasus',
        players: 1,
        maxPlayers: 32,
        missionTime: '12:27',
        missionDate: '2026-04-21',
        serverIP: '***.***.***:10308',
        playerList: [],
        activePlayers: { blue: [], red: [], neutral: [] },
        weather: { temperature: '5.4°C', clouds: 'Two Layer Scattered / Broken High', visibility: '10 km / 6 SM', wind: 'Ground: 281° / 2 kts', qnh: '1013 hPa' },
        slots: { blue: { used: 0, total: 134 }, red: { used: 0, total: 16 } },
        missionStats: null,
    },
    {
        online: true,
        friendlyName: 'Syria',
        serverName: '101 Hunter SQN | Syria | Server',
        mission: '101_Hunter_SQN_SURIYE_v3_7',
        map: 'Syria',
        mapId: 'syria',
        players: 1,
        maxPlayers: 32,
        missionTime: '16:18',
        missionDate: '2026-08-01',
        serverIP: '***.***.***:10309',
        playerList: [],
        activePlayers: { blue: [], red: [], neutral: [] },
        weather: { temperature: '20.0°C', clouds: 'Few Scattered Clouds', visibility: '10 km / 6 SM', wind: 'Ground: 198° / 4 kts', qnh: '1013 hPa' },
        slots: { blue: { used: 0, total: 12 }, red: { used: 0, total: 9 } },
        missionStats: null,
    },
    {
        online: true,
        friendlyName: 'Syria Dynamic',
        serverName: '101 Hunter SQN | Syria Extended Dynamic Campaign',
        mission: '101 Hunters SQN - Syria - Modern Warfare',
        map: 'Syria',
        mapId: 'syria',
        players: 1,
        maxPlayers: 32,
        missionTime: '22:12',
        missionDate: '2025-07-01',
        serverIP: '***.***.***:10310',
        playerList: [],
        activePlayers: { blue: [], red: [], neutral: [] },
        weather: { temperature: '20.0°C', clouds: 'Clear', visibility: '10 km / 6 SM', wind: 'Ground: 233° / 4 kts', qnh: '1016 hPa' },
        slots: { blue: { used: 0, total: 122 }, red: { used: 0, total: 7 } },
        missionStats: null,
    },
    {
        online: true,
        friendlyName: 'Caucasus Dynamic',
        serverName: '101 Hunter SQN | Caucasus Extended Dynamic Campaign',
        mission: '101 Hunters SQN - Kafkas - Modern Warfare',
        map: 'Caucasus',
        mapId: 'caucasus',
        players: 1,
        maxPlayers: 32,
        missionTime: '19:37',
        missionDate: '2024-10-31',
        serverIP: '***.***.***:10311',
        playerList: [],
        activePlayers: { blue: [], red: [], neutral: [] },
        weather: { temperature: '-6.6°C', clouds: 'Two Layers Scattered / Large Clouds High Ceiling', visibility: '10 km / 6 SM', wind: 'Ground: 50° / 4 kts', qnh: '1022 hPa' },
        slots: { blue: { used: 0, total: 69 }, red: { used: 0, total: 2 } },
        missionStats: null,
    }
];

// Map icons for server tabs
const MAP_ICONS = {
    caucasus: '🏔️',
    syria: '🏜️',
    sinai: '🐫',
    nevada: '🎰',
    marianas: '🌴',
    normandy: '🏰',
    channel: '🌊',
    kola: '❄️',
    persiangulf: '🛢️',
    default: '🖥️'
};

// State
let allServers = [];
let activeServerIndex = 0;

// Get map icon for a server
function getMapIcon(server) {
    const mapId = (server.mapId || server.friendlyName || '').toLowerCase();
    return MAP_ICONS[mapId] || MAP_ICONS.default;
}

// Render server tabs
function renderServerTabs() {
    const tabsEl = document.getElementById('serverTabs');
    if (!tabsEl || allServers.length <= 1) {
        if (tabsEl) tabsEl.style.display = 'none';
        return;
    }

    tabsEl.style.display = 'flex';
    tabsEl.innerHTML = allServers.map((srv, idx) => {
        const icon = getMapIcon(srv);
        const name = escapeHTML(srv.friendlyName || `Server ${idx + 1}`);
        const isActive = idx === activeServerIndex;
        const statusClass = srv.online ? 'online' : 'offline';
        const players = srv.online ? `${srv.players || 0}/${srv.maxPlayers || 32}` : '';

        return `
            <button class="server-tab ${isActive ? 'active' : ''}" data-server-index="${idx}">
                <span class="server-tab-dot ${statusClass}"></span>
                <span class="server-tab-icon">${icon}</span>
                <span class="server-tab-label">${name}</span>
                ${players ? `<span class="server-tab-players">${players}</span>` : ''}
            </button>
        `;
    }).join('');

    // Event delegation for tab clicks
    tabsEl.querySelectorAll('.server-tab').forEach(btn => {
        btn.addEventListener('click', function() {
            switchServerTab(parseInt(this.dataset.serverIndex));
        });
    });
}

// Switch active server tab
function switchServerTab(index) {
    activeServerIndex = index;
    renderServerTabs();
    const server = allServers[index];
    if (server) {
        updateServerUI(server);
    }
}

// Update the UI with server data
function updateServerUI(data) {
    const indicator = document.getElementById('serverIndicator');
    const statusText = document.getElementById('serverStatusText');
    const nameEl = document.getElementById('serverName');
    const missionEl = document.getElementById('serverMission');
    const mapEl = document.getElementById('serverMap');
    const playersEl = document.getElementById('serverPlayers');
    const timeEl = document.getElementById('serverTime');
    const playerListContainer = document.getElementById('playerListContainer');
    const playerList = document.getElementById('playerList');

    if (!indicator) return;
    const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';

    // Update server name in header
    if (nameEl) {
        nameEl.textContent = data.friendlyName
            ? `101st — ${escapeHTML(data.friendlyName)}`
            : '101st Hunter Squadron';
    }

    if (data.online) {
        indicator.className = 'status-indicator online';
        statusText.textContent = lang === 'tr' ? 'Çevrimiçi' : lang === 'de' ? 'Online' : 'Online';

        missionEl.textContent = escapeHTML(data.mission || '--');
        mapEl.textContent = escapeHTML(data.map || data.friendlyName || '--');
        playersEl.textContent = `${data.players || 0}/${data.maxPlayers || 32}`;
        timeEl.textContent = escapeHTML(data.missionTime || '--:--');

        // Server IP
        const ipEl = document.getElementById('serverIP');
        if (ipEl && data.serverIP) {
            ipEl.style.display = 'inline';
            ipEl.textContent = escapeHTML(data.serverIP);
            ipEl.title = lang === 'tr' ? 'IP kopyala' : lang === 'de' ? 'IP kopieren' : 'Copy IP';
            ipEl.onclick = () => { navigator.clipboard?.writeText(data.serverIP); };
        }

        // Mission date
        const dateEl = document.getElementById('serverDate');
        if (dateEl && data.missionDate) {
            dateEl.textContent = data.missionDate;
            dateEl.parentElement.style.display = '';
        }

        // Active players by side
        if (data.activePlayers && playerListContainer) {
            const blue = data.activePlayers.blue || [];
            const red = data.activePlayers.red || [];
            const neutral = data.activePlayers.neutral || [];
            const all = [...blue, ...red, ...neutral];

            if (all.length > 0) {
                playerListContainer.style.display = 'block';
                let html = '';

                if (blue.length > 0) {
                    html += `<div class="side-header blue">🔵 BLUE — ${blue.length}</div>`;
                    html += blue.map(p =>
                        `<span class="player-item blue" title="${escapeHTML(p.unit || '')}">${escapeHTML(p.name)} <small style="opacity:0.6">(${escapeHTML(p.unit || '?')})</small></span>`
                    ).join('');
                }
                if (red.length > 0) {
                    html += `<div class="side-header red">🔴 RED — ${red.length}</div>`;
                    html += red.map(p =>
                        `<span class="player-item red" title="${escapeHTML(p.unit || '')}">${escapeHTML(p.name)} <small style="opacity:0.6">(${escapeHTML(p.unit || '?')})</small></span>`
                    ).join('');
                }
                if (neutral.length > 0) {
                    html += `<div class="side-header neutral">⚪ NEUTRAL — ${neutral.length}</div>`;
                    html += neutral.map(p =>
                        `<span class="player-item" title="${escapeHTML(p.unit || '')}">${escapeHTML(p.name)} <small style="opacity:0.6">(${escapeHTML(p.unit || '?')})</small></span>`
                    ).join('');
                }

                playerList.innerHTML = html;
            } else {
                playerListContainer.style.display = 'none';
            }
        } else if (data.playerList && data.playerList.length > 0) {
            playerListContainer.style.display = 'block';
            playerList.innerHTML = data.playerList
                .map(name => `<span class="player-item">${escapeHTML(name)}</span>`)
                .join('');
        } else {
            playerListContainer.style.display = 'none';
        }

        // Weather section
        const weatherEl = document.getElementById('serverWeather');
        if (weatherEl && data.weather) {
            weatherEl.style.display = 'block';
            weatherEl.innerHTML = `
                <div class="weather-info">
                    <span>🌡️ ${escapeHTML(data.weather.temperature || '--')}</span>
                    ${data.weather.clouds ? `<span>☁️ ${escapeHTML(data.weather.clouds)}</span>` : ''}
                    ${data.weather.visibility ? `<span>👁️ ${escapeHTML(data.weather.visibility)}</span>` : ''}
                    ${data.weather.wind ? `<span>💨 ${escapeHTML(data.weather.wind)}</span>` : ''}
                    ${data.weather.qnh ? `<span>📊 QNH ${escapeHTML(data.weather.qnh)}</span>` : ''}
                </div>
            `;
        } else if (weatherEl) {
            weatherEl.style.display = 'none';
        }

        // Slot usage
        const slotsEl = document.getElementById('serverSlots');
        if (slotsEl && data.slots) {
            slotsEl.style.display = 'block';
            const blueUsed = data.slots.blue?.used || 0;
            const blueTotal = data.slots.blue?.total || 0;
            const redUsed = data.slots.red?.used || 0;
            const redTotal = data.slots.red?.total || 0;
            const bluePct = blueTotal ? (blueUsed / blueTotal) * 100 : 0;
            const redPct = redTotal ? (redUsed / redTotal) * 100 : 0;

            slotsEl.innerHTML = `
                <h4 class="status-section-title">🎯 ${lang === 'tr' ? 'SLOT KULLANIMI' : lang === 'de' ? 'SLOT-NUTZUNG' : 'SLOT USAGE'}</h4>
                <div class="slot-row">
                    <span class="slot-label blue">🔵 BLUE</span>
                    <div class="slot-track"><div class="slot-fill blue" style="width:${bluePct}%"></div></div>
                    <span class="slot-count">${blueUsed}/${blueTotal}</span>
                </div>
                <div class="slot-row">
                    <span class="slot-label red">🔴 RED</span>
                    <div class="slot-track"><div class="slot-fill red" style="width:${redPct}%"></div></div>
                    <span class="slot-count">${redUsed}/${redTotal}</span>
                </div>
            `;
        } else if (slotsEl) {
            slotsEl.style.display = 'none';
        }

        // Mission Statistics
        const statsEl = document.getElementById('serverMissionStats');
        if (statsEl && data.missionStats) {
            statsEl.style.display = 'block';
            let html = `<h4 class="status-section-title">📊 ${lang === 'tr' ? 'GÖREV İSTATİSTİKLERİ' : lang === 'de' ? 'MISSIONSSTATISTIKEN' : 'MISSION STATISTICS'}</h4>`;

            if (data.missionStats.situation && Object.keys(data.missionStats.situation).length > 0) {
                html += `<table class="stats-table-web"><thead><tr><th></th><th class="blue">🔵 BLUE</th><th class="red">🔴 RED</th></tr></thead><tbody>`;
                for (const [key, val] of Object.entries(data.missionStats.situation)) {
                    html += `<tr><td>${escapeHTML(key)}</td><td class="blue">${escapeHTML(String(val.blue ?? '--'))}</td><td class="red">${escapeHTML(String(val.red ?? '--'))}</td></tr>`;
                }
                html += `</tbody></table>`;
            }

            if (data.missionStats.achievements && Object.keys(data.missionStats.achievements).length > 0) {
                html += `<h4 class="status-section-title" style="margin-top:1rem">🏆 ${lang === 'tr' ? 'BAŞARILAR' : lang === 'de' ? 'ERFOLGE' : 'ACHIEVEMENTS'}</h4>`;
                html += `<table class="stats-table-web"><thead><tr><th></th><th class="blue">🔵</th><th class="red">🔴</th></tr></thead><tbody>`;
                for (const [key, val] of Object.entries(data.missionStats.achievements)) {
                    html += `<tr><td>${escapeHTML(key)}</td><td class="blue">${escapeHTML(String(val.blue ?? '--'))}</td><td class="red">${escapeHTML(String(val.red ?? '--'))}</td></tr>`;
                }
                html += `</tbody></table>`;
            }

            statsEl.innerHTML = html;
        } else if (statsEl) {
            statsEl.style.display = 'none';
        }
    } else {
        indicator.className = 'status-indicator offline';
        statusText.textContent = lang === 'tr' ? 'Çevrimdışı' : lang === 'de' ? 'Offline' : 'Offline';
        if (nameEl) {
            nameEl.textContent = data.friendlyName
                ? `101st — ${data.friendlyName}`
                : '101st Hunter Squadron';
        }
        missionEl.textContent = lang === 'tr' ? 'Sunucu şu anda kapalı' : lang === 'de' ? 'Server ist derzeit offline' : 'Server is currently offline';
        mapEl.textContent = '--';
        playersEl.textContent = '0';
        timeEl.textContent = '--:--';
        if (playerListContainer) playerListContainer.style.display = 'none';

        ['serverWeather', 'serverSlots', 'serverMissionStats'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }
}

// Fetch server status from API
async function fetchServerStatus() {
    if (SERVER_CONFIG.demoMode) {
        allServers = DEMO_SERVERS;
        if (activeServerIndex >= allServers.length) activeServerIndex = 0;
        renderServerTabs();
        updateServerUI(allServers[activeServerIndex]);
        return;
    }

    // Try Discord Bot API first (only available locally)
    if (SERVER_CONFIG.primaryApiUrl) {
        try {
            const response = await fetch(SERVER_CONFIG.primaryApiUrl, {
                method: 'GET',
                cache: 'no-cache'
            });

            if (response.ok) {
                const result = await response.json();
                const servers = result.servers || [];

                if (servers.length > 0) {
                    allServers = servers;
                    window.__activeServers = allServers;
                    if (activeServerIndex >= allServers.length) activeServerIndex = 0;
                    renderServerTabs();
                    updateServerUI(allServers[activeServerIndex]);
                    if (typeof window.renderTheaterMap === 'function') window.renderTheaterMap();
                    return;
                }
            }
        } catch (err) {
            console.log('Discord bot API unavailable, using demo data...');
        }
    }

    // Fallback to Cloudflare Tunnel (if configured)
    if (SERVER_CONFIG.fallbackApiUrl) {
        try {
            const response = await fetch(SERVER_CONFIG.fallbackApiUrl, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) throw new Error('Server not responding');

            const data = await response.json();
            const fallbackServer = {
                online: data.online !== false,
                serverName: data.serverName || data.name || '101st Hunter Squadron',
                mission: data.mission || data.mission_name || '--',
                map: data.map || data.theatre || '--',
                players: data.players || data.player_count || 0,
                maxPlayers: data.maxPlayers || data.max_players || 32,
                missionTime: data.missionTime || data.mission_time || data.time || '--:--',
                playerList: data.playerList || data.player_list || data.players_list || []
            };
            allServers = [fallbackServer];
            window.__activeServers = allServers;
            renderServerTabs();
            updateServerUI(fallbackServer);
            if (typeof window.renderTheaterMap === 'function') window.renderTheaterMap();
            return;
        } catch (error) {
            console.log('Fallback API failed, using demo data...');
        }
    }

    // Both APIs failed — use demo data
    console.log('Using demo server data');
    allServers = DEMO_SERVERS;
    window.__activeServers = allServers;
    if (activeServerIndex >= allServers.length) activeServerIndex = 0;
    renderServerTabs();
    updateServerUI(allServers[activeServerIndex]);
    if (typeof window.renderTheaterMap === 'function') window.renderTheaterMap();
}

// Initialize server status
function initServerStatus() {
    fetchServerStatus();
    setInterval(fetchServerStatus, SERVER_CONFIG.refreshInterval);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServerStatus);
} else {
    initServerStatus();
}
