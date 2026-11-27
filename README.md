# ¡Pásele! — App georreferenciada para administrar tianguis

Aplicación web para saber **dónde se pone cada puesto del tianguis, quién lo atiende y si está en regla**.
Cada puesto se registra con un clic en el mapa; las zonas del tianguis se dibujan como polígonos, y el
sistema calcula si el puesto está **en regla**, con **permiso vencido** o **fuera de zona**.

## Usuario de prueba

| Correo | Contraseña |
|---|---|
| `demo@pasele.mx` | `Pasele2026` |

Lo crea el script `npm run seed` junto con datos de ejemplo en los tres estados.

## Funciones

- Registro e inicio de sesión (contraseñas cifradas con bcrypt, sesión con JWT). Las vistas internas exigen sesión.
- **Mapa**: clic en el mapa para registrar un puesto; editarlo y eliminarlo desde su popup.
- **Tabla** de puestos sincronizada con el mapa, sin recargar la página.
- **Búsqueda y filtros** resueltos en el backend: nombre (parcial, sin mayúsculas), giro y zona (`$geoWithin`).
- **Zonas**: dibujar polígonos con Leaflet-Geoman, ponerles nombre y días, y eliminarlas. No se permiten polígonos que se crucen a sí mismos.
- **Padrón**: CRUD de permisos, comerciantes y giros.
- **Estado del puesto** calculado en el servidor (no se guarda):
  1. `fuera_de_zona`: el punto no cae en ninguna zona.
  2. `permiso_vencido`: está en una zona, pero sin permiso vigente.
  3. `en_regla`: está en una zona y tiene permiso vigente.

## Stack

| Parte | Tecnología |
|---|---|
| Frontend (`client/`) | React + Vite, React Router, Leaflet + react-leaflet, Leaflet-Geoman, fondo de mapa Mapbox (`light-v11`) |
| Backend (`server/`) | Node.js + Express 5, Mongoose, bcrypt, jsonwebtoken |
| Base de datos | MongoDB Atlas (GeoJSON con índices `2dsphere`) |
| Despliegue | Vercel (frontend), Render (backend), Atlas (datos) |

## Estructura

```
client/
  public/fonts/        letra "Pasele Aplastada" (derivada de Arimo, licencia OFL incluida)
  src/
    api/               apiFetch: llamadas al backend con el token
    components/        mapa, tabla, filtros, padrón y componentes base (ui/)
    context/           sesión (AuthContext) y avisos (NoticeContext)
    pages/             Acceso, Mapa, Padrón
    styles/            sistema visual (tokens --p-*)
server/
  src/
    config/            variables de entorno y conexión a MongoDB
    models/            esquemas de Mongoose
    routes/            reciben la petición y llaman al servicio
    services/          lógica y operaciones con MongoDB (uno por entidad)
    middlewares/       autenticación, validación, 404 y manejo de errores
    utils/             AppError, validación y geometría
    seed.js            datos de prueba
  requests.http        ejemplos de cada endpoint (extensión REST Client de VS Code)
```

### Modelos y relaciones

| Modelo | Campos | Relaciones |
|---|---|---|
| User | nombre, email (único), password (hash bcrypt) | — |
| Category (giro) | nombre (único), color, icono | — |
| Vendor (comerciante) | nombre, apodo, telefono | — |
| Location (puesto) | nombre, descripcion, ubicacion (GeoJSON Point) | category → Category, vendor → Vendor (opcional), createdBy → User |
| Zone (tianguis) | nombre (único), dias, area (GeoJSON Polygon) | — |
| Permit (permiso) | folio (único), vigenteHasta, cuota | location → Location |

Las referencias son `ObjectId` y se devuelven con `populate` (la tabla muestra nombres, no ids).
No se puede borrar un giro o comerciante que use algún puesto; al borrar un puesto se borran sus permisos.
GeoJSON siempre en orden `[longitud, latitud]`.

## Ejecutar en local

Requisitos: Node.js 20 o más y una base de MongoDB (Atlas gratis o local).

```bash
git clone https://github.com/jaaviermt/pasele.git
cd pasele
```

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # y llena los valores (ver tabla)
npm run seed              # datos de prueba (solo si la base está vacía)
npm run dev               # http://localhost:3000/api/health
```

| Variable (`server/.env`) | Ejemplo | Para qué |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `MONGODB_URI` | `mongodb+srv://USUARIO:CONTRASENA@CLUSTER.mongodb.net/pasele` | Conexión a MongoDB |
| `JWT_SECRET` | cadena larga y aleatoria | Firma de los tokens |
| `JWT_EXPIRES_IN` | `8h` | Duración de la sesión |
| `CLIENT_ORIGINS` | `http://localhost:5173` | Orígenes permitidos por CORS, separados por comas |

Para generar un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`npm run seed -- --reset` **borra todas las colecciones de la app** y vuelve a cargar los datos de prueba.

