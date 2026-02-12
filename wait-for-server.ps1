# Wait for dev server to be ready
Write-Host "Waiting for server to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

$ready = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/claude-team" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "Server is ready! (Status: $($response.StatusCode))" -ForegroundColor Green
        $ready = $true
        break
    } catch {
        Write-Host "Attempt $i failed, retrying in 2 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if ($ready) {
    Write-Host "Server verification complete!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Server failed to start after 10 attempts" -ForegroundColor Red
    exit 1
}
