# Taller Mecánico — React Native

Aplicación móvil en React Native y Expo, conectada al backend ASP.NET Core y SQL Server ubicado en la carpeta superior.

## Requisitos

- Node.js LTS compatible con el SDK de Expo instalado.
- Para vista web: navegador moderno.
- Para Android nativo: Android Studio o un dispositivo Android.

## Ejecutar en el navegador

1. Inicia el backend siguiendo las instrucciones de la carpeta superior.
2. Desde esta carpeta, instala dependencias si hace falta con npm install.
3. Ejecuta npm run web.
4. Abre la URL local que indique Expo.

La vista web usa por defecto http://localhost:5250 para llamar a la API.

## Ejecutar en Android

Ejecuta npm run android con un emulador abierto. El emulador Android usa por defecto http://10.0.2.2:5250 para acceder al backend que corre en el mismo equipo.

Para usar un teléfono físico, crea un archivo .env a partir de .env.example, sustituye la URL por la IP local de este equipo y permite que el API escuche en la red local. Ejemplo:

- EXPO_PUBLIC_API_URL=http://192.168.1.20:5250
- En PowerShell, inicia el backend con ASPNETCORE_URLS=http://0.0.0.0:5250 y el perfil Development.
- Asegúrate de que el teléfono y el equipo estén en la misma red.

El token se conserva de forma segura en Android e iOS mediante SecureStore. En la vista web, se conserva en el almacenamiento local del navegador.

## Funciones

- Inicio de sesión y creación inicial del administrador.
- Panel con recuentos y actividad reciente.
- Alta, búsqueda y actualización de clientes.
- Registro, consulta, asociación y actualización de vehículos.
- Registro de mantenimientos, detalle e historial por vehículo.

Las solicitudes protegidas usan el token Bearer entregado por la API. Para configurar el primer acceso, ejecuta una sola vez Crear administrador desde la pantalla de acceso.
