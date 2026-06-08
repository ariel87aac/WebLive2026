# Despliegue aaPanel - Limiteflix

Dominios de produccion:

- Frontend Angular: `https://live.limiteflix.com`
- Backend NestJS + Socket.IO: `https://liveapi.limiteflix.com`
- TURN/STUN Coturn: `liveturn.limiteflix.com`

## DNS

Crear registros `A` apuntando a la IP publica del servidor:

```txt
live.limiteflix.com      A    SERVER_PUBLIC_IP
liveapi.limiteflix.com   A    SERVER_PUBLIC_IP
liveturn.limiteflix.com  A    SERVER_PUBLIC_IP
```

## Puertos

Abrir en firewall del proveedor y en aaPanel:

```txt
80/tcp
443/tcp
3478/tcp
3478/udp
5349/tcp
5349/udp
49152-65535/udp
```

PostgreSQL `5432` debe quedar solo local o privado.

## Backend

Copiar el ejemplo de produccion:

```bash
cd /www/wwwroot/weblive2026/backend
cp .env.production.example .env
```

Editar:

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
FRONTEND_URL=https://live.limiteflix.com
FRONTEND_URLS=https://live.limiteflix.com
HTTPS_ENABLED=false
DATABASE_SYNCHRONIZE=false
JWT_SECRET=CAMBIAR_POR_UN_SECRETO_LARGO
```

Instalar, compilar y migrar:

```bash
npm install
npm run build
npm run migration:run:prod
npm run start:prod
```

En aaPanel usar `Website -> Node.js Project`:

```txt
Project path: /www/wwwroot/weblive2026/backend
Startup file: dist/main.js
Port: 3000
Run user: www
```

## Frontend

Compilar Angular:

```bash
cd /www/wwwroot/weblive2026/frontend
npm install
npm run build
```

La carpeta publica del sitio debe ser:

```txt
/www/wwwroot/weblive2026/frontend/dist/frontend/browser
```

El archivo editable de configuracion runtime queda en:

```txt
/www/wwwroot/weblive2026/frontend/dist/frontend/browser/weblive-config.js
```

Contenido esperado:

```js
window.__WEBLIVE_CONFIG__ = {
  apiBaseUrl: 'https://liveapi.limiteflix.com',
  socketBaseUrl: 'https://liveapi.limiteflix.com',
  turnUrl: 'turns:liveturn.limiteflix.com:5349',
  turnUsername: 'weblive',
  turnCredential: 'CHANGE_ME_TURN_PASSWORD',
};
```

## Nginx aaPanel

Crear dos sitios:

- `live.limiteflix.com`
- `liveapi.limiteflix.com`

Activar SSL en ambos desde aaPanel.

Usar como base:

- `docs/aapanel-live.limiteflix.com.nginx.conf`
- `docs/aapanel-liveapi.limiteflix.com.nginx.conf`

## Coturn

Instalar Coturn:

```bash
sudo apt update
sudo apt install coturn
```

Usar como base:

```txt
docs/liveturn.limiteflix.com.turnserver.conf
```

Reemplazar:

```txt
SERVER_PUBLIC_IP
CHANGE_ME_TURN_PASSWORD
```

Copiar a:

```txt
/etc/turnserver.conf
```

Habilitar Coturn:

```bash
sudo systemctl enable coturn
sudo systemctl restart coturn
sudo systemctl status coturn
```

## Verificacion

API:

```bash
curl https://liveapi.limiteflix.com/health
```

Frontend:

```txt
https://live.limiteflix.com
```

Socket.IO debe conectar desde la consola del navegador sin errores CORS.

WebRTC debe probarse con dos redes diferentes, por ejemplo una computadora en WiFi y un celular con datos moviles. Si en red local funciona pero en datos moviles no, revisar Coturn/firewall.
