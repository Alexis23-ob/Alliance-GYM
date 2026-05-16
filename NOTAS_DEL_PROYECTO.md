# Notas del Proyecto: Alliance GYM

Este documento contiene las notas técnicas y la guía de mantenimiento para la página web de **Alliance GYM**.

## 1. Arquitectura del Proyecto

El proyecto está construido utilizando tecnologías web estándar (Vanilla Web) para garantizar el mejor rendimiento, máxima compatibilidad y que no requiera instalaciones de servidores complejos para ser visualizado.

- **`index.html`**: Contiene toda la estructura de la página (Nav, Hero, Info, Equipo, Coaches, Calculadora, Galería, Footer).
- **`css/style.css`**: Contiene todo el diseño visual. Se utilizaron variables CSS en la parte superior (`:root`) para controlar los colores globales fácilmente.
- **`js/main.js`**: Contiene la lógica interactiva:
  - Animación del menú de navegación y versión móvil.
  - Filtrado de imágenes de la sección de maquinaria.
  - Simulador de formulario de agendamiento.
  - Lógica matemática de la **Calculadora Nutricional** (fórmula de Mifflin-St Jeor).
  - Integración de la librería Pannellum para el visor 360°.

## 2. Paleta de Colores

Para mantener la identidad visual vibrante e imponente, extraída directamente del **Logo Oficial**:
- **Color Principal (Rojo Alianza):** `#E62B2E`
- **Gris Secundario (Borde de escudo):** `#8B8F94`
- **Fondo General (Gris muy oscuro):** `#121316`
- **Fondo de Tarjetas:** `#0D0E10` / Transparencias
- **Texto Principal:** Blanco Humo (`#f5f5f5`)

*Si deseas modificar estos colores en el futuro, solo debes abrir `css/style.css` y cambiar las variables en la línea 2.*

## 3. ¿Cómo editar el contenido?

Todo el texto que ves en la página está directamente en el archivo `index.html`. Puedes abrirlo con cualquier editor de texto (como el Bloc de Notas, VS Code o Sublime Text) y buscar la frase que deseas cambiar.

### Cambiar Imágenes
Actualmente, las imágenes son extraídas de **Unsplash** (un banco de imágenes de alta calidad). Para usar tus propias fotos:
1. Guarda tus fotos en una nueva carpeta llamada `img` dentro de la carpeta del sitio.
2. Abre `css/style.css`.
3. Busca las clases que terminan en `-img` (ejemplo: `.cardio-img`, `.alex-img`, `.g-1`).
4. Reemplaza la URL actual por la ruta de tu foto: `background-image: url('../img/mi-foto.jpg');`

### Cambiar el Tour 360°
La imagen esférica actual es una demostración. Para cambiarla por una real de tu gimnasio:
1. Abre `js/main.js`.
2. Ve a la línea donde dice `"panorama": "https://upload.wikimedia..."` (cerca de la línea 90).
3. Cambia ese enlace por la URL o ruta local de tu imagen panorámica equirectangular (ejemplo: `"panorama": "img/mi-tour-360.jpg"`).

## 4. Notas sobre la Calculadora Nutricional

- La calculadora utiliza la **ecuación de Mifflin-St Jeor**, recomendada por la ADA (Asociación Americana de Dietética) por ser la más precisa.
- Aplica un multiplicador según el factor de actividad elegido.
- Para objetivos de **Perder Peso**, resta 500 kcal (déficit estándar).
- Para objetivos de **Ganar Masa Muscular**, suma 500 kcal (superávit estándar).
- Distribuye los macronutrientes de forma dinámica según el objetivo.
- **Importante:** Puedes añadir un pequeño texto (disclaimer) en el `index.html` debajo de la calculadora que advierta que *es una estimación algorítmica y no sustituye la consulta médica*.

## 5. Despliegue (Cómo subirla a internet)

Dado que no usa bases de datos ni Node.js, subir esta página es sumamente económico y rápido. Puedes alojarla gratuitamente en:
- **GitHub Pages**
- **Vercel**
- **Netlify**

O subir los archivos (`index.html`, carpeta `css`, carpeta `js`) directamente por FTP al administrador de archivos de tu proveedor de dominio y hosting tradicional (Hostinger, GoDaddy, etc.).
