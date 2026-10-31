@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 run_local_preview.py
) else (
  python run_local_preview.py
)
echo.
echo Preview stopped. Press any key to close.
pause >nul
