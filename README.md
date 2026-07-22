# Luz Estudio Fotográfico

Sitio estático, responsive y preparado para Netlify. Incluye galería, catálogo de sesiones maternas, formulario de citas, botón de WhatsApp y una administración privada conectada a Supabase.

## Catálogo incluido

Se transcribieron de `MATERNAS.jpg` los cuatro paquetes de sesiones maternas y sus precios: **$99.900**, **$199.900**, **$450.000** y **$ 550.000**. El texto inicial aparece mientras conectas Supabase; desde el panel puedes administrar el catálogo posteriormente.

## Antes de publicar: configura Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Abre **SQL Editor**, pega y ejecuta todo [supabase/schema.sql](supabase/schema.sql).
3. En **Authentication → Users**, crea el correo y contraseña de la persona que administrará el sitio. No hay ninguna contraseña dentro de este código.
4. En **Project Settings → API**, copia la URL del proyecto y la clave `anon` pública.
5. Completa [site/config.js](site/config.js) con ambos valores. Ajusta también `whatsappNumber` en formato internacional sin `+` (por ejemplo, `573001234567`) y el nombre de ciudad. Este archivo sí se publica: la clave `anon` es pública por diseño y queda protegida por las reglas RLS.
6. En **Project Settings → API**, copia la clave `service_role` para el siguiente paso. Esa clave nunca se coloca en `config.js`.

Las políticas instaladas permiten a cualquier visitante leer solo contenidos publicados. Los cambios, imágenes y citas requieren una sesión autenticada. El formulario público pasa por una función de Netlify, por lo cual la clave administrativa de Supabase permanece exclusivamente en el servidor.

## Publicar en Netlify

1. Sube esta carpeta a un repositorio de GitHub, GitLab o Bitbucket. No subas `.env`; `site/config.js` se debe incluir para que el sitio pueda conectarse a Supabase.
2. En Netlify selecciona **Add new site → Import an existing project** y conecta el repositorio.
3. Netlify detectará `netlify.toml`: carpeta de publicación `site` y funciones `netlify/functions`. El comando de construcción puede quedar vacío; alternativamente usa `npm install`.
4. En **Site configuration → Environment variables**, agrega:

   - `SUPABASE_URL`: URL del proyecto Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: clave `service_role` de Supabase.

5. Publica el sitio. Si usas una clave en `site/config.js`, confirma que esté incluida en el repositorio (la `anon` es pública y segura con RLS). Si prefieres no versionarla, cópiala al directorio de publicación durante tu proceso de despliegue.

## Uso del administrador

El acceso está discretamente en el extremo inferior derecho: es un punto casi invisible. Al activarlo, inicia sesión con el usuario creado en Supabase.

Desde el panel puedes subir y eliminar imágenes, organizarlas por categoría, crear o eliminar servicios/productos/paquetes y consultar las solicitudes. Para cargar fotografías, el bucket público `photos` debe existir; el SQL lo crea junto con sus permisos.

## Desarrollo local

Instala dependencias con `npm install` y ejecuta `npm run dev`. Netlify abrirá el sitio y la función de citas localmente. Para que las citas funcionen en local, crea `.env` desde `.env.example` y agrega la URL y clave `service_role` de Supabase.

## Personalización visual

La galería comienza vacía de forma intencional: así no se usan imágenes genéricas ni contenido ajeno. Sube las fotografías reales desde el panel administrativo; el sitio las mostrará automáticamente, en alta calidad y adaptadas a móvil, tablet y computador. Reemplaza el nombre de marca `LUZ` y los textos de presentación en [site/index.html](site/index.html) si tu marca utiliza otro nombre.
"# Maternas_" 
