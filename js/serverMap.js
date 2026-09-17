/* =====================================================
   SERVER MAP - Interactive theater map with active servers
   ===================================================== */
(function () {
    'use strict';

    // Theater data with approximate positions on a stylized map
    var theaters = {
        'caucasus': { name: 'Caucasus', x: 58, y: 32, color: '#22c55e', flag: '🇬🇪' },
        'syria': { name: 'Syria', x: 54, y: 45, color: '#f59e0b', flag: '🇸🇾' },
        'sinai': { name: 'Sinai', x: 52, y: 50, color: '#ef4444', flag: '🇪🇬' },
        'kola': { name: 'Kola', x: 56, y: 12, color: '#3b82f6', flag: '🇳🇴' },
        'marianas': { name: 'Marianas', x: 88, y: 42, color: '#a855f7', flag: '🌴' },
        'persian gulf': { name: 'Persian Gulf', x: 62, y: 48, color: '#06b6d4', flag: '🇦🇪' },
        'nevada': { name: 'Nevada', x: 14, y: 30, color: '#ec4899', flag: '🇺🇸' },
        'south atlantic': { name: 'South Atlantic', x: 35, y: 78, color: '#14b8a6', flag: '🇬🇧' },
        'dynamic': { name: 'Dynamic', x: 58, y: 32, color: '#22c55e', flag: '⚔️' }
    };

    function getTheaterKey(server) {
        if (!server) return 'caucasus';
        var text = ((server.missionName || '') + ' ' + (server.friendlyName || '') + ' ' + (server.mapName || '')).toLowerCase();

        for (var key in theaters) {
            if (key !== 'dynamic' && text.indexOf(key) !== -1) return key;
        }
        return 'caucasus';
    }

    function renderMap() {
        var mapContainer = document.getElementById('theaterMap');
        if (!mapContainer) return;

        // Try to get server data from window
        var servers = window.__activeServers || [];

        var dotsHTML = '';
        var seen = {};

        servers.forEach(function (srv) {
            if (!srv.online) return;
            var key = getTheaterKey(srv);
            var t = theaters[key];
            if (!t || seen[key]) return;
            seen[key] = true;

            var players = srv.players || 0;
            var maxPlayers = srv.maxPlayers || 32;
            var friendlyName = srv.friendlyName || t.name;

            dotsHTML +=
                '<div class="theater-dot" style="left:' + t.x + '%;top:' + t.y + '%;">' +
                    '<span class="theater-ping" style="background:' + t.color + ';"></span>' +
                    '<span class="theater-core" style="background:' + t.color + ';"></span>' +
                    '<div class="theater-label">' +
                        '<span class="theater-name">' + t.flag + ' ' + t.name + '</span>' +
                        '<span class="theater-players">' + players + '/' + maxPlayers + ' pilots</span>' +
                    '</div>' +
                '</div>';
        });

        if (!dotsHTML) {
            // No server data yet, show placeholder
            dotsHTML = '<div class="theater-loading">Loading server data...</div>';
        }

        var mapInner = mapContainer.querySelector('.map-world');
        if (mapInner) {
            // Keep the grid overlay, add dots after it
            var gridOverlay = mapInner.querySelector('.map-grid-overlay');
            mapInner.innerHTML = '';
            if (gridOverlay) mapInner.appendChild(gridOverlay);
            mapInner.insertAdjacentHTML('beforeend', dotsHTML);
        }
    }

    // Expose globally for other scripts to call
    window.renderTheaterMap = renderMap;

    // Auto-render after delay (wait for server data)
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(renderMap, 4000);
        // Re-render every 30s
        setInterval(renderMap, 30000);
    });
})();
