Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "           DrVibe Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "1. Go to https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Download and install the LTS version" -ForegroundColor Yellow
    Write-Host "3. Restart PowerShell" -ForegroundColor Yellow
    Write-Host "4. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check NPM
try {
    $npmVersion = npm --version
    Write-Host "NPM version: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR: NPM is not available!" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create a .env file with your AWS credentials:" -ForegroundColor Yellow
    Write-Host "1. Copy .env.example to .env" -ForegroundColor Yellow
    Write-Host "2. Edit .env with your AWS credentials" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "           Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open your browser to:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

$startNow = Read-Host "Start the server now? (y/n)"
if ($startNow -eq "y" -or $startNow -eq "Y" -or $startNow -eq "yes" -or $startNow -eq "Yes") {
    Write-Host "Starting DrVibe server..." -ForegroundColor Green
    npm start
}
