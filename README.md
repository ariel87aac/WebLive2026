# WebLive2026
Proyecto de transmisión en vivo
inicio de proyecto
2026

## Documentacion

- [Requerimientos del sistema](docs/requerimientos.md)
- [Backlog MVP](docs/backlog-mvp.md)

## Componentes

- [Backend NestJS](backend/README.md)
- [Frontend Angular](frontend/README.md)

## Infraestructura local

Copiar variables de entorno:

```bash
cp .env.example .env
```

Levantar PostgreSQL:

```bash
docker compose up -d postgres
```

Detener servicios:

```bash
docker compose down
```
