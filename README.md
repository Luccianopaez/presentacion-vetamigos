# Presentación — Auditoría de seguridad de VetAmigos

Presentación independiente, hecha con **React + Vite + Tailwind CSS**, que resume
la auditoría de seguridad web de VetAmigos (empresa ficticia, evaluación INACAP
TI3034 — Unidad 3).

Mantiene el mismo estilo visual del informe web (fondo blanco, paleta teal,
tipografía Inter) y muestra el contenido en diapositivas navegables, con las
capturas de pantalla reales de los tres ataques incrustadas.

> Toda la información proviene del informe (`docs_paejea/`). La presentación no
> agrega datos nuevos: solo los condensa en diapositivas.

## Cómo verla en local

```bash
npm install
npm run dev
```

Luego abre la dirección que muestra la consola (por defecto http://localhost:3000).

Para generar la versión lista para publicar:

```bash
npm run build      # genera la carpeta dist/
npm run preview    # previsualiza el build
```

## Navegación

- **Flechas ← →** del teclado (o **barra espaciadora**) para avanzar y retroceder.
- **Inicio / Fin** para ir a la primera o última diapositiva.
- También sirven los botones y los puntos de abajo.

## Contenido de las diapositivas

1. Portada
2. ¿Quiénes son VetAmigos? (sección 01)
3. ¿Por qué esta auditoría? (sección 01)
4. Los tres ataques de prueba (secciones 02–04)
5. Inyección SQL — CVSS 9.8 (sección 02)
6. XSS reflejado — CVSS 6.1 (sección 03)
7. Inyección de comandos — CVSS 10.0 (sección 04)
8. Activos de información (sección 05)
9. Matriz de riesgo (sección 06)
10. Mapa de calor (sección 06)
11. Controles: prevención y mitigación (sección 07)
12. Plan de recuperación (sección 08)
13. Cierre

## Tecnologías

React 19 · Vite · Tailwind CSS v4 · lucide-react
