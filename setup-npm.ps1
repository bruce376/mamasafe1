# Setup Node.js and npm PATH
$nodePath = "C:\Program Files\nodejs"
$env:PATH += ";$nodePath"

# Test if npm is now available
Write-Host "Testing npm availability..."
try {
    $npmVersion = & npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
    Write-Host "npm is now available!" -ForegroundColor Green
} catch {
    Write-Host "npm still not available, using full path..." -ForegroundColor Yellow
}

Write-Host "Node.js path has been added to current session."
Write-Host "You can now use npm commands in this PowerShell session."
Write-Host ""
Write-Host "To make this permanent, run this in an admin PowerShell:"
Write-Host "[Environment]::SetEnvironmentVariable('PATH', [Environment]::GetEnvironmentVariable('PATH', 'Machine') + ';C:\Program Files\nodejs', 'Machine')"
