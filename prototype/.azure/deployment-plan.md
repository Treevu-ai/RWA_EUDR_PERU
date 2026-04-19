# Deployment Plan - RWA EUDR

## Status: Planning

## 1. Project Overview
- **Project Name**: RWA EUDR - Trazabilidad Agroexportadora
- **Type**: MODIFY (existing Node.js/Express app)
- **Core Functionality**: Dashboard de trazabilidad para exportaciones agroexportadoras peruanas con compliance EUDR

## 2. Architecture

### Stack
- **Frontend**: HTML/JS (Static)
- **Backend**: Node.js + Express
- **Database**: JSON file-based (local storage)
- **Deployment Target**: Azure Container Apps

### Components
- Servidor API REST con Express
- Frontend estático (dist/index.html)
- Integración APIs Apify (mock/fallback)
- Blockchain local para evidencia

## 3. Azure Services
- **Compute**: Azure Container Apps
- **Registry**: Azure Container Registry (ACR)
- **Other**: -

## 4. Recipe
- **Type**: AZD (Azure Developer CLI)
- **Template**: container-apps

## 5. Deployment Steps
1. Crear azure.yaml para Container Apps
2. Crear Dockerfile para la aplicación
3. Generar archivos de infraestructura Bicep
4. Configurar container registry
5. Deploy a Azure Container Apps

## 6. Requirements
- Node.js 18+
- Puerto 3000
- Archivos estáticos en /dist

## 7. Validation Proof
(Section populated by azure-validate)