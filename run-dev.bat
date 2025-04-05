@echo off
echo Checking for processes using port 8080...

:: Find the process ID using port 8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    set pid=%%a
    goto :found
)

:notfound
echo No process found using port 8080.
goto :start

:found
echo Found process with PID %pid% using port 8080. Killing process...
taskkill /F /PID %pid%
echo Process killed.

:: Wait a moment for the port to be released
timeout /t 1 /nobreak > nul

:start
echo Starting npm run dev...
npm run dev 