# Test Mission SSE Stream
$body = @{
    mission = "Build a landing page with hero section and CTA"
    mode = "simulation"
    missionId = "test-integration-001"
} | ConvertTo-Json

Write-Host "Sending mission request..." -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/claude-team" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -TimeoutSec 30

    Write-Host "Response received!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
    Write-Host "Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Stream content:" -ForegroundColor Cyan
    Write-Host $response.Content
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host $reader.ReadToEnd()
    }
}
