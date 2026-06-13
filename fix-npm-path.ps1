# Fix npm PATH permanently
Write-Host "Fixing npm PATH permanently..." -ForegroundColor Yellow

# Add Node.js to PATH permanently
$nodePath = "C:\Program Files\nodejs"
$currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')

if ($currentPath -like "*$nodePath*") {
    Write-Host "Node.js is already in PATH." -ForegroundColor Green
} else {
    $newPath = $currentPath + ";$nodePath"
    [Environment]::SetEnvironmentVariable('PATH', $newPath, 'User')
    Write-Host "Node.js added to PATH permanently." -ForegroundColor Green
    Write-Host "Please restart PowerShell to see the changes." -ForegroundColor Yellow
}

# Test npm
Write-Host "Testing npm..." -ForegroundColor Yellow
try {
    $npmVersion = & "C:\Program Files\nodejs\npm.cmd" --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
    Write-Host "npm is working!" -ForegroundColor Green
} catch {
    Write-Host "Error testing npm: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "After restarting PowerShell, you should be able to use:"
Write-Host "npm --version"
Write-Host "npm start"
