#!/bin/bash

# ===========================================
# RWA EUDR - Script de Deploy a Azure
# ===========================================

set -e

RESOURCE_GROUP="rwa-eudr-peru-rg"
LOCATION="eastus"
APP_NAME="rwa-eudr-$(date +%Y%m%d)"
CONTAINER_REGISTRY="rwacr$(date +%Y%m%d)"

echo "=========================================="
echo "Deploy RWA EUDR a Azure"
echo "=========================================="

# 1. Login
echo "[1/7] Verificando login..."
az account show > /dev/null 2>&1 || az login

# 2. Crear recursos
echo "[2/7] Creando grupo de recursos..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

# 3. Crear Container Registry
echo "[3/7] Creando Azure Container Registry..."
az acr create --resource-group $RESOURCE_GROUP --name $CONTAINER_REGISTRY --sku Basic --output none

# 4. Build y push
echo "[4/7] Build y push de imagen Docker..."
az acr login --name $CONTAINER_REGISTRY
docker build -t $CONTAINER_REGISTRY.azurecr.io/rwa-eudr:latest .
docker push $CONTAINER_REGISTRY.azurecr.io/rwa-eudr:latest

# 5. Crear Container Apps Environment
echo "[5/7] Creando Container Apps Environment..."
az containerapp env create --name rwa-eudr-env --resource-group $RESOURCE_GROUP --location $LOCATION --output none

# 6. Crear Container App
echo "[6/7] Creando Container App..."
az containerapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment rwa-eudr-env \
  --image $CONTAINER_REGISTRY.azurecr.io/rwa-eudr:latest \
  --target-port 3000 \
  --ingress external \
  --cpu 0.25 \
  --memory 0.5Gi \
  --min-replicas 1 \
  --max-replicas 1 \
  --registry-username $CONTAINER_REGISTRY \
  --registry-password $(az acr credential show --name $CONTAINER_REGISTRY --query passwords[0].value -o tsv) \
  --env-vars "NODE_ENV=production" \
  --output none

# 7. Obtener URL
echo "[7/7] Obteniendo URL..."
FQDN=$(az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "properties.fqdn" -o tsv)

echo ""
echo "=========================================="
echo "✅ Deploy completado!"
echo "=========================================="
echo "URL: https://$FQDN"
echo ""
echo "Para ver logs:"
echo "az containerapp logs show --name $APP_NAME --resource-group $RESOURCE_GROUP"
