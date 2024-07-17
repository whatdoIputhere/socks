@echo off
setlocal enabledelayedexpansion

for /f "tokens=14" %%i in ('ipconfig ^| findstr /R /C:"IPv4 Address" ^| findstr /R /C:"10\."') do set IP_ADDRESS=%%i

set "tempFile=%temp%\temp_env_%random%.txt"
del "%tempFile%" 2>nul
set "found=0"

for /f "tokens=*" %%a in ('type ".env"') do (
	set "line=%%a"
	if "!line:~0,8!"=="ADDRESS=" (
		echo ADDRESS=!IP_ADDRESS!>>"%tempFile%"
		set "found=1"
	) else (
		echo %%a>>"%tempFile%"
	)
)

if "!found!"=="0" echo ADDRESS=!IP_ADDRESS!>>"%tempFile%"

move /y "%tempFile%" ".env" >nul

npm start