Write-Host "Checking specific requirements..." -ForegroundColor Cyan

# Function to check command availability
function Check-Command ($cmd) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        Write-Host "$cmd is already installed." -ForegroundColor Green
        return $true
    }
    return $false
}

# Install Terraform
if (-not (Check-Command "terraform")) {
    Write-Host "Installing Terraform via Winget..." -ForegroundColor Yellow
    winget install HashiCorp.Terraform --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Winget failed. Please install Terraform manually: https://developer.hashicorp.com/terraform/downloads" -ForegroundColor Red
    }
}

# Install AWS CLI
if (-not (Check-Command "aws")) {
    Write-Host "Installing AWS CLI via Winget..." -ForegroundColor Yellow
    winget install Amazon.AWSCLI --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Winget failed. Please install AWS CLI manually: https://aws.amazon.com/cli/" -ForegroundColor Red
    }
}

Write-Host "`nIMPORTANT INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. If tools were just installed, please RESTART your terminal/PowerShell."
Write-Host "2. You MUST run 'aws configure' and enter your AWS Access Key ID and Secret Access Key."
Write-Host "3. After configuration, run '.\deployment\deploy.ps1' to start the automatic deployment."
Write-Host "4. If you don't have an AWS account, create one at https://aws.amazon.com/free"
