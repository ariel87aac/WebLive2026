# Despliegue Docker en aaPanel - Limiteflix

Este despliegue usa contenedores para aislar el sistema de otros proyectos del VPS.

Dominios:

- Frontend: `https://live.limiteflix.com`
- Backend/API + Socket.IO: `https://liveapi.limiteflix.com`
- TURN/STUN: `liveturn.limiteflix.com`

## 1. DNS

Crear registros `A` hacia la IP publica del VPS:

```txt
live.limiteflix.com      A    SERVER_PUBLIC_IP
liveapi.limiteflix.com   A    SERVER_PUBLIC_IP
liveturn.limiteflix.com  A    SERVER_PUBLIC_IP
```

## 2. Puertos

Abrir en firewall del proveedor y aaPanel:

```txt
80/tcp
443/tcp
3478/tcp
3478/udp
5349/tcp
5349/udp
49152-65535/udp
```

Los puertos internos del VPS quedan ligados a `127.0.0.1`, no publicos. La API se publica internamente en `3010` para evitar conflictos con otros sistemas Node.js.

## 3. Instalar Docker en aaPanel

Opcion recomendada:

1. Entrar a aaPanel.
2. Ir a `App Store`.
3. Instalar `Docker`.
4. Confirmar por SSH:

```bash
docker --version
docker compose version
```

## 4. Subir el proyecto

Ruta recomendada:

```txt
/www/wwwroot/weblive2026
```

Ejemplo con Git:

```bash
cd /www/wwwroot
git clone TU_REPOSITORIO weblive2026
cd weblive2026
```

## 5. Crear variables de produccion

```bash
cp .env.production.example .env.production
```

Editar:

```bash
nano .env.production
```

Valores minimos:

```env
POSTGRES_DB=weblive2026
POSTGRES_USER=weblive
POSTGRES_PASSWORD=CAMBIAR_PASSWORD_DB

BACKEND_HOST_PORT=3010
FRONTEND_HOST_PORT=8080

NODE_ENV=production
HOST=0.0.0.0
PORT=3000

FRONTEND_URL=https://live.limiteflix.com
FRONTEND_URLS=https://live.limiteflix.com
HTTPS_ENABLED=false

DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=weblive2026
DATABASE_USER=weblive
DATABASE_PASSWORD=CAMBIAR_PASSWORD_DB
DATABASE_SSL=false
DATABASE_SYNCHRONIZE=false

JWT_SECRET=CAMBIAR_POR_UN_SECRETO_LARGO_DE_32_O_MAS_CARACTERES
JWT_EXPIRES_IN=1d

TURN_CERT_DIR=/www/server/panel/vhost/cert/liveturn.limiteflix.com
```

`POSTGRES_PASSWORD` y `DATABASE_PASSWORD` deben ser iguales.

## 6. Configurar frontend runtime

Crear desde la plantilla y editar:

```bash
cp deploy/frontend/weblive-config.example.js deploy/frontend/weblive-config.local.js
nano deploy/frontend/weblive-config.local.js
```

Contenido:

```js
window.__WEBLIVE_CONFIG__ = {
  apiBaseUrl: 'https://liveapi.limiteflix.com',
  socketBaseUrl: 'https://liveapi.limiteflix.com',
  turnUrl: 'turns:liveturn.limiteflix.com:5349',
  turnUsername: 'weblive',
  turnCredential: 'CAMBIAR_PASSWORD_TURN',
};
```

## 7. Configurar Coturn

Crear desde la plantilla y editar:

```bash
cp deploy/coturn/turnserver.example.conf deploy/coturn/turnserver.local.conf
nano deploy/coturn/turnserver.local.conf
```

Cambiar:

```txt
external-ip=SERVER_PUBLIC_IP
user=weblive:CAMBIAR_PASSWORD_TURN
```

El password TURN debe coincidir con `turnCredential` en `deploy/frontend/weblive-config.local.js`.

## 8. Crear certificados SSL en aaPanel

Crear sitios o certificados para:

- `live.limiteflix.com`
- `liveapi.limiteflix.com`
- `liveturn.limiteflix.com`

aaPanel debe dejar los certificados en rutas similares a:

```txt
/www/server/panel/vhost/cert/live.limiteflix.com
/www/server/panel/vhost/cert/liveapi.limiteflix.com
/www/server/panel/vhost/cert/liveturn.limiteflix.com
```

El contenedor Coturn monta el certificado de `liveturn.limiteflix.com`.

## 9. Levantar contenedores

Construir y levantar:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
```

Si se desea probar la sintaxis con el ejemplo antes de crear secretos:

```bash
APP_ENV_FILE=.env.production.example docker compose -f docker-compose.production.yml --env-file .env.production.example config
```

Ver estado:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production ps
```

Ver logs:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production logs -f backend
docker compose -f docker-compose.production.yml --env-file .env.production logs -f coturn
```

La primera ejecucion corre migraciones automaticamente mediante el servicio `migrate`.

## 10. Configurar Nginx aaPanel

Crear dos sitios en aaPanel:

- `live.limiteflix.com`
- `liveapi.limiteflix.com`

Activar SSL en ambos.

Configurar `live.limiteflix.com` usando:

```txt
docs/aapanel-live.limiteflix.com.nginx.conf
```

Ese sitio proxifica al frontend container:

```txt
http://127.0.0.1:8080
```

Configurar `liveapi.limiteflix.com` usando:

```txt
docs/aapanel-liveapi.limiteflix.com.nginx.conf
```

Ese sitio proxifica al backend container:

```txt
http://127.0.0.1:3010
```

En esta configuracion Docker, el contenedor NestJS escucha internamente en `3000`, pero el VPS lo expone en `3010`.

Debe conservar la seccion `/socket.io/` con headers `Upgrade`.

## 11. Verificar

API:

```bash
curl https://liveapi.limiteflix.com/health
```

Frontend:

```txt
https://live.limiteflix.com
```

Contenedores:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production ps
```

Migraciones:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production run --rm backend npm run migration:show:prod
```

## 12. Actualizar una nueva version

```bash
cd /www/wwwroot/weblive2026
git pull
docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
docker image prune -f
```

## 13. Backup de base de datos

Crear backup:

```bash
docker exec -t weblive-postgres pg_dump -U weblive weblive2026 > backup-weblive2026.sql
```

Restaurar backup:

```bash
cat backup-weblive2026.sql | docker exec -i weblive-postgres psql -U weblive -d weblive2026
```

## 14. Apagar o reiniciar

Reiniciar:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production restart
```

Apagar sin borrar datos:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production stop
```

Apagar y borrar contenedores, conservando volumen de PostgreSQL:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production down
```

No usar `docker compose down -v` salvo que se quiera borrar la base de datos.
