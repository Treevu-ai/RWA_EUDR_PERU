# ===========================================
# RWA EUDR - Deploy a Azure
# ===========================================
# Ejecutar en PowerShell como Administrador
# ===========================================

param(
    [string]$ApifyToken = "",
    [string]$ResourceGroup = "rwa-eudr-peru",
    [string]$Location = "eastus",
    [string]$AppName = "rwa-eudr",
    [string]$RegistryName = "rwacrperu"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RWA EUDR - Deploy a Azure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Azure CLI
Write-Host "[1/9] Verificando Azure CLI..." -ForegroundColor Yellow
try {
    $version = az version --query '"azure-cli"' 2>$null
    if (-not $version) { throw }
    Write-Host "  ✓ Azure CLI instalado: $version" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Azure CLI no instalado" -ForegroundColor Red
    Write-Host "  Instala con: winget install Microsoft.AzureCLI" -ForegroundColor Yellow
    exit 1
}

# Login
Write-Host "[2/9] Iniciando sesión en Azure..." -ForegroundColor Yellow
$login = az account show 2>$null
if (-not $login) {
    az login
}
$account = az account show | ConvertFrom-Json
Write-Host "  ✓ Logueado como: $($account.user.name)" -ForegroundColor Green

# Crear grupo de recursos
Write-Host "[3/9] Creando grupo de recursos..." -ForegroundColor Yellow
$rg = az group show --name $ResourceGroup 2>$null
if (-not $rg) {
    az group create --name $ResourceGroup --location $Location | Out-Null
    Write-Host "  ✓ Grupo '$ResourceGroup' creado" -ForegroundColor Green
} else {
    Write-Host "  ✓ Grupo '$ResourceGroup' ya existe" -ForegroundColor Green
}

# Crear Container Registry
Write-Host "[4/9] Creando Container Registry..." -ForegroundColor Yellow
$acr = az acr show --name $RegistryName --resource-group $ResourceGroup 2>$null
if (-not $acr) {
    az acr create --resource-group $ResourceGroup --name $RegistryName --sku Basic | Out-Null
    Write-Host "  ✓ Registry '$RegistryName' creado" -ForegroundColor Green
} else {
    Write-Host "  ✓ Registry '$RegistryName' ya existe" -ForegroundColor Green
}

# Login al registry
Write-Host "[5/9] Login al registry..." -ForegroundColor Yellow
az acr login --name $RegistryName | Out-Null
Write-Host "  ✓ Login exitoso" -ForegroundColor Green

# Build Docker
Write-Host "[6/9] Construyendo imagen Docker..." -ForegroundColor Yellow
$projectPath = Split-Path -Parent $PSScriptRoot
$dockerfilePath = Join-Path $projectPath "prototype"
Set-Location $dockerfilePath
docker build -t "${RegistryName}.azurecr.io/${AppName}:latest" . 2>&1 | Select-Object -Last 5
Write-Host "  ✓ Imagen construida" -ForegroundColor Green

# Push imagen
Write-Host "[7/9] Subiendo imagen a Azure..." -ForegroundColor Yellow
docker push "${RegistryName}.azurecr.io/${AppName}:latest" 2>&1 | Select-Object -Last 3
Write-Host "  ✓ Imagen subida" -ForegroundColor Green

# Crear Container Apps Environment
Write-Host "[8/9] Creando ambiente..." -ForegroundColor Yellow
$envName = "${AppName}-env"
$envCheck = az containerapp env show --name $envName --resource-group $ResourceGroup 2>$null
if (-not $envCheck) {
    az containerapp env create --name $envName --resource-group $ResourceGroup --location $Location | Out-Null
    Write-Host "  ✓ Ambiente creado" -ForegroundColor Green
} else {
    Write-Host "  ✓ Ambiente ya existe" -ForegroundColor Green
}

# Obtener credenciales del registry
$acrCreds = az acr credential show --name $RegistryName --resource-group $ResourceGroup | ConvertFrom-Json
$registryUser = $acrCreds.username
$registryPass = $acrCreds.passwords[0].value

# Crear o actualizar Container App
Write-Host "[9/9] Creando Container App..." -ForegroundColor Yellow
$appCheck = az containerapp show --name $AppName --resource-group $ResourceGroup 2>$null

$envVars = "NODE_ENV=production"
if ($ApifyToken) {
    $envVars = "APIFY_TOKEN=$ApifyToken,NODE_ENV=production"
}

if (-not $appCheck) {
    az containerapp create `
        --name $AppName `
        --resource-group $ResourceGroup `
        --environment $envName `
        --image "${RegistryName}.azurecr.io/${AppName}:latest" `
        --target-port 3000 `
        --ingress external `
        --cpu 0.25 `
        --memory 0.5Gi `
        --min-replicas 1 `
        --max-replicas 1 `
        --registry-username $registryUser `
        --registry-password $registryPass `
        --env-vars $envVars `
        | Out-Null
    Write-Host "  ✓ Container App creado" -ForegroundColor Green
} else {
    az containerapp update `
        --name $AppName `
        --resource-group $ResourceGroup `
        --image "${RegistryName}.azurecr.io/${AppName}:latest" `
        --env-vars $envVars `
        | Out-Null
    Write-Host "  ✓ Container App actualizado" -ForegroundColor Green
}

# Obtener URL
Start-Sleep -Seconds 5
$fqdn = az containerapp show --name $AppName --resource-group $ResourceGroup --query "properties.fqdn" -o tsv

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ DEPLOY COMPLETADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL de la aplicación:" -ForegroundColor White
Write-Host "  https://$fqdn" -ForegroundColor Cyan
Write-Host ""
Write-Host "Recursos creados:" -ForegroundColor White
Write-Host "  - Resource Group: $ResourceGroup" -ForegroundColor Gray
Write-Host "  - Container Registry: $RegistryName.azurecr.io" -ForegroundColor Gray
Write-Host "  - Container App: $AppName" -ForegroundColor Gray
Write-Host ""

# Test endpoint
Write-Host "Verificando que la app funcione..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://$fqdn/api/data" -TimeoutSec 30 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ API respondiendo correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ La app puede necesitar 1-2 minutos en iniciar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Credenciales de acceso:" -ForegroundColor White
Write-Host "  admin / admin123" -ForegroundColor Cyan
Write-Host "  operador / operador123" -ForegroundColor Cyan
Write-Host ""