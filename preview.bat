@echo off
setlocal
rem Lamalo Publication - start a local web server and open the site for review.
rem Double-click this file. Close the window (or press Ctrl+C) to stop the server.
cd /d "%~dp0"
title Lamalo Publication - local preview

where node >nul 2>nul
if %errorlevel%==0 (
  node "tools\serve.cjs" %*
  if errorlevel 1 pause
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo.
  echo   Lamalo Publication - local preview
  echo   http://localhost:8080/
  echo.
  echo   Press Ctrl+C to stop.
  echo.
  start "" "http://localhost:8080/"
  python -m http.server 8080 --bind 127.0.0.1
  goto :eof
)

echo.
echo   Could not find Node.js or Python on this computer.
echo   Install Node.js from https://nodejs.org and run this file again.
echo.
pause
