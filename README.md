# Sistema Automatizado - Concurso Público de Méritos 2026

Este repositorio contiene la arquitectura completa y el código fuente para la automatización del proceso de evaluación del Concurso Público de Méritos, utilizando Google Workspace (Forms, Sheets, Docs y Apps Script).

## 🗂️ Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas:

- `01_Plantillas_Originales/`: Contiene los documentos y formatos base (Excel y Word).
- `02_Scripts_y_Codigo/`: Contiene todos los scripts de automatización en Python y el código maestro de Google Apps Script.
- `03_Credenciales_y_Accesos/`: Ubicación de los tokens y credenciales de la API de Google (ignorados por seguridad).
- `04_Documentos_Generados/`: Carpeta de destino para los documentos generados localmente.

## 🚀 Arquitectura en la Nube (Google Apps Script)

El sistema opera de forma 100% automática en la nube mediante un flujo conectado:

1. **Formulario 1 (Registro):** Genera mediante un script en Google Sheets los enlaces únicos y pre-llenados (Cédula, Nombre, Programa, Perfil) para las siguientes etapas.
2. **Formulario 2 (Verificación de Requisitos):** Un trigger automático lee las respuestas e inyecta los datos en una plantilla de Google Docs para generar el acta.
3. **Formulario 3 (Calificación):** Copia una plantilla maestra de Google Sheets, asigna los puntajes exactos del evaluador, y genera una hoja de detalle.
4. **Formulario 4 (Ficha de Ingreso):** Construye programáticamente el documento final en Google Docs calculando remuneraciones y consolidando el puntaje final.

Toda esta lógica está unificada en el archivo `apps_script_completo.js` que se ejecuta directamente desde el Editor de Apps Script vinculado a la hoja de cálculo de respuestas maestras.

## 💻 Herramientas de Desarrollo y Testing (Python)

La carpeta `02_Scripts_y_Codigo` incluye utilidades en Python que facilitan la administración del sistema:
- `generar_documentos.py`: Generador de documentos locales (Excel/Word) usando las plantillas originales.
- `test_completo.py`: Suite de inyección de datos para poblar los 4 formularios con un candidato de prueba.
- Scripts de gestión: `add_radicado.py`, `upload_template.py`, etc.

## ⚙️ Instalación y Configuración del Trigger Automático

Para desplegar el sistema en un nuevo entorno:
1. Abrir la hoja de respuestas maestras en Google Sheets.
2. Ir a **Extensiones > Apps Script**.
3. Pegar el contenido de `apps_script_completo.js`.
4. Ejecutar la función `instalarTodosLosTriggers()` por única vez.
5. Otorgar los permisos de Google solicitados.

A partir de ese momento, el ciclo de generación de documentos funcionará de forma automática en Google Drive tras cada envío de formulario.

---
*Desarrollado para la Oficina de Asuntos Profesorales - Universidad del Quindío.*
