@echo off
title Atelier Visuel de Pensee
echo.
echo ========================================
echo   Atelier Visuel de Pensee - Demarrage
echo ========================================
echo.

REM Ajouter Node.js au PATH si necessaire
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Aller dans le dossier du projet
cd /d "%~dp0"

REM Verifier que les dependances frontend sont installees
if not exist "frontend\node_modules" (
    echo [1/3] Installation des dependances frontend...
    cd frontend
    call npm install
    cd ..
    echo.
) else (
    echo [1/3] Dependances frontend OK
)

REM Verifier que les dependances backend sont installees
echo [2/3] Verification des dependances backend...
python -m pip install -r backend\requirements.txt --quiet 2>nul

echo [3/3] Lancement des serveurs...
echo.
echo   Backend  : http://localhost:8000
echo   Frontend : http://localhost:3000
echo.
echo   Ouvre ton navigateur sur http://localhost:3000
echo.
echo   Pour arreter : ferme cette fenetre
echo ========================================
echo.

REM Lancer le backend en arriere-plan
start "Backend Atelier Visuel" /min cmd /c "cd /d %~dp0backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

REM Attendre 2 secondes que le backend demarre
timeout /t 2 /nobreak >nul

REM Lancer le frontend (reste au premier plan)
cd /d "%~dp0frontend"
call npx vite --port 3000 --open
