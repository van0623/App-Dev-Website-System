@echo off
echo Creating database backup...

:: Set the date in format YYYY-MM-DD
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "datestamp=%YYYY%-%MM%-%DD%"

:: Create backup folder if it doesn't exist
if not exist "backups" mkdir backups

:: Set the backup filename with date
set "BACKUP_FILE=backups\clothing_store_backup_%datestamp%.sql"

:: MySQL backup command
echo Please enter your MySQL root password when prompted
mysqldump -u root -p clothing_store > %BACKUP_FILE%

echo.
if %ERRORLEVEL% EQU 0 (
    echo Backup created successfully: %BACKUP_FILE%
) else (
    echo Failed to create backup
)

echo.
echo Press any key to exit
pause > nul 