# 🍻 Bodega Dnavits — Plataforma E-commerce & Domicilios Express

Plataforma de comercio electrónico de alto rendimiento para venta y entrega de licores, cervezas, gaseosas y bebidas frías en Medellín y el Valle de Aburrá. Construida sobre **Next.js 16 (App Router)**, **React 18**, **Tailwind CSS**, **Supabase (PostgreSQL)** y pasarela **Mercado Pago (Checkout Pro)**.

Desplegada en producción en [Vercel](https://bodega-borrador.vercel.app/).

---

## 🚀 Arquitectura Tecnológica

* **Framework:** Next.js 16.4.3 con App Router, React Server Components y Server Actions.
* **Base de Datos & Auth:** Supabase (PostgreSQL 15+) con Row Level Security (RLS) y autenticación basada en sesiones JWT.
* **Diseño & UI:** Tailwind CSS v3 con paleta tokenizada *Light Portrait Style* inspirada en el estándar de Shopify (`bg-canvas`, `bg-surface`, `text-ink`, `border-hairline`, `shadow-portrait`). Cero librerías externas de íconos (100% SVG puro in-line optimizado).
* **Pasarela de Pagos:** Mercado Pago SDK v2 (Checkout Pro con webhook HMAC SHA-256 e idempotencia transaccional).
* **Correos Transaccionales:** Resend API (código OTP de 6 dígitos y confirmación de compra).
* **Procesamiento de Archivos:** Hoja de cálculo XLSX para importación masiva y exportación de pedidos.

---

## ✨ Características Principales

### 🛒 Experiencia de Compra (Cliente)
* **Catálogo Dinámico:** Categorías interactivas (Cervezas, Licores, Gaseosas, Aguas, Snacks, etc.), buscador en tiempo real y selector de cantidades.
* **Carrusel de Fotos por Producto:** Hasta 3 imágenes de alta definición con miniaturas y puntitos de paginación (`object-contain`).
* **Doble Modalidad de Checkout:**
  1. **Pedido Directo por WhatsApp:** Envío de orden preformateada al WhatsApp de la bodega con recálculo de precios y descuento de stock en base de datos.
  2. **Pasarela Mercado Pago Checkout Pro:** Tarjetas de crédito, débito, PSE, Efecty y saldo en cuenta de Mercado Pago con confirmación automática.
* **Verificación OTP de 6 Dígitos:** Validación obligatoria de correo electrónico antes del pago para mitigar pedidos fraudulentos y bots.
* **Horarios Dinámicos & WhatsApp Flotante:** Indicador reactivo en tiempo real de *Abierto/Cerrado* según el cronograma operativo configurado.
* **Actualización en Caliente:** Componente `VersionChecker` que detecta nuevas versiones desplegadas en Vercel y ofrece actualización fluida con cuenta regresiva.

### 👑 Panel de Administración (`/admin`)
Protegido por doble barrera criptográfica (sesión JWT + `admin_whitelist`).
* **Métricas Financieras Multitemporales:** Dashboard ejecutivo con recaudo y pedidos desglosados en:
  - *Hoy*
  - *Esta Semana* (lunes a domingo)
  - *Semana Pasada*
  - *Este Mes*
  - *Mes Pasado*
  - *Total Histórico*
* **Gestión de Pedidos (`/admin/pedidos`):**
  - Numeración natural y correlativa (`#1`, `#2`, `#3`...).
  - Actualización reactiva del estado del pedido (*Pendiente*, *Confirmado*, *En Camino*, *Entregado*, *Cancelado*).
  - Eliminación segura con control de integridad referencial.
  - Exportación de pedidos a Excel (`.xlsx`) con desglose de productos y datos de entrega.
* **Gestión de Catálogo (`/admin/productos`):**
  - Creación y edición con hasta 3 imágenes por producto (previsualización y validación de dimensiones recomendadas).
  - Carga Masiva desde Excel: Importa decenas de productos en segundos mediante plantillas `.xlsx`.
  - Desinfección automática contra inyección de fórmulas o etiquetas HTML.
* **Configuración Operativa (`/admin/configuracion`):**
  - Ajuste de teléfonos de contacto y WhatsApp de atención.
  - Costo de domicilio y pedido mínimo de entrega.
  - Interruptor maestro de activación/desactivación de la pasarela de pagos.
  - Gestión de usuarios autorizados en la lista blanca (`admin_whitelist`).
* **Personalización de Marca (`/admin/personalizacion`):**
  - Configuración de Logo y Favicon.
  - Textos de banners, títulos de pestaña y viñetas del hero.
  - Generador de horarios inteligentes automáticos.
  - Vista previa en vivo de metadatos Open Graph para previsualizaciones en WhatsApp y redes sociales.

---

## 🛡️ Suite de Ciberseguridad Enterprise (Blindajes A, B, C, D)

El proyecto cuenta con un blindaje multicapa de nivel bancario (A+ en Mozilla Observatory y cumplimiento estricto de OWASP Top 10):

### 1. Blindaje A: Rate Limiting por IP (Anti-DDoS Capa 7 y Anti-Spam)
Limitador de tasa con ventana deslizante por IP (`lib/rate-limit.ts`) activo en todos los endpoints de procesamiento:
* `/api/checkout`: Máx. 12 pedidos/min.
* `/api/payments/create`: Máx. 12 preferencias/min.
* `/api/verificacion/enviar`: Máx. 5 envíos / 10 min (previene bombardeo de correos y saturación de cuota).
* `/api/verificacion/confirmar`: Máx. 10 intentos / 5 min (anula ataques de fuerza bruta al código OTP).
* `/api/admin/check`: Máx. 30 peticiones/min.
* `/api/pedidos` y `/api/pedidos/[id]`: Máx. 30–60 peticiones/min.
* `/api/payments/webhook`: Máx. 120 peticiones/min.

### 2. Blindaje B: Cabeceras de Seguridad HTTP Globales (Grado A+)
Configuradas en `next.config.js` para la totalidad de rutas del servidor:
* `Strict-Transport-Security`: HSTS obligatorio durante 2 años (`max-age=63072000; includeSubDomains; preload`).
* `X-Frame-Options: DENY`: Inmunidad absoluta contra ataques de Clickjacking.
* `X-Content-Type-Options: nosniff`: Previene ejecución de código malicioso por confusión MIME.
* `Referrer-Policy: strict-origin-when-cross-origin`: Oculta parámetros sensibles en tráfico saliente.
* `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`: Bloquea APIs de hardware invasivas.
* `X-XSS-Protection: 1; mode=block`: Filtro heurístico contra XSS reflejado.

### 3. Blindaje C: Motor de Sanitización Exhaustivo (Anti-XSS e Inyecciones)
Módulo centralizado en `lib/sanitize.ts` que desinfecta las entradas antes de tocar la base de datos:
* `sanitizeText()`: Desinfecta entradas públicas de clientes (`nombre`, `direccion`, `notas`).
* `stripHtml()`: Elimina etiquetas `<...>`, esquemas `javascript:` / `vbscript:` y eventos `on\w+=` en formularios de catálogo, administración e importación de Excel.
* `sanitizeUrl()`: Permite únicamente protocolos seguros (`https://`, `http://` o rutas relativas `/...`), descartando URLs maliciosas.
* `sanitizeEmail()` y `sanitizePhone()`: Normalización estricta por expresiones regulares.
* Cero uso de `dangerouslySetInnerHTML` o `innerHTML` en toda la base de código.

### 4. Blindaje D: Criptografía Segura, Control de Acceso y RLS
* **Timing-Safe Equals:** Comparación de firmas criptográficas HMAC de Mercado Pago y códigos de verificación mediante `crypto.timingSafeEqual` en tiempo constante, neutralizando ataques por análisis de tiempo de respuesta (Timing Attacks).
* **CSPRNG Nativo:** Generación de códigos OTP con `crypto.randomInt` (aleatoriedad criptográfica real, no predecible por motores V8).
* **Protección Anti-Type Juggling:** Coerción estricta de tipos y validación de expresiones regulares (`/^\d{6}$/` y UUIDs) para evitar evasiones por inyección de objetos o arrays.
* **Validación de Identidad de Correo:** Impide que usuarios autenticados soliciten o confirmen códigos para correos ajenos (evita uso del servidor como Open Relay).
* **Autoridad Exclusiva de Precios:** Los precios enviados por el cliente son ignorados; el total a cobrar se recalcula siempre desde la base de datos.
* **Row Level Security (RLS) en Supabase:**
  - `admin_whitelist`: Restringida únicamente a usuarios autenticados.
  - `productos` y `configuracion`: Lectura pública (`SELECT`), pero modificación/creación/borrado bloqueado por RLS a cualquier usuario fuera de la lista blanca de administradores.
  - Rutas de procesamiento (`/api/checkout`, `/api/payments/webhook`) operan con cliente de servicio elevado (`createServiceClient()`), garantizando que la creación de pedidos y descuento de inventario nunca se bloqueen.

---

## ⚙️ Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (basado en `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key # Privada, solo servidor

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-tu-access-token
MP_WEBHOOK_SECRET=tu-webhook-secret-de-mercadopago

# Resend (Correos Transaccionales)
RESEND_API_KEY=re_tu_api_key

# URL Base
NEXT_PUBLIC_APP_URL=https://bodega-borrador.vercel.app
```

---

## 🛠️ Instalación y Desarrollo Local

```bash
# 1. Clonar repositorio
git clone https://github.com/Dnavits/bodega.git
cd bodega

# 2. Instalar dependencias
npm install

# 3. Iniciar entorno de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

Para compilar para producción:
```bash
npm run build
npm run start
```

---

## 📦 Estructura del Proyecto

```text
bodega-store/
├── app/
│   ├── admin/                  # Módulos del Panel Administrativo
│   │   ├── configuracion/      # Ajustes operativos y whitelist
│   │   ├── pedidos/            # Monitor y exportación de pedidos
│   │   ├── personalizacion/    # Horarios, branding y Open Graph
│   │   ├── productos/          # Catálogo e importación Excel
│   │   └── layout.tsx          # Autenticación y bloqueo estricto de admins
│   ├── api/                    # API Routes seguras
│   │   ├── admin/check/        # Verificación de credenciales JWT
│   │   ├── checkout/           # Creación de pedidos WhatsApp y descuento de stock
│   │   ├── payments/           # Mercado Pago (create, webhook HMAC, verify)
│   │   ├── pedidos/            # Endpoints protegidos de gestión de órdenes
│   │   ├── verificacion/       # Generación y confirmación de códigos OTP
│   │   └── version/            # Checkpoint de versión desplegada
│   ├── checkout/               # Pantalla de checkout del cliente
│   ├── login/                  # Autenticación de administradores y clientes
│   ├── pago/[status]/          # Confirmación de pago Mercado Pago
│   ├── layout.tsx              # Layout raíz con fuentes y metadatos
│   └── page.tsx                # Tienda principal y catálogo
├── components/                 # Componentes React reutilizables (SVGs puros)
├── lib/
│   ├── admin-auth.ts           # Validación de roles y whitelist
│   ├── constants.ts            # Categorías y constantes
│   ├── email.ts                # Conector Resend
│   ├── image-utils.ts          # Normalización y optimización de imágenes
│   ├── rate-limit.ts           # Motor de Rate Limiting por IP
│   ├── sanitize.ts             # Motor de sanitización estricto anti-XSS
│   ├── site-config.ts          # Caché y lectura de configuración
│   └── supabase/               # Clientes Supabase (browser, server y service role)
├── supabase/
│   ├── schema.sql              # Estructura de tablas y políticas RLS
│   └── migration_v2.sql        # Migraciones incrementales
└── next.config.js              # Cabeceras HTTP de seguridad Grado A+
```

---

## 📄 Licencia

Desarrollado para **Bodega Dnavits**. Todos los derechos reservados © 2026.
