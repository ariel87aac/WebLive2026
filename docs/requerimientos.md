# Documento de Requerimientos del Sistema

# Proyecto

## Plataforma de Videoconferencias y Transmisiones en Vivo

## 1. Introduccion

### 1.1 Nombre del proyecto

LIVE STREAM CONFERENCE PLATFORM

### 1.2 Descripcion general

El presente proyecto consiste en el desarrollo de una plataforma web de videoconferencias y transmisiones en vivo similar a StreamYard, utilizando tecnologias modernas como Angular, NestJS, PostgreSQL y WebRTC.

La plataforma permitira crear salas virtuales para reuniones o transmisiones en vivo, incorporar participantes mediante enlaces de invitacion, administrar audio y video en tiempo real, compartir pantalla, mostrar textos en pantalla y grabar las sesiones.

El sistema sera multiplataforma y responsive, permitiendo su uso desde computadoras y dispositivos moviles.

## 2. Objetivos

### 2.1 Objetivo general

Desarrollar una plataforma web de videoconferencias y streaming en vivo utilizando WebRTC para la transmision de audio y video en tiempo real.

### 2.2 Objetivos especificos

- Implementar videollamadas en tiempo real mediante WebRTC.
- Permitir la creacion y administracion de salas virtuales.
- Generar enlaces unicos de invitacion.
- Permitir control de audio y video de los participantes.
- Implementar grabacion de sesiones.
- Crear una interfaz responsive para moviles y computadoras.
- Implementar superposicion de textos y banners.
- Permitir compartir pantalla.
- Gestionar participantes conectados en tiempo real.

## 3. Tecnologias del proyecto

### Frontend

- Angular 21
- TypeScript
- Angular Material / PrimeNG
- RxJS
- SCSS

### Backend

- NestJS
- TypeScript
- WebSocket Gateway
- Socket.IO
- JWT Authentication

### Base de datos

- PostgreSQL

### Comunicacion en tiempo real

- WebRTC
- STUN/TURN Servers

### Infraestructura

- Docker
- Docker Compose
- NGINX
- Ubuntu Server

## 4. Arquitectura general

### Frontend Angular

- Interfaz grafica
- Gestion de camaras y microfonos
- Renderizado de participantes
- Gestion WebRTC

### Backend NestJS

- API REST
- WebSocket Signaling Server
- Autenticacion
- Gestion de salas
- Gestion de usuarios

### PostgreSQL

- Persistencia de usuarios
- Salas
- Historial
- Grabaciones
- Configuraciones

### WebRTC

- Comunicacion P2P de audio/video

## 5. Modulos del sistema

### 5.1 Modulo de autenticacion

#### Funcionalidades

- Registro de usuarios
- Inicio de sesion
- Recuperacion de contrasena
- JWT Authentication
- Roles y permisos

#### Roles

Administrador:
- Gestiona el sistema completo.

Host:
- Crea y administra transmisiones.

Invitado:
- Participa en salas.

Espectador:
- Solo visualiza transmisiones.

### 5.2 Modulo de salas

#### Funcionalidades

- Crear sala
- Editar sala
- Finalizar sala
- Sala privada o publica
- Generar URL de invitacion
- Control de acceso

#### Campos de sala

| Campo | Tipo |
| --- | --- |
| id | UUID |
| title | VARCHAR |
| slug | VARCHAR |
| status | VARCHAR |
| host_id | INTEGER |
| created_at | TIMESTAMP |

### 5.3 Modulo WebRTC

#### Funcionalidades

- Captura de camara
- Captura de microfono
- Transmision en tiempo real
- Compartir pantalla
- Reconexion automatica
- Gestion ICE Candidates
- Gestion SDP Offer/Answer

#### Eventos WebSocket

- `join-room`
- `leave-room`
- `offer`
- `answer`
- `ice-candidate`
- `toggle-mic`
- `toggle-camera`
- `share-screen`
- `stop-share-screen`
- `participant-connected`
- `participant-disconnected`

### 5.4 Modulo de participantes

#### Funcionalidades

- Mostrar participantes conectados
- Silenciar participante
- Expulsar participante
- Levantar mano
- Mostrar estado de microfono
- Mostrar estado de camara

### 5.5 Modulo de streaming

#### Funcionalidades

