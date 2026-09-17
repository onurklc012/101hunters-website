# DCS Live Map - Kurulum Kılavuzu

## 📋 DCS PC'de Yapılacaklar

### 1. Lua Export Script Kurulumu
```
dcs-live-export.lua dosyasını şuraya kopyala:
C:\Users\<KULLANICI>\Saved Games\DCS.openbeta_server\Scripts\Export\dcs-live-export.lua
```

> Not: `DCS.openbeta_server` yerine kendi DCS profil klasörünü kullan.
> Export klasörü yoksa oluştur.

### 2. DCS Sunucuyu Yeniden Başlat
Script otomatik çalışacak ve `livemap-data.json` dosyası oluşacak.

### 3. Uploader'ı Çalıştır
```
START-LIVEMAP.bat dosyasına çift tıkla
```
Bu pencere açık kaldığı sürece her 5 saniyede veri gönderilir.

### 4. livemap-uploader.js İçinde API Ayarları
- `WORKER_URL` → Cloudflare Worker deploy edildikten sonra güncellenmeli
- `API_KEY` → Worker'daki key ile aynı olmalı

## ⚠️ Gereksinimler
- Node.js kurulu olmalı (https://nodejs.org)
- DCS sunucu çalışıyor olmalı
- İnternet bağlantısı olmalı
