# Find process using port 8080
$process = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

# Kill the process if found
if ($process) {
    Write-Host "Found process with ID $process using port 8080. Killing process..."
    Stop-Process -Id $process -Force
    Write-Host "Process killed."
} else {
    Write-Host "No process found using port 8080."
}

# Wait a moment for the port to be released
Start-Sleep -Seconds 1

# Run npm dev
Write-Host "Starting npm run dev..."
npm run dev 