# RWA EUDR - Deploy a Azure

## Requisitos
- Azure CLI instalado (`az login`)
- Docker instalado (para Container Apps)

## Opción 1: Azure App Service (Simple)

```bash
# Login
az login

# Crear grupo de recursos
az group create --name rwa-eudr-rg --location eastus

# Crear App Service Plan
az appservice plan create --name rwa-eudr-plan --resource-group rwa-eudr-rg --sku FREE --is-linux

# Crear Web App
az webapp create --name rwa-eudr-app --resource-group rwa-eudr-rg --plan rwa-eudr-plan --startup-command "node server.js"

# Configurar variables de entorno
az webapp config appsettings set --name rwa-eudr-app --resource-group rwa-eudr-rg --settings APIFY_TOKEN=tu_token PORT=3000

# Deploy
cd prototype
az webapp up --name rwa-eudr-app --resource-group rwa-eudr-rg --plan rwa-eudr-plan --sku F1 --location eastus
```

## Opción 2: Azure Container Apps (Recomendado)

```bash
# Login
az login

# Variables
RESOURCE_GROUP="rwa-eudr-rg"
LOCATION="eastus"
CONTAINER_APP_NAME="rwa-eudr"
CONTAINER_REGISTRY="rwacr"

# Crear grupo de recursos
az group create --name $RESOURCE_GROUP --location $LOCATION

# Crear Azure Container Registry
az acr create --resource-group $RESOURCE_GROUP --name $CONTAINER_REGISTRY --sku Basic

# Login al registry
az acr login --name $CONTAINER_REGISTRY

# Build y push imagen
cd prototype
docker build -t $CONTAINER_REGISTRY.azurecr.io/rwa-eudr:latest .
docker push $CONTAINER_REGISTRY.azurecr.io/rwa-eudr:latest

# Crear Container Apps Environment
az containerapp env create --name rwa-eudr-env --resource-group $RESOURCE_GROUP --location $LOCATION

# Crear Container App
az containerapp create --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --environment rwa-eudr-env --image $CONTAINER_REGISTRY.azurecr.io/rwa-eudr:latest --target-port 3000 --ingress external --cpu 0.25 --memory 0.5Gi --min-replicas 1 --max-replicas 1

# Configurar variables de entorno
az containerapp update --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --set-env-vars="APIFY_TOKEN=tu_token" "NODE_ENV=production"

# Obtener URL
az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.fqdn"
```

## Verificar Deploy

```bash
# Ver logs
az containerapp logs show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --follow

# Verificar endpoint
curl https://$CONTAINER_APP_NAME.azurecontainerapps.io/api/data
```

## Limpiar

```bash
az group delete --name $RESOURCE_GROUP --yes --no-wait
```
