try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Server is running on port 3000" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
    exit 0
} catch {
    Write-Host "Server is NOT running on port 3000" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}
