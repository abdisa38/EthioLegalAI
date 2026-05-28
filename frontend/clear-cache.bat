@echo off
echo Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Vite cache cleared!
) else (
    echo No Vite cache found.
)

echo.
echo Clearing dist folder...
if exist "dist" (
    rmdir /s /q "dist"
    echo Dist folder cleared!
) else (
    echo No dist folder found.
)

echo.
echo Cache cleared successfully!
echo Please restart your dev server with: npm run dev
pause
