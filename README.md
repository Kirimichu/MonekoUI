
# MonekoUI

**MonekoUI** es un kit de interfaz de usuario moderno basado en un diseño minimalista con toques de glassmorphism y fluent design. Diseñado para ser ligero, intuitivo y altamente personalizable. Ideal para crear apps web fluidas, limpias y enfocadas en la experiencia del usuario.

---

## ✨ Características

- 🎨 **Estilo Moneko**: combinación de minimalismo, glass y fluent design.
- 💬 **Prompt dinámico** con soporte para múltiples tipos de input: formularios, color, fechas, rangos, archivos, usuarios, UAC, etc.
- 📦 **Componentes listos para usar**: Toast, InfoBar, Surface, PopupMenu, WebView, etc.
- 🧩 **Composición dinámica** con `DynamicView`: listas, tarjetas, grids y más.
- 🌐 **WebView embebido** con navegación segura.
- ⚙️ **Fácil integración**, sin dependencias externas.

---

## 📦 Instalación

```bash
# Clona este repositorio
git clone https://github.com/tu-usuario/MonekoUI.git
```

O simplemente descarga los archivos `MUI.js` y `MUI.css` y agrégalo a tu proyecto:

```html
<link rel="stylesheet" href="MUI.css">
<script src="MUI.js"></script>
```

---

## 🚀 Uso rápido

```js
// Mostrar un prompt de formulario
new Prompt({
  type: 'Form',
  title: 'Introduce tu nombre',
  msg: 'Este dato será guardado',
  Input: { type: 0xA00, label: 'Nombre', btnLabel: 'Aceptar' },
  handler: {
    submit: (value) => console.log('Nombre:', value)
  }
}).execute();
```

```js
// Mostrar una notificación estilo Dynamic Island
MonekoSurface.show({
  type: 'reminder',
  title: 'Tarea pendiente',
  message: '¡No olvides tu reunión a las 3pm!',
  mode: 'Notify'
});
```

---

## 📚 Componentes

- `Prompt`: UAC, formularios, colores, rangos, fechas, monedas, tarjetas, teléfonos, búsquedas, checkboxes, usuarios, etc.
- `DynamicView`: layouts flexibles (`ListView`, `CardView`, `GridView`, `Flexbox`).
- `WebView`: navegador interno con historial y controles.
- `MonekoSurface`: superficie dinámica estilo Dynamic Island.
- `Toast`, `InfoBar`, `PopupMenu`: alertas, avisos y menús flotantes.

---

## 🎨 Diseño

- 🌙 Modo oscuro por defecto con soporte para modo claro (`body.light`)
- Variables CSS personalizables para colores, fuentes, tamaños y más.
- Animaciones suaves (`fade-in`, `slide-up`, `ripple`, etc).

---

## 📄 Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).

---

## 🙌 Créditos

Desarrollado por **HaruMitzuVT**.  
Inspirado en Material Design, Fluent UI y conceptos propios de experiencia minimalista.

---

## 🧠 Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o haz un pull request para sugerencias, mejoras o nuevos componentes.
