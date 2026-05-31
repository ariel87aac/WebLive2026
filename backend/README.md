# WebLive2026 Backend

Backend NestJS para la plataforma de videoconferencias y transmisiones en vivo.

## Requisitos

- Node.js 20 o superior
- npm

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` a partir de `.env.example`.

```bash
cp .env.example .env
```

Variables iniciales:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
```

## Comandos

```bash
npm run start:dev
```

Levanta el backend en modo desarrollo.

```bash
npm run build
```

Compila el proyecto.

```bash
npm test
```

Ejecuta pruebas unitarias.

## Endpoint inicial

```http
GET /health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "weblive2026-backend",
  "timestamp": "2026-05-31T00:00:00.000Z"
}
```

## Siguiente paso

El siguiente modulo recomendado es `auth`, con registro, login, hashing de contrasenas y JWT.
