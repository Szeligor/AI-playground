@echo off
setlocal
cd /d "%~dp0"
echo ==================================================
echo Astron QA Workshop - Sandbox Inditasa...
echo Mappa: %CD%
echo ==================================================

start "" "%~dp0astron_workshop_sandbox.wsb"
