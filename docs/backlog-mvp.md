# Backlog MVP

Este backlog convierte los requerimientos base en tareas iniciales de desarrollo para arrancar la Fase 1.

## Alcance MVP

- Autenticacion con JWT.
- Creacion y listado de salas.
- Invitaciones por slug o token unico.
- Sala de conferencia con camara, microfono y participantes conectados.
- Signaling WebRTC por Socket.IO.
- Controles basicos de microfono y camara.
- Interfaz responsive para desktop y mobile.

## Backend NestJS

### Base del proyecto

- Crear proyecto NestJS dentro de `backend`.
- Configurar variables de entorno.
- Configurar PostgreSQL.
- Configurar ORM o query builder.
- Configurar validacion global de DTOs.
- Configurar CORS para el frontend.

### Auth

- Crear modulo `auth`.
- Implementar registro.
- Implementar login.
- Hashear contrasenas.
- Emitir JWT.
- Crear guard JWT.
- Crear decoradores de usuario autenticado y roles.

### Users

- Crear modulo `users`.
- Crear entidad o modelo `User`.
- Implementar busqueda por email.
- Implementar creacion de usuario.
- Definir roles: `admin`, `host`, `guest`, `viewer`.

### Rooms

- Crear modulo `rooms`.
- Crear entidad o modelo `Room`.
- Implementar crear sala.
- Implementar listar salas del host.
- Implementar obtener sala por slug.
- Implementar finalizar sala.
- Generar slug unico.

### Participants

- Crear modulo `participants`.
- Registrar participante al entrar.
- Actualizar estado de microfono/camara.
- Marcar desconexion.
- Listar participantes activos por sala.

### WebSocket Signaling

- Crear gateway Socket.IO.
- Implementar `join-room`.
- Implementar `leave-room`.
- Implementar `offer`.
- Implementar `answer`.
- Implementar `ice-candidate`.
- Implementar `toggle-mic`.
- Implementar `toggle-camera`.
- Emitir `participant-connected`.
- Emitir `participant-disconnected`.

## Frontend Angular

### Base del proyecto

- Crear proyecto Angular dentro de `frontend`.
- Configurar rutas principales.
- Configurar layout responsive.
- Configurar cliente HTTP.
- Configurar manejo de ambiente.
- Elegir e instalar Angular Material o PrimeNG.

### Auth

- Crear modulo o feature `auth`.
- Crear pantalla de login.
- Crear pantalla de registro.
- Guardar JWT.
- Crear interceptor de autenticacion.
- Crear guard de rutas privadas.

### Dashboard

- Crear vista de dashboard.
- Listar salas del usuario.
- Crear sala.
- Copiar enlace de invitacion.
- Entrar a sala.

### Conference

- Crear vista de sala.
- Pedir permisos de camara y microfono.
- Renderizar video local.
- Renderizar videos remotos.
- Implementar controles de microfono y camara.
- Conectar con Socket.IO.
- Crear servicio WebRTC para offers, answers e ICE candidates.

### Responsive

- Definir layout desktop con panel lateral de participantes.
- Definir layout mobile con controles inferiores.
- Verificar camara y controles sin solapamientos.

## Base de datos inicial

### `users`

- `id`
- `email`
- `password_hash`
- `display_name`
- `role`
- `created_at`
- `updated_at`

### `rooms`

- `id`
- `title`
- `slug`
- `status`
- `host_id`
- `created_at`
- `updated_at`
- `ended_at`

### `participants`

- `id`
- `room_id`
- `user_id`
- `display_name`
- `socket_id`
- `mic_enabled`
- `camera_enabled`
- `joined_at`
- `left_at`

## Criterios de aceptacion MVP

- Un usuario puede registrarse e iniciar sesion.
- Un host puede crear una sala.
- El sistema genera un enlace unico de invitacion.
- Dos usuarios pueden entrar a la misma sala.
- Los usuarios ven su video local y el video remoto.
- Los cambios de microfono y camara se reflejan en la sala.
- Al desconectarse un participante, los demas reciben el evento.
- La sala es usable en desktop y mobile.
