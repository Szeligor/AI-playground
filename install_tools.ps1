# Windows Sandbox Teljes Workshop Elokeszito Szkript
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Astron QA Workshop - Sandbox Teljes Setup      " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$shareDir = "C:\Users\WDAGUtilityAccount\Desktop\AstronWorkshop"
$workDir  = "C:\Users\WDAGUtilityAccount\Desktop\SetupTemp"
New-Item -ItemType Directory -Path $workDir -Force | Out-Null

# 0. Google Chrome Telepites (Offline elonyben, fallback online letoltesre)
Write-Host "[1/5] Google Chrome bongeszo telepitese..." -ForegroundColor Yellow
$chromeInstaller = "$shareDir\ChromeSetup64.exe"
if (-not (Test-Path $chromeInstaller)) {
    $chromeInstaller = "$workDir\ChromeSetup64.exe"
    Write-Host "      Chrome letoltese a weprol..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://dl.google.com/chrome/install/latest/chrome_installer.exe" -OutFile $chromeInstaller -UseBasicParsing
}
Start-Process "$chromeInstaller" -ArgumentList "/silent /install" -Wait
if (Test-Path "$shareDir\fix_browser_and_protocol.reg") {
    & reg import "$shareDir\fix_browser_and_protocol.reg"
}
Write-Host "      Google Chrome sikeresen telepitve es tarsitva!" -ForegroundColor Green

# Antigravity IDE es Antigravity 2.0 elokeszitese (Ha nincs mellekelve, online telepito futtatasa)
$localPrograms = "C:\Users\WDAGUtilityAccount\AppData\Local\Programs"
New-Item -ItemType Directory -Path $localPrograms -Force | Out-Null
$ideSymlink = "$localPrograms\Antigravity IDE"
if (Test-Path "$shareDir\antigravity_ide") {
    if (-not (Test-Path $ideSymlink)) {
        cmd.exe /c mklink /D "`"$ideSymlink`"" "`"$shareDir\antigravity_ide`"" | Out-Null
    }
}

# Antigravity IDE bovitmenyek (pl. Playwright) elokeszitese
$ideExtensionsDir = "C:\Users\WDAGUtilityAccount\.antigravity-ide\extensions"
$projPlaywrightExt = "$shareDir\project\extensions\ms-playwright.playwright"
if (-not (Test-Path $projPlaywrightExt) -and (Test-Path "$PSScriptRoot\extensions\ms-playwright.playwright")) {
    $projPlaywrightExt = "$PSScriptRoot\extensions\ms-playwright.playwright"
}
if (Test-Path $projPlaywrightExt) {
    New-Item -ItemType Directory -Path $ideExtensionsDir -Force | Out-Null
    Copy-Item -Path $projPlaywrightExt -Destination "$ideExtensionsDir\ms-playwright.playwright" -Recurse -Force
    Write-Host "      Playwright IDE bovitmeny sikeresen telepitve az Antigravity IDE-be!" -ForegroundColor Green
}



# 1. Playwright Bongeszok Masolasa a helyere (Offline / Azonnali Start!)
Write-Host "[2/5] Playwright Chromium bongeszo elokeszitese..." -ForegroundColor Yellow
$localMsPlaywright = "C:\Users\WDAGUtilityAccount\AppData\Local\ms-playwright"
if (Test-Path "$shareDir\ms-playwright") {
    New-Item -ItemType Directory -Path "C:\Users\WDAGUtilityAccount\AppData\Local" -Force | Out-Null
    Copy-Item -Path "$shareDir\ms-playwright" -Destination $localMsPlaywright -Recurse -Force
    Write-Host "      Playwright Chromium bongeszo keszen all!" -ForegroundColor Green
}

