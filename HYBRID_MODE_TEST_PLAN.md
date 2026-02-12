# Hybrid Mode Integration Test Plan

**Task:** #3 - 통합 테스트 및 Hybrid 모드 검증
**Tester:** qa-tester
**Date:** 2026-02-13
**Status:** READY TO EXECUTE

---

## Test Environment

### Prerequisites
- Development server running: `npm run dev` (from my-office/)
- Environment: `.env.local` configured
- Dependencies: Tasks #1 (backend-dev) and #2 (frontend-dev) completed

### Configuration Files
- `my-office/.env.local` - Runtime configuration
- `my-office/.env.example` - Template reference
- `cost-tracking.json` - Generated metrics file

---

## Test Scenarios

### Scenario 1: Cache Miss → API Call → Caching

**Objective:** Verify first-time mission triggers API call and caches result

**Setup:**
1. Clear cache: Delete or clear mission-cache entries
2. Set mode: `MODE=hybrid` in .env.local
3. Ensure API key: `ANTHROPIC_API_KEY` set

**Test Steps:**
1. Send POST request to `/api/claude-team`
   ```json
   {
     "mission": "Create a login page with authentication",
     "mode": "hybrid",
     "missionId": "test-cache-miss-001"
   }
   ```
2. Measure response time
3. Check SSE events for cache miss indicator
4. Verify API call in cost-tracking.json

**Expected Results:**
- ✅ Response time: 2-3 seconds (API call)
- ✅ SSE event contains: `cache: false` or cache miss indicator
- ✅ cost-tracking.json shows: `cached: false`, `mode: "hybrid"`
- ✅ Response contains mission results from Claude API

**Success Criteria:**
- Response time < 3 seconds
- API call tracked correctly
- Cache entry created for future use

---

### Scenario 2: Cache Hit → No API Call

**Objective:** Verify repeated mission uses cache without API call

**Setup:**
1. Complete Scenario 1 first (ensure cache populated)
2. Keep same configuration

**Test Steps:**
1. Send identical POST request (same mission text)
   ```json
   {
     "mission": "Create a login page with authentication",
     "mode": "hybrid",
     "missionId": "test-cache-hit-001"
   }
   ```
2. Measure response time
3. Check SSE events for cache hit indicator
4. Verify NO new API call in cost-tracking.json

**Expected Results:**
- ✅ Response time: < 100ms (cache retrieval)
- ✅ SSE event contains: `cache: true` or cache hit indicator
- ✅ cost-tracking.json shows: `cached: true`, `tokensEstimate: 0`
- ✅ Identical response to Scenario 1

**Success Criteria:**
- Response time < 100ms
- No API call made
- Cache hit tracked correctly
- Correct response returned

---

### Scenario 3: Repeated Missions → Cache Reuse

**Objective:** Verify cache works across multiple requests

**Setup:**
1. Use same configuration as Scenario 2

**Test Steps:**
1. Send 5 identical requests in sequence
2. Measure response time for each
3. Check cache hit rate in cost-tracking.json

**Expected Results:**
- ✅ All 5 requests: Response time < 100ms
- ✅ All 5 requests: Cache hit indicator present
- ✅ Cache hit rate in stats: 100% (for these requests)
- ✅ Total API calls: 0 (for these 5 requests)

**Success Criteria:**
- All requests served from cache
- Consistent fast response times
- Cache hit rate > 50% overall (including Scenario 1)

---

### Scenario 4: Missing API Key → Error Handling

**Objective:** Verify graceful error handling when API key is missing

**Setup:**
1. Remove or comment out `ANTHROPIC_API_KEY` in .env.local
2. Clear cache to force API call attempt
3. Set mode: `MODE=hybrid`

**Test Steps:**
1. Send POST request
   ```json
   {
     "mission": "Test API key validation",
     "mode": "hybrid",
     "missionId": "test-no-api-key-001"
   }
   ```
2. Check response status code
3. Verify error message content

**Expected Results:**
- ✅ Response status: 400 or 500 (error code)
- ✅ Error message: Clear indication of missing API key
- ✅ No crash or unhandled exception
- ✅ Helpful error message for user

**Success Criteria:**
- Proper error status code returned
- Clear, actionable error message
- Application remains stable

---

### Scenario 5: Rate Limit → Retry Logic

**Objective:** Verify retry mechanism when rate limited

**Setup:**
1. Configure API key
2. Set mode: `MODE=hybrid`
3. May require multiple rapid requests to trigger

**Test Steps:**
1. Send rapid successive requests (10+ in quick succession)
2. Monitor for rate limit responses
3. Verify retry behavior
4. Check final success

**Expected Results:**
- ✅ Initial requests succeed
- ✅ Rate limit detected (if triggered)
- ✅ Automatic retry with backoff
- ✅ Eventually succeeds or reports clear error

**Success Criteria:**
- Retry logic activates on rate limit
- Exponential backoff implemented
- Clear logging of retry attempts
- Final success or clear failure message

**Note:** This scenario may be difficult to trigger in testing. If rate limiting is not encountered, verify retry logic exists in code and document that rate limiting was not triggered during testing.

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Critical |
|--------|--------|----------|
| Cache hit response time | < 100ms | < 200ms |
| API call response time | < 3s | < 5s |
| Cache hit rate (overall) | > 50% | > 30% |
| Error response time | < 500ms | < 1s |

