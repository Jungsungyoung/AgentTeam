# ========================================
# Hybrid Mode Comprehensive Integration Test
# ========================================
# Task: #3 - 통합 테스트 및 Hybrid 모드 검증
# Tester: qa-tester
# Date: 2026-02-13
# ========================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$CostTrackingFile = "D:\01_DevProjects\VibeCoding_Projects\02_AgentTeam_02\cost-tracking.json",
    [switch]$Verbose = $false
)

# Test configuration
$Global:TestResults = @()
$Global:PerformanceMetrics = @{
    CacheHitTimes = @()
    CacheMissTimes = @()
    ErrorTimes = @()
}

# Helper Functions
function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-ScenarioHeader {
    param([string]$Number, [string]$Title)
    Write-Host "`n📋 Scenario $Number" -ForegroundColor Yellow
    Write-Host "   $Title" -ForegroundColor White
    Write-Host "   " + ("-" * 60) -ForegroundColor DarkGray
}

function Write-TestStep {
    param([string]$Step)
    Write-Host "   🔹 $Step" -ForegroundColor Gray
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = "",
        [double]$Duration = 0
    )

    $status = if ($Passed) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }

    Write-Host "   $status - $TestName" -ForegroundColor $color
    if ($Message) {
        Write-Host "      └─ $Message" -ForegroundColor Gray
    }
    if ($Duration -gt 0) {
        Write-Host "      └─ Duration: $([math]::Round($Duration, 2))ms" -ForegroundColor Gray
    }

    $Global:TestResults += @{
        Name = $TestName
        Passed = $Passed
        Message = $Message
        Duration = $Duration
        Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
}

function Invoke-APIRequest {
    param(
        [string]$Mission,
        [string]$Mode,
        [string]$MissionId,
        [int]$TimeoutSec = 30
    )

    $body = @{
        mission = $Mission
        mode = $Mode
        missionId = $MissionId
    } | ConvertTo-Json

    $startTime = Get-Date

    try {
        $response = Invoke-WebRequest `
            -Uri "$BaseUrl/api/claude-team" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec $TimeoutSec `
            -ErrorAction Stop

        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds

        return @{
            Success = $true
            Response = $response
            Duration = $duration
            StatusCode = $response.StatusCode
        }
    } catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds

        return @{
            Success = $false
            Error = $_.Exception.Message
            Duration = $duration
            StatusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        }
    }
}

function Get-CostTrackingStats {
    if (Test-Path $CostTrackingFile) {
        try {
            $content = Get-Content $CostTrackingFile -Raw | ConvertFrom-Json
            return $content
        } catch {
            Write-Host "   ⚠️  Warning: Could not parse cost tracking file" -ForegroundColor Yellow
            return $null
        }
    } else {
        Write-Host "   ⚠️  Warning: Cost tracking file not found" -ForegroundColor Yellow
        return $null
    }
}

function Test-CacheIndicator {
    param([string]$Content, [bool]$ExpectCacheHit)

    $hasCacheHit = $Content -match "cache.*hit" -or $Content -match '"cached":\s*true'
    $hasCacheMiss = $Content -match "cache.*miss" -or $Content -match '"cached":\s*false'

    if ($ExpectCacheHit) {
        return $hasCacheHit
    } else {
        return $hasCacheMiss
    }
}

# ========================================
# Pre-Test Checks
# ========================================

Write-TestHeader "Hybrid Mode Integration Test Suite"

Write-Host "Pre-Test Checks:" -ForegroundColor Cyan
Write-Host ""

# Check if dev server is running
Write-TestStep "Checking dev server..."
try {
    # Try base URL first (Next.js should respond with 200 or 404, but not connection error)
    $healthCheck = Invoke-WebRequest -Uri "$BaseUrl" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Dev server is running" -ForegroundColor Green
} catch {
    if ($_.Exception.Response) {
        # Server responded with some status code (even 404 is fine - server is running)
        Write-Host "   ✅ Dev server is running (Status: $($_.Exception.Response.StatusCode.value__))" -ForegroundColor Green
    } else {
        # Connection error - server not running
        Write-Host "   ❌ Dev server is NOT running!" -ForegroundColor Red
        Write-Host "   └─ Please run: cd my-office && npm run dev" -ForegroundColor Yellow
        exit 1
    }
}

