@echo off
title Upload CampusShare to GitHub
color 0b
echo ==================================================
echo   CampusShare Tracker - Uploading to GitHub...
echo ==================================================
cd /d "%~dp0"

echo.
echo Running: git push -u origin main
echo (If prompted, please click 'Sign in with your browser')
echo.

git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ==================================================
    echo [SUCCESS] Successfully pushed to GitHub!
    echo Repo: https://github.com/Reshusingh-25/campus-share-tracker
    echo ==================================================
) else (
    echo [ERROR] Push failed. Please check your internet or credentials above.
)

echo.
pause