### Measurement Method

1. **Response Time:**
   - Measure using PowerShell `Measure-Command`
   - Average over 3 runs for consistency
   - Record min, max, avg

2. **Cache Hit Rate:**
   - Extract from `cost-tracking.json`
   - Formula: `(cachedCalls / totalCalls) * 100`
   - Must include both cache miss and hit scenarios

3. **API Call Tracking:**
   - Parse `cost-tracking.json` after each scenario
   - Verify `cached` flag accuracy
   - Check token estimates

---

## Test Script Structure (test-hybrid.ps1)

```powershell
# Section 1: Environment Setup
- Check dev server running
- Verify .env.local exists
- Load configuration
- Clear previous test data

# Section 2: Scenario Execution
- Run each scenario sequentially
- Capture timing data
- Log results
- Handle errors gracefully

# Section 3: Performance Analysis
- Parse cost-tracking.json
- Calculate metrics
- Compare against benchmarks
- Generate summary

# Section 4: Report Generation
- Compile test results
- Document issues found
- Output formatted report
- Save to file
```

---

## Test Data

### Mission Samples

```javascript
// Simple mission (low token count)
"Create a login page with authentication"

// Medium mission
"Build a REST API with CRUD operations for user management"

// Complex mission (high token count)
"Design and implement a full-stack e-commerce platform with shopping cart, payment processing, user authentication, admin dashboard, and order tracking"

// Edge case: Empty
""

// Edge case: Very long
"[1000+ character mission string...]"
```

---

## Expected Outputs

### cost-tracking.json Structure

```json
{
  "lastUpdated": "2026-02-13T...",
  "sessionStats": {
    "totalCalls": 10,
    "cachedCalls": 8,
    "apiCalls": 2,
    "estimatedTokens": 500,
    "modes": {
      "sim": 0,
      "hybrid": 10,
      "real": 0
    },
    "cacheHitRate": "80.00"
  },
  "dailyStats": { ... },
  "recentCalls": [ ... ]
}
```

### Test Report Sections

1. **Executive Summary**
   - Overall pass/fail status
   - Critical issues found
   - Performance summary

2. **Test Results by Scenario**
   - Each scenario: PASS/FAIL
   - Detailed findings
   - Evidence (logs, metrics)

3. **Performance Metrics**
   - Benchmark comparison table
   - Response time charts
   - Cache hit rate analysis

4. **Issues and Recommendations**
   - Bugs found
   - Performance concerns
   - Suggested improvements

5. **Conclusion**
   - Final assessment
   - Sign-off status
   - Next steps

---

## Success Criteria Summary

**All scenarios must:**
- ✅ Execute without crashes
- ✅ Return correct responses
- ✅ Meet performance targets
- ✅ Log metrics accurately

**Overall acceptance:**
- All 5 scenarios: PASS
- Performance benchmarks: MET
- Test script: FUNCTIONAL
- Test report: COMPLETE

---

## Risk Assessment

### High Risk
- API key availability (affects Scenarios 1, 2, 3, 5)
- Cache persistence (affects Scenarios 2, 3)
- Network connectivity (affects API calls)

### Medium Risk
- Rate limiting unpredictability (Scenario 5)
- Timing variance (performance benchmarks)
- Cost tracking file permissions

### Low Risk
- Environment variable loading
- PowerShell compatibility
- Test data validity

---

## Mitigation Strategies

1. **API Key Issues:**
   - Use simulation mode for initial testing
   - Verify API key validity before starting
   - Have backup key available

2. **Cache Issues:**
   - Verify cache implementation with unit tests first
   - Clear cache between test runs
   - Monitor cache file/memory state

3. **Performance Variance:**
   - Run multiple iterations
   - Use average values
   - Account for network latency

4. **Rate Limiting:**
   - Space out requests appropriately
   - Have retry logic verification as code review fallback
   - Document if not triggered

---

## Dependencies

**Blocking:**
- Task #1: Claude API client implementation (backend-dev)
- Task #2: Frontend UI and state management (frontend-dev)

**Required:**
- Development server running on localhost:3000
- Valid API key for Anthropic Claude API
- Write permissions for cost-tracking.json

**Optional:**
- Redux DevTools for debugging
- Browser for manual verification
- Postman/Insomnia for API testing

---

## Execution Timeline

**Estimated Duration:** 2-3 hours

1. **Setup (15 minutes)**
   - Verify dependencies complete
   - Check environment configuration
   - Review implementation changes

2. **Scenario Testing (90 minutes)**
   - Execute all 5 scenarios
   - Collect metrics
   - Document findings

3. **Performance Analysis (30 minutes)**
   - Parse cost-tracking.json
   - Calculate benchmarks
   - Compare against targets

4. **Reporting (45 minutes)**
   - Write test report
   - Document issues
   - Create recommendations

5. **Review (15 minutes)**
   - Final verification
   - Report submission
   - Task closure

---

## Contact

**Tester:** qa-tester
**Task ID:** #3
**Priority:** HIGH
**Blockers:** Tasks #1, #2
**Status:** WAITING FOR DEPENDENCIES

**Questions:** Contact team-lead