- Transmision en vivo
- Vista principal del host
- Vista de invitados
- Vista de espectadores
- Diseno dinamico de pantalla

#### Layouts

- Pantalla completa
- Grid automatico
- Host principal
- Compartir pantalla principal

### 5.6 Modulo de texto en pantalla

#### Funcionalidades

- Mostrar banners
- Mostrar titulos
- Mostrar subtitulos
- Mostrar nombre del participante
- Overlay dinamico

#### Tipos de overlay

- Lower Third
- Banner horizontal
- Texto flotante
- Logo

### 5.7 Modulo de grabacion

#### Funcionalidades

- Iniciar grabacion
- Detener grabacion
- Guardar video localmente
- Descargar grabacion

#### Tecnologia

- MediaRecorder API

#### Formatos

- WebM
- MP4, posteriormente mediante FFmpeg

### 5.8 Modulo de chat

#### Funcionalidades

- Chat en tiempo real
- Mensajes publicos
- Emojis
- Notificaciones

## 6. Requerimientos funcionales

| Codigo | Requerimiento |
| --- | --- |
| RF-01 | El sistema debe permitir iniciar sesion |
| RF-02 | El sistema debe permitir crear salas |
| RF-03 | El sistema debe generar enlaces unicos |
| RF-04 | El sistema debe permitir activar/desactivar microfono |
| RF-05 | El sistema debe permitir activar/desactivar camara |
| RF-06 | El sistema debe permitir compartir pantalla |
| RF-07 | El sistema debe mostrar participantes conectados |
| RF-08 | El sistema debe permitir grabar la transmision |
| RF-09 | El sistema debe permitir descargar la grabacion |
| RF-10 | El sistema debe permitir mostrar textos en pantalla |
| RF-11 | El sistema debe ser responsive |
| RF-12 | El sistema debe permitir chat en tiempo real |

## 7. Requerimientos no funcionales

| Codigo | Requerimiento |
| --- | --- |
| RNF-01 | El sistema debe soportar multiples navegadores |
| RNF-02 | El sistema debe ser responsive |
| RNF-03 | El sistema debe utilizar HTTPS |
| RNF-04 | El sistema debe manejar reconexiones |
| RNF-05 | El sistema debe soportar dispositivos moviles |
| RNF-06 | El sistema debe utilizar JWT |
| RNF-07 | El sistema debe mantener baja latencia |

## 8. Diseno responsive

### Compatibilidad desktop

- Chrome
- Firefox
- Edge

### Compatibilidad mobile

- Android
- iOS

## 9. Base de datos

### Tablas principales

- `users`
- `rooms`
- `participants`
- `recordings`
- `room_messages`
- `overlays`
- `room_events`

## 10. Seguridad

### Implementaciones

- JWT Authentication
- Password Hashing
- HTTPS
- Roles y permisos
- Validacion de acceso a salas

## 11. Infraestructura

### Servicios

- Frontend Angular
- Backend NestJS
- PostgreSQL
- NGINX
- TURN/STUN Server

## 12. Servidor TURN/STUN

### Objetivo

Permitir conexiones WebRTC detras de NAT y firewalls.

### Recomendacion

- Coturn Server

## 13. Fases del desarrollo

### Fase 1 - MVP

- Login
- Crear salas
- WebRTC basico
- Audio/video
- Invitaciones
- Microfono
- Camara
- Responsive

### Fase 2

- Compartir pantalla
- Chat
- Grabacion
- Overlays

### Fase 3

- Streaming avanzado
- RTMP
- Integracion YouTube/Facebook
- Moderacion avanzada

## 14. Estructura inicial del backend

### Modulos NestJS

- `auth`
- `users`
- `rooms`
- `participants`
- `websocket`
- `recordings`
- `overlays`
- `chat`

## 15. Estructura inicial del frontend

### Modulos Angular

- `auth`
- `dashboard`
- `rooms`
- `conference`
- `chat`
- `overlays`
- `recording`
- `shared`

## 16. Conclusion

La plataforma permitira desarrollar un sistema moderno de videoconferencias y transmisiones en vivo utilizando WebRTC, proporcionando comunicacion en tiempo real, grabacion de sesiones, overlays dinamicos y acceso multiplataforma.

El sistema sera escalable y preparado para futuras integraciones de streaming profesional.
