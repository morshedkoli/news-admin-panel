$apiKey = "napi_52b987d7ea6342cf4847f7a57b068d448f23c90b1b3c72cc97f54051a5cbbadb"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Write-Host "Testing API endpoints..." -ForegroundColor Yellow

# Test localhost
try {
    Write-Host "`nTesting localhost:3000..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/news" -Headers $headers -Method GET -TimeoutSec 10
    Write-Host "✅ Localhost Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Articles found: $($data.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Localhost Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test network IP
try {
    Write-Host "`nTesting network IP 192.168.110.27:3000..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "http://192.168.110.27:3000/api/v1/news" -Headers $headers -Method GET -TimeoutSec 10
    Write-Host "✅ Network IP Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Articles found: $($data.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Network IP Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test categories endpoint
try {
    Write-Host "`nTesting categories endpoint..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/categories" -Headers $headers -Method GET -TimeoutSec 10
    Write-Host "✅ Categories Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Categories found: $($data.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Categories Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Test Complete!" -ForegroundColor Yellow