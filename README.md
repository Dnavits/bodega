# Bodega Dnavits — tienda en línea

Landing page + tienda + panel de administración para vender gaseosas, agua y
bebidas, construido con Next.js 14 y Supabase.

## 1. Configurar Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor** y pega el contenido de
   `supabase/schema.sql`. Esto crea las tablas y activa Row Level Security
   (nadie puede leer o escribir datos que no le correspondan, ni siquiera
   llamando a la base de datos directamente).
2. Ve a **Project Settings > API** y copia la `Project URL` y la `anon public key`.
3. Copia `.env.example` a `.env.local` y pega esos dos valores.
4. Regístrate en la tienda una vez que esté corriendo (paso 3 abajo), luego
   en el SQL Editor ejecuta:
   ```sql
   update profiles set role = 'admin' where id = 'tu-user-id';
   ```
   Tu `user-id` lo ves en **Authentication > Users**. Así te conviertes en
   administrador y puedes entrar a `/admin`.

## 2. Instalar y correr en tu computador

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## 3. Agregar tus productos, fotos, logo y favicon

Entra a `/admin/productos` con tu cuenta admin y agrega tus gaseosas, agua,
etc. Cada producto acepta hasta 3 fotos (se muestran con puntitos para
pasar de una a otra en la tienda). Para las fotos, lo más simple es subir
las imágenes a un servicio como Supabase Storage, Cloudinary o Imgur, y
pegar aquí la URL.

En `/admin/configuracion` puedes cambiar el logo (aparece en la barra de
navegación) y el favicon (el ícono que aparece en la pestaña del navegador)
de la misma forma, pegando una URL.

También puedes reemplazar las imágenes de referencia del banner y
"Quiénes somos" en `components/Hero.tsx` y `components/QuienesSomos.tsx`
por las tuyas.

> Si ya habías corrido `schema.sql` antes de esta versión, ejecuta
> `supabase/migration_v2.sql` en el SQL Editor para actualizar tu base de
> datos sin perder los productos que ya tengas cargados.

## 4. Conectar el envío de correos (código de verificación y confirmación)

El checkout envía un código de 6 dígitos al correo del cliente antes de dejarlo
pagar (anti-bots), y un correo de confirmación cuando el pedido queda listo.

1. Crea una cuenta gratis en https://resend.com
2. Copia tu API key y pégala como `RESEND_API_KEY` en `.env.local`
3. Mientras no la configures, el código de verificación aparece directamente
   en la pantalla (solo en desarrollo) para que puedas probar todo el flujo
   sin enviar correos de verdad.

## 5. Conectar Wompi (cuando te registres)

1. Crea tu cuenta comercial en https://comercios.wompi.co
2. Copia tu llave pública y privada, y el "Events secret", y pégalas en
   `.env.local` (ver `.env.example`).
3. En `app/checkout/page.tsx` y `app/api/checkout/route.ts` hay comentarios
   marcados `--- Punto de conexion con Wompi ---`: ahí se agrega el widget
   de pago y la firma de integridad. Puedo hacer esa integración contigo en
   cuanto tengas las llaves — es la última pieza que falta.

## 6. Subir a GitHub

```bash
git init
git add .
git commit -m "Tienda Bodega Dnavits"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

Luego puedes desplegarlo gratis en https://vercel.com conectando ese
repositorio (Vercel detecta Next.js automáticamente).

## Seguridad implementada

- **Inyección SQL**: imposible — todas las consultas pasan por el cliente
  de Supabase, que usa parámetros, nunca texto SQL armado a mano.
- **Row Level Security**: cada tabla tiene reglas que la base de datos
  aplica siempre, sin importar por dónde llegue la petición.
- **Panel admin protegido en el servidor** (`middleware.ts`): el rol se
  verifica contra la base de datos en cada visita, no solo en el navegador.
- **Precios verificados en el servidor** (`app/api/checkout/route.ts`): el
  total del pedido se recalcula con los precios reales de la base de datos,
  nunca se confía en lo que mande el navegador.
- **Contraseñas**: gestionadas y hasheadas por Supabase Auth, nunca
  guardadas en texto plano por este código.
- **Datos de tarjetas**: nunca pasan por tu servidor — Wompi los procesa
  directamente en su propio checkout, cumpliendo PCI-DSS por ti.
- **Anti-bots en el checkout**: nadie puede pagar sin verificar un código
  enviado a su correo real, y esa verificación se revisa de nuevo en el
  servidor al crear el pedido (nunca se confía en una bandera del navegador).

## El flujo de compra

1. **Domicilio**: dirección, edificio/apto, barrio y ciudad.
2. **Datos de contacto**: nombre, apellido, teléfono y correo, con código
   de verificación de 6 dígitos enviado por correo.
3. **Resumen**: todos los datos y el total, con botones para volver a
   cambiar el domicilio o continuar al pago.
4. **Pago**: aquí se conecta Wompi cuando tengas tus llaves. Mientras
   tanto, el pedido queda registrado como pendiente y se envía un correo
   de confirmación avisando que llega en 1 a 2 días hábiles.

Recomendado antes de salir a producción: activa HTTPS forzado y cabeceras
de seguridad en Vercel (vienen por defecto), y considera activar
verificación en dos pasos para tu cuenta de administrador en Supabase Auth.
