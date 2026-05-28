@echo off
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Backend install failed!
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Frontend install failed!
    pause
    exit /b 1
)

cd ..
echo.
echo All dependencies installed successfully!
echo.
pause
