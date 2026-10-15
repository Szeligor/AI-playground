@echo off
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
git config --global --add safe.directory C:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project
start "" "C:\Users\WDAGUtilityAccount\Desktop\AstronWorkshop\antigravity_ide\Antigravity IDE.exe" --disable-gpu "C:\Users\WDAGUtilityAccount\Desktop\AstronWorkshop\project"
