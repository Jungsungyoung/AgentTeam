# Week 1 Integration Fixes Verification Script
# Tests the 3 fixes from the integration test report

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Week 1 Integration Fixes Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testMission = "Build a landing page with hero section"
$missionId = "test-fix-" + (Get-Date -Format "yyyyMMddHHmmss")
$apiUrl = "http://localhost:3000/api/claude-team"

Write-Host "[1/3] Testing GET endpoint support..." -ForegroundColor Yellow

# Build query string
$queryParams = @{
    mission = [System.Web.HttpUtility]::UrlEncode($testMission)
    mode = "simulation"
    missionId = $missionId
}
$queryString = ($queryParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
$getUrl = "$apiUrl`?$queryString"

Write-Host "GET URL: $getUrl" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $getUrl -Method GET -TimeoutSec 10 -ErrorAction Stop

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ GET endpoint working (Status: 200)" -ForegroundColor Green

        # Parse SSE events
        $content = $response.Content
        $events = $content -split "data: " | Where-Object { $_ -match "\S" }

        Write-Host "   Received $($events.Count) SSE events" -ForegroundColor Gray

        # Check for team_log events
        $teamLogs = $events | Where-Object { $_ -match '"type":"team_log"' }

        if ($teamLogs.Count -gt 0) {
            Write-Host ""
            Write-Host "[2/3] Testing team_log data structure..." -ForegroundColor Yellow

            $hasContent = $false
            $hasType = $false

            foreach ($log in $teamLogs) {
                # Check if contains 'content' field (not 'message')
                if ($log -match '"content"') {
                    $hasContent = $true
                }

                # Check if contains 'type' field (LogType)
                if ($log -match '"type":"(SYSTEM|MISSION|COLLAB|COMPLETE|AGENT)"') {
                    $hasType = $true
                }

                if ($hasContent -and $hasType) {
                    break
                }
            }

            if ($hasContent) {
                Write-Host "✅ team_log uses 'content' field (not 'message')" -ForegroundColor Green
            } else {
                Write-Host "❌ team_log still uses 'message' field" -ForegroundColor Red
            }

            if ($hasType) {
                Write-Host "✅ team_log includes LogType ('type' field)" -ForegroundColor Green
            } else {
                Write-Host "❌ team_log missing LogType field" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  No team_log events found in response" -ForegroundColor Yellow
        }

        # Check for agent_message events
        Write-Host ""
        Write-Host "[3/3] Testing agent_message events..." -ForegroundColor Yellow

        $agentMessages = $events | Where-Object { $_ -match '"type":"agent_message"' }

        if ($agentMessages.Count -gt 0) {
            Write-Host "✅ agent_message events present ($($agentMessages.Count) events)" -ForegroundColor Green

            # Verify message field exists
            $firstMessage = $agentMessages[0]
            if ($firstMessage -match '"message"') {
                Write-Host "✅ agent_message uses correct 'message' field" -ForegroundColor Green
            } else {
                Write-Host "❌ agent_message missing 'message' field" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  No agent_message events found" -ForegroundColor Yellow
        }

    } else {
        Write-Host "❌ Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
    }

} catch {
    Write-Host "❌ GET request failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure dev server is running: npm run dev" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