# 2. Node.js LTS Telepites (Offline elonyben reszesitve, fallback letoltesre)
Write-Host "[3/5] Node.js LTS telepitese..." -ForegroundColor Yellow
$nodeMsi = "$shareDir\nodejs.msi"
if (-not (Test-Path $nodeMsi)) {
    $nodeMsi = "$workDir\nodejs.msi"
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi" -OutFile $nodeMsi -UseBasicParsing
}
Start-Process "msiexec.exe" -ArgumentList "/i `"$nodeMsi`" /qn /norestart" -Wait
Write-Host "      Node.js sikeresen telepitve!" -ForegroundColor Green

# 3. Git for Windows Telepites (Offline elonyben reszesitve, fallback letoltesre)
Write-Host "[4/5] Git for Windows telepitese..." -ForegroundColor Yellow
$gitExe = "$shareDir\git-installer.exe"
if (-not (Test-Path $gitExe)) {
    $gitExe = "$workDir\git-installer.exe"
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.46.2.windows.1/Git-2.46.2-64-bit.exe" -OutFile $gitExe -UseBasicParsing
}
Start-Process "$gitExe" -ArgumentList "/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS" -Wait
Write-Host "      Git for Windows sikeresen telepitve!" -ForegroundColor Green

# 4. Git SChannel beallitasa es Bitbucket Hozzaferes elokeszitese
Write-Host "[5/5] Astron Bitbucket tanusitvany-illesztes es hitelesites..." -ForegroundColor Yellow
$gitCmd = "C:\Program Files\Git\cmd\git.exe"
& $gitCmd config --global user.name "Astron QA Participant"
& $gitCmd config --global user.email "workshop@astron.hu"
& $gitCmd config --global http."https://bitbucket.astron.hu".sslBackend schannel
& $gitCmd config --global http."https://bitbucket.astron.hu".sslVerify true
& $gitCmd config --global http."https://bitbucket.astron.hu".sslAutoClientCert true
& $gitCmd config --global credential.helper store

# Bitbucket Workshop hozzaferesi adatok rogzitese a Sandbox Git klienseben
$credContent = "https://bd2837.aiws:vjWYxhgBZmYO4l@bitbucket.astron.hu`n"
Set-Content -Path "C:\Users\WDAGUtilityAccount\.git-credentials" -Value $credContent -Encoding ASCII


# Workshop repo frissitese / a legfrissebb tananyag azonnali behuzasa
Write-Host "      Legfrissebb tananyag szinkronizalasa a Bitbucketrol..." -ForegroundColor Yellow
Set-Location "$shareDir\project"
& $gitCmd pull origin main
Write-Host "      Git SChannel es Bitbucket hozzaferes keszen all!" -ForegroundColor Green

Write-Host "==================================================" -ForegroundColor Green
Write-Host "  MINDEN KESZEN ALL A WORKSHOPHOZ!               " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Parancsikonok letrehozasa a Sandbox Asztalan
$wsh = New-Object -ComObject WScript.Shell

$shortcut20 = $wsh.CreateShortcut("C:\Users\WDAGUtilityAccount\Desktop\Antigravity 2.0.lnk")
$shortcut20.TargetPath = "$shareDir\antigravity_app\Antigravity.exe"
$shortcut20.WorkingDirectory = "$shareDir\antigravity_app"
$shortcut20.Save()

$shortcutIde = $wsh.CreateShortcut("C:\Users\WDAGUtilityAccount\Desktop\Antigravity IDE.lnk")
$shortcutIde.TargetPath = "$shareDir\antigravity_ide\Antigravity IDE.exe"
$shortcutIde.Arguments = "`"$shareDir\project`""
$shortcutIde.WorkingDirectory = "$shareDir\antigravity_ide"
$shortcutIde.Save()

Write-Host "      Asztali parancsikonok elkeszultek (Antigravity 2.0 & IDE)!" -ForegroundColor Green

# Inditsuk el az Antigravity IDE-t a koddal
Start-Process "cmd.exe" "/c `"$shareDir\START_ANTIGRAVITY_IDE.bat`""

# Inditsuk el az Antigravity 2.0-t is
Start-Process "cmd.exe" "/c `"$shareDir\START_ANTIGRAVITY_2.0.bat`""
