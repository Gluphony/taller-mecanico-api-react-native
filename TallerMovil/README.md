# Taller Mecánico — React Native

Interfaz React Native con Expo, conectada a la API ASP.NET Core y SQL Server.

## Navegador

1. Inicia la API según las instrucciones del README de la raíz.
2. Desde esta carpeta, ejecuta `npm ci` para instalar las versiones registradas en `package-lock.json`.
3. Ejecuta `npm run web` y abre la URL local que muestra Expo.

La app web llama por defecto a `http://localhost:5250`.

## Android

Ejecuta `npm run android` con un emulador abierto. El emulador usa por defecto `http://10.0.2.2:5250`. En un teléfono físico configura `EXPO_PUBLIC_API_URL` con la IP local del equipo y haz que la API escuche en `0.0.0.0:5250`; ambos dispositivos deben estar en la misma red.

El token se conserva con SecureStore en Android/iOS y en almacenamiento local del navegador. La imagen decorativa de portada viene de Unsplash; el resto de la interfaz se muestra aunque esa imagen no cargue.

## Funciones

- Creación inicial del administrador e inicio de sesión.
- Alta, consulta, búsqueda, edición y eliminación de clientes.
- Alta, consulta, búsqueda, edición, asociación y eliminación segura de vehículos.
- Alta, consulta, edición y eliminación de servicios de mantenimiento.
- Historial por vehículo y filtros de búsqueda.

Las eliminaciones de clientes con vehículos y de vehículos con historial se rechazan para preservar las relaciones y los registros. Los errores de la API aparecen en el formulario activo para que puedas corregirlos sin perder el contexto.
