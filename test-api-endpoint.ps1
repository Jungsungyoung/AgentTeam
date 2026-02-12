# Test API endpoint
Write-Host "Testing API endpoints..." -ForegroundColor Cyan

# Test GET request
Write-Host "`n1. Testing GET /api/claude-team" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/claude-team" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   GET Success: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content preview:" -ForegroundColor Gray
    $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
} catch {
    Write-Host "   GET Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
    }
}

# Test POST request
Write-Host "`n2. Testing POST /api/claude-team" -ForegroundColor Yellow
try {
    $body = @{
        mission = "Test mission"
        mode = "simulation"
        missionId = "test-001"
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/claude-team" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10 `
        -ErrorAction Stop

    Write-Host "   POST Success: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content preview:" -ForegroundColor Gray
    $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
} catch {
    Write-Host "   POST Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
    }
}
