@echo off
setlocal
cd /d "%~dp0"
echo ==================================================
echo Astron QA Workshop - Sandbox Inditasa...
echo Mappa: %CD%
echo ==================================================

powershell -ExecutionPolicy Bypass -Command "$here = (Get-Location).Path; $wsb = \"<Configuration><Networking>Enable</Networking><vGPU>Enable</vGPU><MemoryInMB>8192</MemoryInMB><MappedFolders><MappedFolder><HostFolder>$here</HostFolder><SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\AstronWorkshop</SandboxFolder><ReadOnly>false</ReadOnly></MappedFolder></MappedFolders><LogonCommand><Command>cmd.exe /c start C:\Users\WDAGUtilityAccount\Desktop\AstronWorkshop\START_TELEPITES.bat</Command></LogonCommand></Configuration>\"; $tmp = \"$env:TEMP\run_astron_sandbox.wsb\"; Set-Content -Path $tmp -Value $wsb -Encoding ASCII; Start-Process $tmp"
