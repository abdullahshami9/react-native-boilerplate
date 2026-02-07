# Check for Terraform
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Host "Terraform not found. Please install Terraform and add it to your PATH." -ForegroundColor Red
    exit 1
}

$scriptPath = $PSScriptRoot
$projectRoot = Split-Path -Parent $scriptPath
$backendDir = Join-Path $projectRoot "backend"
$deploymentDir = Join-Path $projectRoot "deployment"
$keyPath = Join-Path $deploymentDir "private_key.pem"
$zipFile = Join-Path $deploymentDir "backend.zip"

# 1. Provision Infrastructure
Write-Host "Provisioning AWS Infrastructure..." -ForegroundColor Cyan
Set-Location $deploymentDir
terraform init
terraform apply -auto-approve
$publicIp = terraform output -raw public_ip
Set-Location $projectRoot

Write-Host "Server IP: $publicIp" -ForegroundColor Green

# 2. Update Config
$configFile = Join-Path $projectRoot "src/Config.ts"
$configContent = Get-Content $configFile
$newConfig = $configContent -replace "API_URL: '.*'", "API_URL: 'http://$($publicIp):3000'"
Set-Content $configFile $newConfig
Write-Host "Updated src/Config.ts" -ForegroundColor Green

# 3. Zip Backend
Write-Host "Packaging Backend..." -ForegroundColor Cyan
if (Test-Path $zipFile) { Remove-Item $zipFile }
Compress-Archive -Path "$backendDir\*" -DestinationPath $zipFile -Update

# 4. Upload & Deploy
Write-Host "Uploading to Server..." -ForegroundColor Cyan
# Wait a bit for instance to be ready
Start-Sleep -Seconds 30

# Fix key permissions (Windows specific)
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$acl = Get-Acl $keyPath
$acl.SetAccessRuleProtection($true, $false)
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "ReadAndExecute", "Allow")
$acl.AddAccessRule($rule)
Set-Acl $keyPath $acl
Write-Host "Fixed key permissions for $currentUser" -ForegroundColor Gray

# Upload
scp -o StrictHostKeyChecking=no -i $keyPath $zipFile ec2-user@$publicIp:/home/ec2-user/backend.zip

# Execute Remote Commands
Write-Host "Configuring Server..." -ForegroundColor Cyan
$remoteScript = @"
sudo dnf install -y unzip
rm -rf app
mkdir app
unzip backend.zip -d app
cd app
npm install
# Ensure MySQL is ready
sudo systemctl start mariadb
# Secure setup for root (if not already done)
sudo mysql -e "CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY ''; GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost'; FLUSH PRIVILEGES;"
# Start App
pm2 delete all || true
pm2 start server.js --name "api"
pm2 save
pm2 startup
"@

ssh -o StrictHostKeyChecking=no -i $keyPath ec2-user@$publicIp $remoteScript

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "API URL: http://$($publicIp):3000"
Write-Host "Now building APK..." -ForegroundColor Cyan

# 5. Build APK
Set-Location "$projectRoot/android"
./gradlew assembleRelease
Set-Location $projectRoot
Write-Host "APK Built at android/app/build/outputs/apk/release/app-release.apk" -ForegroundColor Green
