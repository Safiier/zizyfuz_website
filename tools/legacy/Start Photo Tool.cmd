@echo off
setlocal
cd /d "%~dp0"

echo Starting zizyfuz photo tool...
echo Keep this window open while using the tool.
echo.

start "" "http://127.0.0.1:5174"
"C:\Program Files\nodejs\npm.cmd" run photo-tool

echo.
echo Photo tool stopped. You can close this window.
pause
