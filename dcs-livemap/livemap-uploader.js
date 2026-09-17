// =====================================================
// DCS LIVE MAP UPLOADER
// 101st Hunter Squadron
// =====================================================
// KURULUM:
// 1. Bu dosyayı DCS PC'ye kopyala
// 2. Node.js kurulu olmalı
// 3. Çalıştır: node livemap-uploader.js
// =====================================================

const fs = require('fs');
const https = require('https');
const path = require('path');

// === AYARLAR ===
// DCS Saved Games klasörünü bul
const POSSIBLE_PATHS = [
    path.join(process.env.USERPROFILE || '', 'Saved Games', 'DCS.openbeta_server', 'livemap-data.json'),
    path.join(process.env.USERPROFILE || '', 'Saved Games', 'DCS', 'livemap-data.json'),
    path.join(process.env.USERPROFILE || '', 'Saved Games', 'DCS.openbeta', 'livemap-data.json'),
];

// Cloudflare Worker URL - deploy ettikten sonra güncelle
const WORKER_URL = 'https://livemap.101huntersqn.com/api/positions';
// API Key - Worker'da da aynı key kullanılmalı
const API_KEY = 'hunter101-livemap-' + Date.now().toString(36);

const UPLOAD_INTERVAL = 5000; // 5 saniye

// === FONKSİYONLAR ===
function findDataFile() {
    for (const p of POSSIBLE_PATHS) {
        if (fs.existsSync(p)) {
            console.log(`✅ Veri dosyası bulundu: ${p}`);
            return p;
        }
    }
    return null;
}

function uploadData(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return; // DCS çalışmıyorsa dosya yok
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        if (!data || data.length < 10) return;

        // JSON doğrulama
        try { JSON.parse(data); } catch (e) {
            console.log('⚠️ Geçersiz JSON, atlıyorum...');
            return;
        }

        const url = new URL(WORKER_URL);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const parsed = JSON.parse(data);
                    const unitCount = parsed.units ? parsed.units.length : 0;
                    console.log(`📡 Gönderildi: ${unitCount} birim | ${parsed.theater || 'unknown'} | ${new Date().toLocaleTimeString()}`);
                } else {
                    console.log(`❌ Hata: ${res.statusCode} - ${body}`);
                }
            });
        });

        req.on('error', (err) => {
            console.log(`🔌 Bağlantı hatası: ${err.message}`);
        });

        req.write(data);
        req.end();
    } catch (err) {
        console.log(`❌ Upload hatası: ${err.message}`);
    }
}

// === ANA DÖNGÜ ===
console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║  101st Hunter Squadron - Live Map Uploader   ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');

const dataFile = findDataFile();

if (!dataFile) {
    console.log('❌ livemap-data.json bulunamadı!');
    console.log('Kontrol et:');
    POSSIBLE_PATHS.forEach(p => console.log(`  - ${p}`));
    console.log('');
    console.log('DCS sunucu çalışıyor mu ve dcs-live-export.lua kurulu mu?');
    process.exit(1);
}

console.log(`🎯 Worker URL: ${WORKER_URL}`);
console.log(`🔑 API Key: ${API_KEY}`);
console.log(`⏱️  Upload aralığı: ${UPLOAD_INTERVAL / 1000}s`);
console.log('');
console.log('ℹ️  ÖNEMLİ: API Key\'i Cloudflare Worker\'a da eklemeyi unutma!');
console.log('');
console.log('📡 Upload başlıyor...');
console.log('─'.repeat(50));

// İlk upload
uploadData(dataFile);

// Düzenli upload
setInterval(() => uploadData(dataFile), UPLOAD_INTERVAL);