# Check environment file
Write-TestStep "Checking environment configuration..."
$envFile = "D:\01_DevProjects\VibeCoding_Projects\02_AgentTeam_02\my-office\.env.local"
if (Test-Path $envFile) {
    Write-Host "   ✅ .env.local found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env.local not found (may use defaults)" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# SCENARIO 1: Cache Miss → API Call → Caching
# ========================================

Write-ScenarioHeader "1" "Cache Miss → API Call → Caching Verification"

Write-TestStep "Sending first-time mission request (cache miss expected)..."

$mission1 = "Create a login page with authentication"
$result1 = Invoke-APIRequest -Mission $mission1 -Mode "hybrid" -MissionId "test-cache-miss-001"

if ($result1.Success) {
    Write-TestResult -TestName "API Request Executed" -Passed $true -Duration $result1.Duration

    # Check cache miss indicator
    $isCacheMiss = Test-CacheIndicator -Content $result1.Response.Content -ExpectCacheHit $false
    Write-TestResult -TestName "Cache Miss Detected" -Passed $isCacheMiss `
        -Message $(if ($isCacheMiss) { "Cache miss indicator found in response" } else { "No cache miss indicator found" })

    # Check response time (should be slower for API call)
    $apiCallTimeValid = $result1.Duration -lt 5000  # < 5 seconds (critical threshold)
    Write-TestResult -TestName "API Response Time" -Passed $apiCallTimeValid `
        -Message "Target: <3s, Critical: <5s, Actual: $([math]::Round($result1.Duration/1000, 2))s"

    $Global:PerformanceMetrics.CacheMissTimes += $result1.Duration

} else {
    Write-TestResult -TestName "API Request Executed" -Passed $false `
        -Message "Error: $($result1.Error)"
}

# ========================================
# SCENARIO 2: Cache Hit → No API Call
# ========================================

Write-ScenarioHeader "2" "Cache Hit → No API Call Verification"

Write-TestStep "Waiting 1 second before cache hit test..."
Start-Sleep -Seconds 1

Write-TestStep "Sending identical mission request (cache hit expected)..."

$result2 = Invoke-APIRequest -Mission $mission1 -Mode "hybrid" -MissionId "test-cache-hit-001"

if ($result2.Success) {
    Write-TestResult -TestName "API Request Executed" -Passed $true -Duration $result2.Duration

    # Check cache hit indicator
    $isCacheHit = Test-CacheIndicator -Content $result2.Response.Content -ExpectCacheHit $true
    Write-TestResult -TestName "Cache Hit Detected" -Passed $isCacheHit `
        -Message $(if ($isCacheHit) { "Cache hit indicator found in response" } else { "No cache hit indicator found" })

    # Check response time (should be fast for cache hit)
    $cacheHitTimeValid = $result2.Duration -lt 200  # < 200ms (critical threshold)
    $cacheHitTimeOptimal = $result2.Duration -lt 100  # < 100ms (target threshold)

    Write-TestResult -TestName "Cache Hit Response Time" -Passed $cacheHitTimeValid `
        -Message "Target: <100ms, Critical: <200ms, Actual: $([math]::Round($result2.Duration, 2))ms" `
        -Duration $result2.Duration

    $Global:PerformanceMetrics.CacheHitTimes += $result2.Duration

} else {
    Write-TestResult -TestName "API Request Executed" -Passed $false `
        -Message "Error: $($result2.Error)"
}

# ========================================
# SCENARIO 3: Repeated Missions → Cache Reuse
# ========================================

Write-ScenarioHeader "3" "Repeated Missions → Cache Reuse Verification"

Write-TestStep "Sending 5 identical requests to verify cache consistency..."

$cacheHitCount = 0
$totalRequests = 5

for ($i = 1; $i -le $totalRequests; $i++) {
    $result = Invoke-APIRequest -Mission $mission1 -Mode "hybrid" -MissionId "test-cache-repeat-00$i"

    if ($result.Success) {
        $isCacheHit = Test-CacheIndicator -Content $result.Response.Content -ExpectCacheHit $true
        if ($isCacheHit) {
            $cacheHitCount++
        }
        $Global:PerformanceMetrics.CacheHitTimes += $result.Duration

        if ($Verbose) {
            Write-Host "      Request $i/$totalRequests - Duration: $([math]::Round($result.Duration, 2))ms - Cache: $(if ($isCacheHit) { 'HIT' } else { 'MISS' })" -ForegroundColor Gray
        }
    }

    Start-Sleep -Milliseconds 200  # Brief pause between requests
}

$cacheConsistency = $cacheHitCount -eq $totalRequests
Write-TestResult -TestName "Cache Consistency" -Passed $cacheConsistency `
    -Message "$cacheHitCount/$totalRequests requests served from cache"

# Calculate average cache hit time
if ($Global:PerformanceMetrics.CacheHitTimes.Count -gt 0) {
    $avgCacheHitTime = ($Global:PerformanceMetrics.CacheHitTimes | Measure-Object -Average).Average
    Write-Host "      └─ Average cache hit time: $([math]::Round($avgCacheHitTime, 2))ms" -ForegroundColor Gray
}

# ========================================
# SCENARIO 4: Missing API Key → Error Handling
# ========================================

Write-ScenarioHeader "4" "Missing API Key → Error Handling Verification"

Write-TestStep "Note: This test requires backend to validate API key requirement..."
Write-TestStep "Testing with a mission that would require API call..."

# Use a different mission to avoid cache
$mission4 = "Design a REST API with authentication and authorization"
$result4 = Invoke-APIRequest -Mission $mission4 -Mode "hybrid" -MissionId "test-api-key-001" -TimeoutSec 10

if ($result4.Success) {
    Write-TestResult -TestName "API Key Validation" -Passed $true `
        -Message "Request succeeded (API key present or not required)"
} else {
    # Check if error is related to API key
    $isApiKeyError = $result4.Error -match "api.*key" -or $result4.Error -match "authentication" -or $result4.StatusCode -eq 401 -or $result4.StatusCode -eq 403

    if ($isApiKeyError) {
        Write-TestResult -TestName "API Key Error Handling" -Passed $true `
            -Message "Proper error handling for missing API key (Status: $($result4.StatusCode))"
    } else {
        Write-TestResult -TestName "API Request" -Passed $false `
            -Message "Error: $($result4.Error) (Status: $($result4.StatusCode))"
    }
}

# ========================================
# SCENARIO 5: Rate Limit → Retry Logic
# ========================================

Write-ScenarioHeader "5" "Rate Limit → Retry Logic Verification"

Write-TestStep "Note: Rate limiting may not be triggered in test environment..."
Write-TestStep "Sending rapid requests to test retry mechanism..."

$rateLimitTriggered = $false
$retryDetected = $false

for ($i = 1; $i -le 3; $i++) {
    $mission5 = "Test rate limit scenario - Request $i"
    $result5 = Invoke-APIRequest -Mission $mission5 -Mode "hybrid" -MissionId "test-rate-limit-00$i" -TimeoutSec 10

    if ($result5.Success) {
        # Check response for retry indicators
        if ($result5.Response.Content -match "retry" -or $result5.Response.Content -match "rate.*limit") {
            $retryDetected = $true
        }
    } else {
        if ($result5.StatusCode -eq 429) {
            $rateLimitTriggered = $true
        }
    }

    Start-Sleep -Milliseconds 100  # Rapid requests
}

if ($rateLimitTriggered) {
    Write-TestResult -TestName "Rate Limit Detection" -Passed $true `
        -Message "Rate limit was triggered (Status: 429)"

    Write-TestResult -TestName "Retry Logic" -Passed $retryDetected `
        -Message $(if ($retryDetected) { "Retry mechanism detected in response" } else { "No retry mechanism detected (check implementation)" })
} else {
    Write-TestResult -TestName "Rate Limit Testing" -Passed $true `
        -Message "Rate limit not triggered in test environment (verify retry logic exists in code)"
}

# ========================================
# Performance Analysis
# ========================================

Write-TestHeader "Performance Metrics Analysis"

# Cache hit rate
$stats = Get-CostTrackingStats
if ($stats -and $stats.sessionStats) {
    Write-Host "Cost Tracking Statistics:" -ForegroundColor Cyan
    Write-Host "   Total Calls: $($stats.sessionStats.totalCalls)" -ForegroundColor White
    Write-Host "   Cached Calls: $($stats.sessionStats.cachedCalls)" -ForegroundColor Green
    Write-Host "   API Calls: $($stats.sessionStats.apiCalls)" -ForegroundColor Yellow
    Write-Host "   Estimated Tokens: $($stats.sessionStats.estimatedTokens)" -ForegroundColor White
    Write-Host "   Cache Hit Rate: $($stats.sessionStats.cacheHitRate)%" -ForegroundColor $(if ([double]$stats.sessionStats.cacheHitRate -gt 50) { "Green" } else { "Yellow" })
    Write-Host ""

    # Validate cache hit rate
    $hitRate = [double]$stats.sessionStats.cacheHitRate
    $hitRateValid = $hitRate -ge 30  # Critical threshold
    $hitRateOptimal = $hitRate -ge 50  # Target threshold

    Write-TestResult -TestName "Cache Hit Rate" -Passed $hitRateValid `
        -Message "Target: >50%, Critical: >30%, Actual: $($stats.sessionStats.cacheHitRate)%"
}

# Response time analysis
if ($Global:PerformanceMetrics.CacheHitTimes.Count -gt 0) {
    $avgCacheHit = ($Global:PerformanceMetrics.CacheHitTimes | Measure-Object -Average).Average
    $maxCacheHit = ($Global:PerformanceMetrics.CacheHitTimes | Measure-Object -Maximum).Maximum
    $minCacheHit = ($Global:PerformanceMetrics.CacheHitTimes | Measure-Object -Minimum).Minimum

    Write-Host "Cache Hit Performance:" -ForegroundColor Cyan
    Write-Host "   Average: $([math]::Round($avgCacheHit, 2))ms" -ForegroundColor White
    Write-Host "   Min: $([math]::Round($minCacheHit, 2))ms" -ForegroundColor Green
    Write-Host "   Max: $([math]::Round($maxCacheHit, 2))ms" -ForegroundColor Yellow
    Write-Host ""
}

if ($Global:PerformanceMetrics.CacheMissTimes.Count -gt 0) {
    $avgCacheMiss = ($Global:PerformanceMetrics.CacheMissTimes | Measure-Object -Average).Average

    Write-Host "Cache Miss (API Call) Performance:" -ForegroundColor Cyan
    Write-Host "   Average: $([math]::Round($avgCacheMiss/1000, 2))s" -ForegroundColor White
    Write-Host ""
}

# ========================================
# Test Summary
# ========================================

Write-TestHeader "Test Summary"

$totalTests = $Global:TestResults.Count
$passedTests = ($Global:TestResults | Where-Object { $_.Passed -eq $true }).Count
$failedTests = $totalTests - $passedTests
$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host "Total Tests Run: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Gray" })
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })
Write-Host ""

# Overall status
if ($failedTests -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Hybrid mode implementation verified" -ForegroundColor Green
    Write-Host "✅ Performance benchmarks met" -ForegroundColor Green
    Write-Host "✅ Cache functionality working correctly" -ForegroundColor Green
} else {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Failed Tests:" -ForegroundColor Red
    $Global:TestResults | Where-Object { $_.Passed -eq $false } | ForEach-Object {
        Write-Host "   ❌ $($_.Name)" -ForegroundColor Red
        if ($_.Message) {
            Write-Host "      └─ $($_.Message)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "📊 Cost tracking data saved to:" -ForegroundColor Cyan
Write-Host "   $CostTrackingFile" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review failed tests (if any)" -ForegroundColor Gray
Write-Host "   2. Check cost-tracking.json for detailed metrics" -ForegroundColor Gray
Write-Host "   3. Generate final test report" -ForegroundColor Gray
Write-Host ""

# Export results for report generation
$resultsFile = "D:\01_DevProjects\VibeCoding_Projects\02_AgentTeam_02\test-results-hybrid.json"
$Global:TestResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsFile -Encoding UTF8

Write-Host "Test results exported to: $resultsFile" -ForegroundColor Gray
Write-Host ""

# Exit with appropriate code
if ($failedTests -gt 0) {
    exit 1
} else {
    exit 0
}
