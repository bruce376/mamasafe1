# Create PowerShell profile with npm setup
Write-Host "Setting up npm in PowerShell profile..." -ForegroundColor Yellow

# Create profile content
$profileContent = @"
# Node.js and npm setup
`$env:PATH += ';C:\Program Files\nodejs'

# npm aliases for convenience
function npm { & 'C:\Program Files\nodejs\npm.cmd' @args }
Set-Alias -Name npm -Value 'C:\Program Files\nodejs\npm.cmd'

Write-Host "Node.js and npm are now available!" -ForegroundColor Green
"@

# Check if profile exists
$profilePath = $PROFILE
$profileDir = Split-Path $profilePath -Parent

if (!(Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force
}

# Write profile
Set-Content -Path $profilePath -Value $profileContent -Force

Write-Host "PowerShell profile created/updated at:" -ForegroundColor Cyan
Write-Host $profilePath -ForegroundColor Cyan
Write-Host ""
Write-Host "To apply changes:" -ForegroundColor Yellow
Write-Host "1. Close this PowerShell window" -ForegroundColor Yellow
Write-Host "2. Open new PowerShell window" -ForegroundColor Yellow
Write-Host "3. Test with: npm --version" -ForegroundColor Yellow
Write-Host ""
Write-Host "npm should now work permanently!" -ForegroundColor Green
