@echo off
REM Install missing backend packages
cd backend
echo Installing missing packages: cookie-parser, zod, xss...
npm install cookie-parser zod xss
echo.
echo Installation complete! Try running: npm run dev
pause
