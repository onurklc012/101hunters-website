-- =====================================================
-- DCS LIVE MAP EXPORT SCRIPT
-- 101st Hunter Squadron - Real-time Position Export
-- =====================================================
-- KURULUM:
-- Bu dosyayı şu yola kopyala:
-- C:\Users\<KULLANICI>\Saved Games\DCS.openbeta_server\Scripts\Export\dcs-live-export.lua
-- (veya DCS.openbeta yerine kullandığın profil)
--
-- DCS sunucu yeniden başlatıldığında otomatik çalışır.
-- =====================================================

-- Ayarlar
local EXPORT_INTERVAL = 5  -- Saniyede bir export (5 saniye)
local OUTPUT_FILE = lfs.writedir() .. "livemap-data.json"

-- Yardımcı fonksiyonlar
local function getModelName(obj)
    local desc = obj:getDesc()
    if desc then
        return desc.displayName or desc.typeName or "Unknown"
    end
    return "Unknown"
end

local function getGroupSide(obj)
    local coalition = obj:getCoalition()
    if coalition == 1 then return "red"
    elseif coalition == 2 then return "blue"
    else return "neutral"
    end
end

local function tableToJSON(t)
    local items = {}
    for _, v in ipairs(t) do
        local fields = {}
        for key, val in pairs(v) do
            if type(val) == "string" then
                table.insert(fields, '"' .. key .. '":"' .. val:gsub('"', '\\"') .. '"')
            elseif type(val) == "number" then
                table.insert(fields, '"' .. key .. '":' .. string.format("%.6f", val))
            elseif type(val) == "boolean" then
                table.insert(fields, '"' .. key .. '":' .. tostring(val))
            end
        end
        table.insert(items, "{" .. table.concat(fields, ",") .. "}")
    end
    return "[" .. table.concat(items, ",") .. "]"
end

-- Ana export fonksiyonu
local nextExportTime = 0

function LuaExportActivityNextEvent(t)
    if t < nextExportTime then
        return t + 0.5
    end
    nextExportTime = t + EXPORT_INTERVAL

    local players = {}
    local selfData = LoGetSelfData()

    -- Tüm nesneleri al
    local worldObjects = LoGetWorldObjects("units")
    if worldObjects then
        for _, obj in pairs(worldObjects) do
            if obj.Name and obj.LatLongAlt then
                local entry = {
                    name = obj.Name or "Unknown",
                    pilot = obj.UnitName or obj.Name or "Unknown",
                    aircraft = obj.Type and obj.Type.level3 or "Unknown",
                    lat = obj.LatLongAlt.Lat or 0,
                    lon = obj.LatLongAlt.Long or 0,
                    alt = obj.LatLongAlt.Alt or 0,
                    heading = obj.Heading or 0,
                    speed = obj.IAS or 0,
                    coalition = obj.Coalition == "Allies" and "blue" or "red",
                    isHuman = obj.Flags and obj.Flags.Human or false
                }
                table.insert(players, entry)
            end
        end
    end

    -- Theater/Map bilgisi
    local theater = "caucasus"
    local missionName = DCS.getMissionName() or ""
    local missionNameLower = missionName:lower()
    if missionNameLower:find("syria") then theater = "syria"
    elseif missionNameLower:find("sinai") then theater = "sinai"
    elseif missionNameLower:find("kola") then theater = "kola"
    elseif missionNameLower:find("nevada") then theater = "nevada"
    elseif missionNameLower:find("marianas") then theater = "marianas"
    elseif missionNameLower:find("persian") or missionNameLower:find("gulf") then theater = "persiangulf"
    elseif missionNameLower:find("south") or missionNameLower:find("atlantic") then theater = "southatlantic"
    end

    -- Model zamanı
    local modelTime = LoGetModelTime() or 0

    -- JSON oluştur
    local json = '{"theater":"' .. theater .. '","missionName":"' .. missionName:gsub('"', '\\"') .. '","modelTime":' .. string.format("%.0f", modelTime) .. ',"timestamp":' .. os.time() .. ',"units":' .. tableToJSON(players) .. '}'

    -- Dosyaya yaz
    local file = io.open(OUTPUT_FILE, "w")
    if file then
        file:write(json)
        file:close()
    end

    return t + EXPORT_INTERVAL
end

function LuaExportStart()
    log.write("LIVEMAP", log.INFO, "101st Live Map Export started")
end

function LuaExportStop()
    log.write("LIVEMAP", log.INFO, "101st Live Map Export stopped")
    -- Temizlik: dosyayı sil
    os.remove(OUTPUT_FILE)
end
