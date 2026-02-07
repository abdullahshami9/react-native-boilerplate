$scriptPath = $PSScriptRoot
$projectRoot = Split-Path -Parent $scriptPath
$deploymentDir = Join-Path $projectRoot "deployment"

Write-Host "Destroying AWS Infrastructure..." -ForegroundColor Red
Set-Location $deploymentDir
terraform destroy -auto-approve
Set-Location $projectRoot
Write-Host "Infrastructure Destroyed." -ForegroundColor Green
