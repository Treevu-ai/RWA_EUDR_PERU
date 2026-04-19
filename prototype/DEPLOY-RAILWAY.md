# ===========================================
# Deploy a Railway
# ===========================================

## Opción 1: Desde Terminal (más rápido)

### Prerrequisitos
```bash
npm install -g railway
railway login
```

### Deploy
```bash
cd C:\Users\acuba\RWA_EUDR\prototype

# Crear proyecto
railway init

# Añadir plugin MySQL (opcional, usamos archivos locales)

# Deploy
railway up

# Configurar variables
railway variables set APIFY_TOKEN=tu_token
railway variables set PORT=3000
railway variables set NODE_ENV=production

# Ver URL
railway open
```

---

## Opción 2: Desde Web (sin CLI)

1. Ve a **railway.app**
2. Click **"New Project"**
3. Selecciona **"Empty Project"**
4. Click **"Add GitHub Repo"** o **"Deploy from Docker"**
5. Configura variables en **"Variables"** tab:
   - `APIFY_TOKEN` = tu_token
   - `PORT` = 3000
   - `NODE_ENV` = production
6. Click **"Deploy"**

---

## Configuración Railway (railway.json)

Ya está configurado el proyecto. Solo haz deploy.

---

## Verificar

```bash
curl https://tu-proyecto.railway.app/api/data
```

---

## Notas

- Railway usa archivos locales para datos en desarrollo
- Para producción, considera usar MySQL/PostgreSQL
- Los datos se pierden en redeploys (usar base de datos)