### 2. Frontend

En otra terminal:

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL y VITE_MAPBOX_TOKEN
npm run dev               # http://localhost:5173
```

| Variable (`client/.env`) | Ejemplo | Para qué |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Dirección de la API |
| `VITE_MAPBOX_TOKEN` | `pk.…` | Token público de Mapbox para el fondo del mapa. Sin él se usa OpenStreetMap |

El token se crea en [mapbox.com](https://account.mapbox.com/access-tokens/). Como queda visible en el navegador,
restríngelo a tus URLs (`http://localhost:5173` y el dominio de Vercel).

Abre http://localhost:5173 (no `127.0.0.1`, porque CORS solo acepta los orígenes de `CLIENT_ORIGINS`).

## Despliegue

### 1. MongoDB Atlas (datos)

1. Crea un cluster gratuito (M0).
2. **Database Access** → crea un usuario de base de datos con contraseña.
3. **Network Access** → agrega `0.0.0.0/0` (Render no tiene IP fija).
4. **Connect → Drivers** → copia la cadena de conexión, pon la contraseña y agrega `/pasele` antes del `?`.
5. Carga los datos de prueba desde tu computadora, con esa cadena en `server/.env`:
   ```bash
   cd server && npm run seed
   ```

### 2. Render (backend)

1. **New → Web Service** → conecta el repositorio.
2. Configuración:

   | Campo | Valor |
   |---|---|
   | Root Directory | `server` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Health Check Path | `/api/health` |

3. **Environment** → agrega `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=8h` y
   `CLIENT_ORIGINS` con la URL de Vercel (paso 3), sin `/` al final. Render pone `PORT` solo.
4. Despliega y prueba `https://TU-SERVICIO.onrender.com/api/health`.

> En el plan gratuito, Render apaga el servidor tras 15 minutos sin uso. La **primera petición puede tardar
> cerca de un minuto** mientras despierta; después responde normal. Antes de la revisión, abre la liga de
> `/api/health` para despertarlo.

### 3. Vercel (frontend)

1. **Add New → Project** → importa el repositorio.
2. Configuración:

   | Campo | Valor |
   |---|---|
   | Root Directory | `client` |
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. **Environment Variables** → `VITE_API_URL=https://TU-SERVICIO.onrender.com/api` y `VITE_MAPBOX_TOKEN=pk.…`.
   Vite las lee al compilar: si cambias alguna, vuelve a desplegar. Agrega el dominio de Vercel a las URLs
   permitidas del token en Mapbox.
4. Despliega. `client/vercel.json` redirige todas las rutas a `index.html`, así `/padron` funciona al recargar.
5. Copia la URL de Vercel a `CLIENT_ORIGINS` en Render (paso 2.3) y redespliega el backend.

### Problemas comunes

| Síntoma | Causa probable |
|---|---|
| "No se pudo conectar con el servidor" | El backend está dormido (espera un minuto) o `VITE_API_URL` está mal |
| Error de CORS en la consola | La URL de Vercel no está en `CLIENT_ORIGINS` o lleva `/` al final |
| El backend no arranca: "Falta la variable…" | Falta `MONGODB_URI` o `JWT_SECRET` en Render |
| Error de conexión a MongoDB | `0.0.0.0/0` no está en Network Access de Atlas o la contraseña es incorrecta |
| 404 al recargar `/padron` en Vercel | Falta `client/vercel.json` |
| El mapa sale gris o con el fondo de OpenStreetMap | Falta `VITE_MAPBOX_TOKEN` o el token no permite esa URL |

## API

Base: `/api`. Todo, excepto `health` y `auth/register`/`auth/login`, requiere `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor |
| POST | `/auth/register` · `/auth/login` | Crear cuenta · iniciar sesión (devuelven token) |
| GET | `/auth/me` | Usuario de la sesión |
| GET/POST | `/locations` | Listar (`?search=&category=&zone=`) · crear puesto |
| GET/PATCH/DELETE | `/locations/:id` | Detalle · editar · borrar (y sus permisos) |
| GET/POST | `/zones` | Listar · crear zona |
| DELETE | `/zones/:id` | Borrar zona |
| GET/POST, GET/PATCH/DELETE `/:id` | `/categories`, `/vendors`, `/permits` | CRUD del padrón |

Respuestas: listas `{ count, data }`, detalle `{ data }`, cambios `{ message, data }`,
errores `{ error: { status, message, details } }` con códigos 200, 201, 400, 401, 404 y 500.

## Créditos

- Mapas: © [Mapbox](https://www.mapbox.com/about/maps/) © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright).
- Letra "Pasele Aplastada": derivada de [Arimo](https://github.com/googlefonts/arimo) (SIL Open Font License 1.1, ver `client/public/fonts/OFL-PaseleAplastada.txt`).
- Archivo y Sancreek: Google Fonts (SIL Open Font License).
