# ===========================================
# RWA EUDR - Deploy a Azure
# ===========================================
# INSTRUCCIONES:
# 1. Abre PowerShell como Administrador
# 2. Ve a la carpeta del proyecto:
#    cd C:\Users\acuba\RWA_EUDR\prototype
# 3. Ejecuta el script:
#    .\deploy-azure.ps1 -ApifyToken "TU_TOKEN"
# ===========================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ApifyToken = ""
)

$ErrorActionPreference = "Stop"
$ResourceGroup = "rwa-eudr-peru"
$Location = "eastus"
$AppName = "rwa-eudr"
$RegistryName = "rwacrperu"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RWA EUDR - Deploy a Azure Container Apps" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Verificar Azure CLI
Write-Host "[1/9] Verificando Azure CLI..." -ForegroundColor Yellow
try {
    $null = az version -o none
    Write-Host "  [OK] Azure CLI instalado" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Azure CLI no instalado" -ForegroundColor Red
    Write-Host "  Instala desde: https://aka.ms/installazurecliwindowsx64" -ForegroundColor Yellow
    exit 1
}

# 2. Login
Write-Host "`n[2/9] Login a Azure..." -ForegroundColor Yellow
$null = az account show 2>$null
if ($LASTEXITCODE -ne 0) { az login }
Write-Host "  [OK] Sesión activa" -ForegroundColor Green

# 3. Grupo de recursos
Write-Host "`n[3/9] Creando grupo de recursos..." -ForegroundColor Yellow
$null = az group create -n $ResourceGroup -l $Location --output none 2>$null
Write-Host "  [OK] Grupo: $ResourceGroup" -ForegroundColor Green

# 4. Container Registry
Write-Host "`n[4/9] Creando Container Registry..." -ForegroundColor Yellow
$null = az acr create -n $RegistryName -g $ResourceGroup --sku Basic --output none 2>$null
Write-Host "  [OK] Registry: $RegistryName.azurecr.io" -ForegroundColor Green

# 5. Login registry
Write-Host "`n[5/9] Conectando al registry..." -ForegroundColor Yellow
$null = az acr login -n $RegistryName --output none
Write-Host "  [OK] Conexión exitosa" -ForegroundColor Green

# 6. Build Docker
Write-Host "`n[6/9] Construyendo imagen Docker..." -ForegroundColor Yellow
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir
docker build -t "${RegistryName}.azurecr.io/${AppName}:latest" . 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { 
    Write-Host "  [ERROR] Error en Docker build" -ForegroundColor Red
    exit 1 
}
Write-Host "  [OK] Imagen construida" -ForegroundColor Green

# 7. Push
Write-Host "`n[7/9] Subiendo imagen..." -ForegroundColor Yellow
docker push "${RegistryName}.azurecr.io/${AppName}:latest" 2>&1 | Out-Null
Write-Host "  [OK] Imagen subida" -ForegroundColor Green

# 8. Environment
Write-Host "`n[8/9] Creando ambiente..." -ForegroundColor Yellow
$envName = "$AppName-env"
$null = az containerapp env create -n $envName -g $ResourceGroup -l $Location --output none 2>$null
Write-Host "  [OK] Ambiente creado" -ForegroundColor Green

# 9. Container App
Write-Host "`n[9/9] Desplegando Container App..." -ForegroundColor Yellow
$acrCreds = az acr credential show -n $RegistryName -g $ResourceGroup | ConvertFrom-Json

$envVars = "NODE_ENV=production"
if ($ApifyToken) { $envVars = "APIFY_TOKEN=$ApifyToken,NODE_ENV=production" }

$null = az containerapp create `
    -n $AppName `
    -g $ResourceGroup `
    --environment $envName `
    --image "${RegistryName}.azurecr.io/${AppName}:latest" `
    --target-port 3000 `
    --ingress external `
    --cpu 0.25 --memory 0.5Gi `
    --min-replicas 1 --max-replicas 1 `
    --registry-username $acrCreds.username `
    --registry-password $acrCreds.passwords[0].value `
    --env-vars $envVars `
    --output none 2>$null

Write-Host "  [OK] App desplegada" -ForegroundColor Green

# Resultado
Start-Sleep 3
$fqdn = az containerapp show -n $AppName -g $ResourceGroup --query "properties.fqdn" -o tsv

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  DEPLOY COMPLETADO!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "URL de la app: https://$fqdn`n" -ForegroundColor Cyan

Write-Host "Credenciales de acceso:" -ForegroundColor White
Write-Host "  Usuario: admin" -ForegroundColor Yellow
Write-Host "  Contraseña: admin123`n" -ForegroundColor Yellow

Write-Host "Para ver logs:" -ForegroundColor White
Write-Host "  az containerapp logs show -n $AppName -g $ResourceGroup --follow`n" -ForegroundColor Gray