/* =====================================================
   DCS LIVE MAP - Leaflet.js Frontend
   101st Hunter Squadron - DCS F10 Style Map
   ===================================================== */
(function () {
    'use strict';

    var POLL_INTERVAL = 3000;
    var ANIMATION_FPS = 30;
    var DATA_URL = 'https://livemap-worker.101st-hunters.workers.dev/api/positions';
    var FALLBACK_URL = 'https://onurklc012.github.io/101st-server-data/data/livemap-data.json';
    var map = null;
    var unitStates = {};
    var leafletMarkers = {};
    var mapInitialized = false;
    var lastData = null;
    var activeFilter = null; // first server auto-selected
    var animFrameId = null;
    var lastAnimTime = 0;
    var selectedUid = null;  // FR24: clicked aircraft

    function toggleFullscreen() {
        var wrapper = document.querySelector('.live-map-wrapper');
        var tabs = document.getElementById('livemapTabs');
        if (!wrapper) return;
        var isFS = wrapper.classList.toggle('livemap-fullscreen');
        if (tabs) tabs.classList.toggle('livemap-fullscreen', isFS);
        document.body.style.overflow = isFS ? 'hidden' : '';
        if (map) setTimeout(function () { map.invalidateSize(); }, 300);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var wrapper = document.querySelector('.live-map-wrapper.livemap-fullscreen');
            if (wrapper) toggleFullscreen();
        }
    });

    var THEATERS = {
        'caucasus': { center: [42.0, 43.5], zoom: 7, name: 'Caucasus', icon: '🏔️' },
        'Caucasus': { center: [42.0, 43.5], zoom: 7, name: 'Caucasus', icon: '🏔️' },
        'syria': { center: [34.5, 36.5], zoom: 7, name: 'Syria', icon: '🏜️' },
        'Syria': { center: [34.5, 36.5], zoom: 7, name: 'Syria', icon: '🏜️' },
        'sinai': { center: [29.5, 33.5], zoom: 7, name: 'Sinai', icon: '🐫' },
        'Sinai': { center: [29.5, 33.5], zoom: 7, name: 'Sinai', icon: '🐫' },
        'kola': { center: [69.0, 33.0], zoom: 6, name: 'Kola', icon: '❄️' },
        'nevada': { center: [36.5, -116.0], zoom: 7, name: 'Nevada', icon: '🎰' },
        'marianas': { center: [14.0, 145.0], zoom: 7, name: 'Marianas', icon: '🌴' },
        'persiangulf': { center: [26.0, 55.0], zoom: 7, name: 'Persian Gulf', icon: '🛢️' },
        'southatlantic': { center: [-51.5, -59.0], zoom: 7, name: 'South Atlantic', icon: '🌊' }
    };

    // Smart coalition detection - from data, name, or aircraft type
    function guessCoalition(unit) {
        var c = (unit.coalition || '').toLowerCase();
        if (c === 'blue' || c === 'red') return c;

        var name = (unit.name || '').toUpperCase();
        var aircraft = (unit.aircraft || '').toUpperCase();

        // Name-based detection
        if (/^RED|_RED|RED_|ENEMY|OPFOR|AGGRESSOR/.test(name)) return 'red';
        if (/^BLUE|_BLUE|BLUE_|FRIENDLY|ALLIED/.test(name)) return 'blue';

        // Aircraft-based detection (Russian = red, NATO = blue)
        var redAircraft = /SU-27|SU-33|SU-25|SU-30|MIG-29|MIG-21|MIG-31|KA-50|KA-52|MI-24|MI-28|MI-8|TU-95|TU-22|TU-160|IL-78|KJ-2000|A-50|AN-26|IL-76/;
        var blueAircraft = /F-16|F-15|F-14|FA-18|F\/A-18|F-4|A-10|AH-64|UH-60|UH-1|CH-47|E-3|E-2|KC-135|KC135|B-52|B-1|C-130|C-17|AV-8|JF-17|MIRAGE|M-2000|RAFALE/;

        if (redAircraft.test(aircraft)) return 'red';
        if (blueAircraft.test(aircraft)) return 'blue';

        return 'neutral';
    }

    // WHITELIST approach — only known aircraft/helo/ship pass, everything else = ground
    function getVehicleType(aircraft) {
        if (!aircraft) return 'unknown';
        var a = aircraft.toUpperCase();
        // Helicopters
        if (/AH-64|KA-50|KA-52|MI-8|MI-24|MI-28|UH-1|UH-60|CH-47|SA342|OH-58|AH-1|HIND|HUEY|APACHE|GAZELLE|HAVOC|HOKUM|SH-60|NH90|LYNX/.test(a)) return 'helo';
        // AWACS
        if (/E-3|E-2|KJ-2000|A-50|AWACS|MAINSTAY|SENTRY/.test(a)) return 'awacs';
        // Tankers
        if (/KC-135|KC135|IL-78|KC130|S-3B|TANKER|STRATOTANKER/.test(a)) return 'tanker';
        // Bombers
        if (/B-52|B-1B|TU-95|TU-22|TU-160|BEAR|BACKFIRE|BLACKJACK/.test(a)) return 'bomber';
        // Attack aircraft
        if (/A-10|SU-25|AV-8|FROGFOOT|WARTHOG/.test(a)) return 'attack';
        // Transport
        if (/C-130|C-17|AN-26|IL-76|HERCULES|CONDOR|AN-30|YAK-40/.test(a)) return 'transport';
        // Fighters & jets (WHITELIST)
        if (/F-16|F-15|F-14|FA-18|F\/A-18|F-4|F-5|F-86|MIG-29|MIG-21|MIG-31|MIG-23|MIG-25|MIG-19|SU-27|SU-33|SU-30|SU-34|SU-24|SU-17|MIRAGE|M-2000|RAFALE|JF-17|J-11|EUROFIGHTER|TYPHOON|TORNADO|VIGGEN|GRIPEN|JAS|C-101|L-39|YAK-52|T-45|MB-339|HAWK|P-51|P-47|FW-190|BF-109|SPITFIRE|MOSQUITO|I-16|WW2/.test(a)) return 'fighter';
        // Ships
        if (/CVN|STENNIS|FORRESTAL|KUZNETSOV|CARRIER/.test(a)) return 'carrier';
        if (/DDG|FFG|CG|PERRY|TICONDEROGA|ARLEIGH|MOSKVA|MOLNIYA|FRIGATE|CRUISER|DESTROYER|CORVETTE|KIROV|SLAVA|NEUSTRASH|REZKY|GRISHA|ALBATROS|LA.COMBATTANTE|TYPE\s?\d/.test(a)) return 'ship';
        // Everything else = GROUND (filtered out)
        return 'unknown';
    }

    // FlightRadar24 exact colors
    function createDCSSymbol(type, coalition) {
        var isRed = coalition === 'red';
        // FR24: bright yellow #FFDE00 with dark outline
        var fill = isRed ? '#e53935' : '#FFDE00';
        var dark = isRed ? '#5a0000' : '#333';

        switch (type) {
            case 'fighter':
            case 'attack':
            case 'trainer':
                // Realistic jet silhouette (FlightRadar style)
                return '<svg viewBox="0 0 32 32" width="24" height="24">' +
                    '<path d="M16 2 L14 10 L4 14 L4 16 L14 15 L14 22 L10 25 L10 27 L16 25 L22 27 L22 25 L18 22 L18 15 L28 16 L28 14 L18 10 Z" ' +
                    'fill="' + fill + '" stroke="' + dark + '" stroke-width="0.8"/></svg>';

            case 'bomber':
                return '<svg viewBox="0 0 36 36" width="28" height="28">' +
                    '<path d="M18 2 L16 12 L3 16 L3 18 L16 17 L16 26 L11 29 L11 31 L18 28 L25 31 L25 29 L20 26 L20 17 L33 18 L33 16 L20 12 Z" ' +
                    'fill="' + fill + '" stroke="' + dark + '" stroke-width="0.8"/></svg>';

            case 'helo':
                // Helicopter silhouette
                return '<svg viewBox="0 0 28 28" width="22" height="22">' +
                    '<ellipse cx="14" cy="14" rx="5" ry="5" fill="' + fill + '" stroke="' + dark + '" stroke-width="1"/>' +
                    '<line x1="14" y1="9" x2="14" y2="3" stroke="' + dark + '" stroke-width="1.5"/>' +
                    '<line x1="8" y1="3" x2="20" y2="3" stroke="' + dark + '" stroke-width="1.5"/>' +
                    '<line x1="14" y1="19" x2="14" y2="26" stroke="' + dark + '" stroke-width="1"/>' +
                    '<line x1="10" y1="26" x2="18" y2="26" stroke="' + dark + '" stroke-width="1"/></svg>';

            case 'awacs':
                return '<svg viewBox="0 0 36 36" width="28" height="28">' +
                    '<path d="M18 3 L16 12 L4 16 L4 18 L16 17 L16 26 L12 29 L12 31 L18 28 L24 31 L24 29 L20 26 L20 17 L32 18 L32 16 L20 12 Z" ' +
                    'fill="' + fill + '" stroke="' + dark + '" stroke-width="0.8"/>' +
                    '<circle cx="18" cy="12" r="4" fill="none" stroke="' + dark + '" stroke-width="1.5"/></svg>';

            case 'tanker':
            case 'transport':
                return '<svg viewBox="0 0 32 32" width="22" height="22">' +
                    '<path d="M16 3 L14 11 L5 15 L5 17 L14 16 L14 24 L10 27 L10 29 L16 26 L22 29 L22 27 L18 24 L18 16 L27 17 L27 15 L18 11 Z" ' +
                    'fill="' + fill + '" stroke="' + dark + '" stroke-width="0.6" opacity="0.8"/></svg>';

            case 'carrier':
                return '<svg viewBox="0 0 28 28" width="22" height="22">' +
                    '<path d="M14 3 L20 12 L20 22 L14 25 L8 22 L8 12 Z" fill="' + fill + '" stroke="' + dark + '" stroke-width="1.5"/>' +
                    '<line x1="8" y1="14" x2="20" y2="14" stroke="' + dark + '" stroke-width="1.5"/></svg>';

            case 'ship':
                return '<svg viewBox="0 0 22 22" width="16" height="16">' +
                    '<polygon points="11,3 18,11 11,19 4,11" fill="' + fill + '" stroke="' + dark + '" stroke-width="1.5"/></svg>';

            default:
                return '<svg viewBox="0 0 32 32" width="22" height="22">' +
                    '<path d="M16 3 L14 11 L5 15 L5 17 L14 16 L14 24 L10 27 L10 29 L16 26 L22 29 L22 27 L18 24 L18 16 L27 17 L27 15 L18 11 Z" ' +
                    'fill="' + fill + '" stroke="' + dark + '" stroke-width="0.6"/></svg>';
        }
    }

    // Trail/route history per unit
    var trailHistory = {};
    var trailPolylines = {};
    var TRAIL_MAX_POINTS = 80;

    function updateTrail(uid, lat, lon, coalition) {
        if (!trailHistory[uid]) trailHistory[uid] = [];
        var trail = trailHistory[uid];
        var last = trail.length > 0 ? trail[trail.length - 1] : null;
        // Very sensitive threshold to capture even taxi movement
        if (!last || Math.abs(last[0] - lat) > 0.0001 || Math.abs(last[1] - lon) > 0.0001) {
            trail.push([lat, lon]);
            if (trail.length > TRAIL_MAX_POINTS) trail.shift();
        }

        // FR24 exact trail color — cyan
        var color = '#00BCD4';
        if (trailPolylines[uid]) {
            trailPolylines[uid].setLatLngs(trail);
        } else if (trail.length >= 2) {
            trailPolylines[uid] = L.polyline(trail, {
                color: color, weight: 2.5, opacity: 0.7,
                smoothFactor: 1
            }).addTo(map);
        }
    }

    function clearTrail(uid) {
        if (trailPolylines[uid]) { map.removeLayer(trailPolylines[uid]); delete trailPolylines[uid]; }
        delete trailHistory[uid];
    }

    function deadReckon(lat, lon, headingDeg, speedMs, dtSeconds) {
        if (!speedMs || speedMs < 0.5) return { lat: lat, lon: lon };
        var R = 6371000;
        var hr = headingDeg * Math.PI / 180;
        var d = speedMs * dtSeconds;
        var lr = lat * Math.PI / 180;
        return {
            lat: (lr + (d * Math.cos(hr)) / R) * 180 / Math.PI,
            lon: ((lon * Math.PI / 180) + (d * Math.sin(hr)) / (R * Math.cos(lr))) * 180 / Math.PI
        };
    }

    // FR24-style: select unit → show side panel + trail
    function selectUnit(uid) {
        // Deselect if same unit clicked again
        if (selectedUid === uid) { deselectUnit(); return; }
        deselectUnit(); // clear previous
        selectedUid = uid;
        refreshPanel(uid);
    }

    function refreshPanel(uid) {
        var state = unitStates[uid];
        if (!state) return;
        var u = state.unit;
        var vType = getVehicleType(u.aircraft);
        var coalition = guessCoalition(u);
        var altFt = Math.round((u.alt || 0) * 3.281);
        var speedMs = state.speed || state.estSpeed || 0;
        var speedKts = Math.round(speedMs * 1.944);
        var speedText = (altFt < 100 && speedKts < 5) ? 'GND' : speedKts + ' kts';

        // Create/update side panel
        var panel = document.getElementById('fr24Panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'fr24Panel';
            panel.className = 'fr24-panel';
            var mapEl = document.querySelector('.live-map-wrapper');
            if (mapEl) mapEl.appendChild(panel);
        }
        panel.innerHTML =
            '<div class="fr24-panel-header">' +
            '<span class="fr24-callsign">' + (u.name || 'Unknown') + '</span>' +
            '<span class="fr24-type-badge">' + (u.aircraft || '?') + '</span>' +
            '<button class="fr24-close" onclick="document.getElementById(\'fr24Panel\').style.display=\'none\'">&times;</button>' +
            '</div>' +
            '<div class="fr24-panel-body">' +
            '<div class="fr24-row"><span class="fr24-label">TYPE</span><span class="fr24-val">' + vType.toUpperCase() + '</span></div>' +
            '<div class="fr24-row"><span class="fr24-label">COALITION</span><span class="fr24-val" style="color:' + (coalition === 'red' ? '#e53935' : coalition === 'blue' ? '#1e88e5' : '#999') + '">' + coalition.toUpperCase() + '</span></div>' +
            '<div class="fr24-row"><span class="fr24-label">ALTITUDE</span><span class="fr24-val">' + altFt.toLocaleString() + ' ft</span></div>' +
            '<div class="fr24-row"><span class="fr24-label">HEADING</span><span class="fr24-val">' + Math.round(u.heading || 0) + '°</span></div>' +
            '<div class="fr24-row"><span class="fr24-label">SPEED</span><span class="fr24-val">' + speedText + '</span></div>' +
            '<div class="fr24-row"><span class="fr24-label">POSITION</span><span class="fr24-val">' + state.currentLat.toFixed(4) + ', ' + state.currentLon.toFixed(4) + '</span></div>' +
            '</div>';
        panel.style.display = 'block';
    }

    function deselectUnit() {
        if (selectedUid) { clearTrail(selectedUid); }
        selectedUid = null;
        var panel = document.getElementById('fr24Panel');
        if (panel) panel.style.display = 'none';
    }

    function createMarkerIcon(unit, headingDeg) {
        var vType = getVehicleType(unit.aircraft);
        var coalition = guessCoalition(unit);
        var svg = createDCSSymbol(vType, coalition);
        var color = coalition === 'red' ? '#c62828' : '#333';  // FR24 dark labels
        var isPlayer = unit.isPlayer || unit.isHuman;

        var noRotate = (vType === 'ship' || vType === 'carrier' || vType === 'ground' || vType === 'sam');
        var rot = noRotate ? 0 : (headingDeg || 0);
        var sz = (vType === 'bomber' || vType === 'awacs' || vType === 'carrier') ? 44 : 36;

        return L.divIcon({
            className: 'dcs-marker',
            html: '<div class="dcs-sym" style="transform:rotate(' + rot + 'deg)">' + svg +
                  (isPlayer ? '<i class="pdot"></i>' : '') + '</div>' +
                  '<div class="fr24-lbl">' + (unit.name || '') + '</div>',
            iconSize: [sz, sz + 12],
            iconAnchor: [sz / 2, sz / 2 + 6]
        });
    }

    function initMap(theater) {
        var c = document.getElementById('liveMapCanvas');
        if (!c || mapInitialized) return;
        var t = THEATERS[theater] || THEATERS['caucasus'];

        map = L.map('liveMapCanvas', {
            center: t.center, zoom: t.zoom, zoomControl: false, attributionControl: false
        });

        // Zoom controls top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // FR24-style terrain map
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19, minZoom: 4,
            attribution: ''
        }).addTo(map);

        L.control.attribution({ prefix: false }).addAttribution('101st HunterSQN').addTo(map);

        // Fullscreen button - top right (FR24 style)
        var fsBtn = L.DomUtil.create('div', 'leaflet-bar leaflet-control livemap-fs-btn');
        fsBtn.innerHTML = '<a href="#" title="Tam Ekran">⛶</a>';
        fsBtn.onclick = function (e) {
            e.preventDefault(); e.stopPropagation();
            toggleFullscreen();
        };
        map.getContainer().appendChild(fsBtn);

        mapInitialized = true;
    }

    function buildTabs(servers) {
        var c = document.getElementById('livemapTabs');
        if (!c) return;
        var keys = Object.keys(servers);
        if (!activeFilter && keys.length > 0) activeFilter = keys[0]; // auto-select first

        var html = '';
        keys.forEach(function (key) {
            var s = servers[key];
            var th = s.theatre || s.theater || key;
            var info = THEATERS[th] || THEATERS[key] || { icon: '🖥️', name: key };
            var n = s.units ? s.units.length : 0;
            var pc = s.playerCount || 0;
            html += '<button class="livemap-tab' + (activeFilter === key ? ' active' : '') + '" data-server="' + key + '">' +
                    info.icon + ' ' + info.name +
                    '<span class="tab-count">' + n + '</span>' +
                    (pc > 0 ? '<span class="tab-players">' + pc + '👨‍✈️</span>' : '') +
                    '</button>';
        });

        c.innerHTML = html;
        c.querySelectorAll('.livemap-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                activeFilter = this.getAttribute('data-server');
                c.querySelectorAll('.livemap-tab').forEach(function (t) { t.classList.remove('active'); });
                this.classList.add('active');
                if (lastData) renderUnits(lastData, true);
            });
        });
    }

    function parseServerData(data) {
        var serverMap = {}, allUnits = [], totalPlayers = 0;
        if (data.servers) {
            for (var key in data.servers) {
                var s = data.servers[key];
                if (!s) continue;
                serverMap[key] = s;
                totalPlayers += s.playerCount || 0;
                (s.units || []).forEach(function (u) { u._server = key; u._uid = key + ':' + (u.name || Math.random()); allUnits.push(u); });
            }
        } else if (data.units) {
            data.units.forEach(function (u) { u._uid = 'default:' + (u.name || Math.random()); allUnits.push(u); });
            serverMap['default'] = { units: data.units, theatre: data.theater || 'caucasus' };
        }
        return { servers: serverMap, allUnits: allUnits, totalPlayers: totalPlayers };
    }

    function updateUnitStates(units) {
        var now = Date.now(), seen = {};
        units.forEach(function (u) {
            var uid = u._uid; seen[uid] = true;
            if (unitStates[uid]) {
                var s = unitStates[uid];
                // Estimate speed from position delta
                var elapsed = (now - s.lastUpdate) / 1000;
                if (elapsed > 0.5 && elapsed < 30) {
                    var dlat = u.lat - s.targetLat;
                    var dlon = u.lon - s.targetLon;
                    var dist = Math.sqrt(dlat * dlat + dlon * dlon) * 111000;
                    s.estSpeed = dist / elapsed;
                }
                s.targetLat = u.lat; s.targetLon = u.lon;
                s.heading = u.heading || s.heading; s.speed = u.speed || s.estSpeed || 0;
                s.lastUpdate = now; s.unit = u;
            } else {
                unitStates[uid] = { currentLat: u.lat, currentLon: u.lon, targetLat: u.lat, targetLon: u.lon,
                    heading: u.heading || 0, speed: u.speed || 0, estSpeed: 0, lastUpdate: now, unit: u };
            }
        });
        for (var uid in unitStates) {
            if (!seen[uid]) {
                if (leafletMarkers[uid]) { map.removeLayer(leafletMarkers[uid]); delete leafletMarkers[uid]; }
                clearTrail(uid);
                delete unitStates[uid];
            }
        }
    }

    function renderUnits(parsed, fitView) {
        if (!map) return;
        var units = activeFilter ? parsed.allUnits.filter(function (u) { return u._server === activeFilter; }) : parsed.allUnits;
        // WHITELIST filter: only known aircraft/helo/ship types pass
        units = units.filter(function (u) {
            if (u.isPlayer || u.isHuman) return true;
            var vt = getVehicleType(u.aircraft);
            return vt !== 'unknown';
        });
        updateUnitStates(units);

        for (var uid in leafletMarkers) {
            var st = unitStates[uid];
            if (!st || (activeFilter && st.unit._server !== activeFilter)) {
                map.removeLayer(leafletMarkers[uid]); delete leafletMarkers[uid];
                clearTrail(uid);
            }
        }

        var humanCount = 0, bounds = [];
        units.forEach(function (unit) {
            var uid = unit._uid, state = unitStates[uid];
            if (!state || !state.currentLat || state.currentLat === 0) return;
            bounds.push([state.currentLat, state.currentLon]);
            if (leafletMarkers[uid]) {
                leafletMarkers[uid].setLatLng([state.currentLat, state.currentLon]);
                leafletMarkers[uid].setIcon(createMarkerIcon(unit, state.heading));
            } else {
                var marker = L.marker([state.currentLat, state.currentLon], { icon: createMarkerIcon(unit, state.heading) });
                marker._uid = uid;
                marker.on('click', function () { selectUnit(this._uid); });
                marker.addTo(map); leafletMarkers[uid] = marker;
            }
            if (unit.isPlayer || unit.isHuman) humanCount++;
            // Trail only for selected unit + live panel update
            if (uid === selectedUid) {
                updateTrail(uid, state.currentLat, state.currentLon, guessCoalition(unit));
                // Refresh panel with live data
                refreshPanel(uid);
            }
        });

        if (fitView && bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
        else if (fitView && bounds.length === 1) map.setView(bounds[0], 8);

        var infoEl = document.getElementById('liveMapInfo');
        if (infoEl) {
            var th = activeFilter && parsed.servers[activeFilter] ? (parsed.servers[activeFilter].theatre || activeFilter) : '';
            var label = (THEATERS[th] || { name: th || 'Map' }).name;
            infoEl.innerHTML =
                '<span class="mi-th">' + label + '</span>' +
                '<span class="mi-u">UNITS ' + units.length + '</span>' +
                '<span class="mi-p">PILOTS ' + humanCount + '</span>' +
                '<span class="mi-t">' + new Date().toLocaleTimeString() + '</span>';
        }
    }

    function animate(ts) {
        animFrameId = requestAnimationFrame(animate);
        if (!map || !lastData) return;
        var dt = (ts - lastAnimTime) / 1000;
        if (dt < 1 / ANIMATION_FPS) return;
        lastAnimTime = ts;
        for (var uid in unitStates) {
            var s = unitStates[uid];
            if (!s || !leafletMarkers[uid]) continue;
            if (activeFilter && s.unit._server !== activeFilter) continue;

            var moved = false;
            if (s.speed > 2) {
                // Dead reckoning for fast-moving units
                var p = deadReckon(s.currentLat, s.currentLon, s.heading, s.speed, dt);
                s.currentLat = p.lat; s.currentLon = p.lon;
                moved = true;
            }
            // Smooth interpolation toward target position
            var dl = s.targetLat - s.currentLat, dn = s.targetLon - s.currentLon;
            if (Math.abs(dl) > 0.00001 || Math.abs(dn) > 0.00001) {
                var factor = Math.min(dt * 2, 0.3);  // Aggressive but capped
                s.currentLat += dl * factor; s.currentLon += dn * factor;
                moved = true;
            }
            if (moved) {
                leafletMarkers[uid].setLatLng([s.currentLat, s.currentLon]);
                // Update trail for selected unit during animation
                if (uid === selectedUid) {
                    updateTrail(uid, s.currentLat, s.currentLon, guessCoalition(s.unit));
                }
            }
        }
    }

    function handleData(data) {
        var parsed = parseServerData(data);
        var isFirst = !lastData;
        lastData = parsed;
        if (parsed.allUnits.length > 0) {
            if (!mapInitialized) {
                var fk = Object.keys(parsed.servers)[0];
                initMap(parsed.servers[fk] ? (parsed.servers[fk].theatre || 'caucasus') : 'caucasus');
            }
            buildTabs(parsed.servers);
            renderUnits(parsed, isFirst);
            if (!animFrameId) { lastAnimTime = performance.now(); animFrameId = requestAnimationFrame(animate); }
            var nd = document.getElementById('liveMapNoData');
            if (nd) nd.style.display = 'none';
        }
    }

    function fetchFromFallback() {
        var url = FALLBACK_URL + '?t=' + Date.now();
        fetch(url, { cache: 'no-store' })
            .then(function (r) { if (!r.ok) throw new Error('G'); return r.json(); })
            .then(handleData)
            .catch(function () { if (!mapInitialized) initMap('caucasus'); });
    }

    function fetchData() {
        var url = DATA_URL + '?t=' + Date.now();
        // Race: try Worker first, fallback to GitHub if Worker fails or is offline
        var workerPromise = fetch(url, { cache: 'no-store', mode: 'cors' })
            .then(function (r) { if (!r.ok) throw new Error('W'); return r.json(); })
            .then(function (data) {
                if (data.offline || !data.servers || Object.keys(data.servers).length === 0) {
                    return null;  // Worker returned empty/offline
                }
                return data;
            })
            .catch(function () { return null; });

        workerPromise.then(function (data) {
            if (data) {
                handleData(data);
            } else {
                fetchFromFallback();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var s = document.querySelector('.live-map-section');
        if (!s) return;
        new IntersectionObserver(function (e, o) {
            if (e[0].isIntersecting) { fetchData(); setInterval(fetchData, POLL_INTERVAL); o.disconnect(); }
        }, { threshold: 0.1 }).observe(s);
    });
})();
