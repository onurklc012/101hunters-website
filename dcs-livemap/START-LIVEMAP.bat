@echo off
title 101st Live Map Uploader
echo.
echo ╔══════════════════════════════════════════════╗
echo ║  101st Hunter Squadron - Live Map Uploader   ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Bu pencereyi acik tut - DCS calistigi surece veri gonderir.
echo Kapatmak icin Ctrl+C yap.
echo.

node "%~dp0livemap-uploader.js"

if errorlevel 1 (
    echo.
    echo HATA: Node.js kurulu olmayabilir.
    echo https://nodejs.org adresinden indir.
    echo.
    pause
)
