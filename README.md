# 🎓 Sistema de Gestión – Concurso Público de Méritos Docentes 2026
### Universidad del Quindío | Oficina de Asuntos Profesorales

---

## 📌 ¿Qué hace este sistema?

Este sistema automatiza **todo el proceso de inscripción, verificación, calificación y generación de documentos** del Concurso Público de Méritos para docentes de la Universidad del Quindío.

**Lo que hace automáticamente:**
- Registra a los aspirantes desde una hoja de vida física.
- Genera enlaces pre-llenados para que los evaluadores no tengan que volver a escribir los datos básicos.
- Detecta cuando un evaluador llena un formulario y genera el documento oficial de Word/Excel.
- Sube el documento a Google Drive en la carpeta correspondiente al candidato.
- Pega el enlace del documento en el archivo de Google Sheets para acceso inmediato.

---

## 🗂️ Estructura del Proceso (4 Etapas)

```
ETAPA 1: INSCRIPCIÓN
   La secretaria registra la hoja de vida física en el Formulario 1 (Google Forms).
   → El sistema genera automáticamente los enlaces pre-llenados para Etapas 2, 3 y 4.

ETAPA 2: VERIFICACIÓN DE REQUISITOS
   El funcionario usa el enlace de Etapa 2 (ya lleva cédula, nombre y programa pre-escritos).
   → Al correr el programa Python, genera el documento Word oficial de verificación.

ETAPA 3: CALIFICACIÓN HOJA DE VIDA
   El evaluador usa el enlace de Etapa 3.
   → El programa genera el Excel de calificación de la hoja de vida.

ETAPA 4: FICHA DE INGRESO
   El funcionario usa el enlace de Etapa 4.
   → El programa genera el documento Word de Ficha de Ingreso a la Carrera Docente.
```

---

## 🏗️ Arquitectura del Sistema

```
[Formulario 1 - Google Forms]
        │
        ▼ (al enviar, se dispara automáticamente)
[Apps Script en Google Sheets]
        │  Lee la cédula, nombre, programa y perfil del candidato
        │  Genera 3 enlaces pre-llenados para Formularios 2, 3 y 4
        ▼
[Google Sheets - "Respuestas de formulario 1"]
        │  Columnas: Llenar Formulario 2 | Llenar Formulario 3 | Llenar Formulario 4
        │
        ▼ (evaluadores usan esos enlaces)
[Formularios 2, 3 y 4 - Google Forms]
        │  Se guardan en "Respuestas de formulario 2/3/4"
        │
        ▼ (al ejecutar el programa Python)
[generar_documentos.py  ←  Corre en el computador de la oficina]
        │  Lee las respuestas nuevas de los formularios
        │  Abre la plantilla Word/Excel correspondiente (2.docx / 3.xlsx)
        │  Rellena el documento con los datos del candidato
        │  Sube el archivo a Google Drive (carpeta "Documentos_Candidatos")
        ▼
[Google Drive - Carpeta: Documentos_Candidatos / {cedula_nombre}]
        │
        ▼ (enlace pegado automáticamente en Sheets)
[Google Sheets - Columna "Enlace Documento"]
```

---

## 📁 Archivos del Proyecto

| Archivo | ¿Qué hace? |
|---|---|
| `generar_documentos.py` | 🤖 **El motor principal.** Lee Google Sheets, genera los documentos Word/Excel y los sube a Drive. |
| `Generar_Documentos.bat` | 🖱️ **Acceso directo.** Doble clic en este archivo para correr el programa fácilmente. |
| `auto_completado.gs` | ☁️ **El robot en la nube.** Código de Google Apps Script que genera los enlaces pre-llenados automáticamente al registrar un candidato. |
| `2.docx` | 📄 Plantilla oficial del formulario de Verificación de Requisitos (Etapa 2). |
| `3.xlsx` | 📊 Plantilla oficial del formulario de Calificación de Hoja de Vida (Etapa 3). |
| `requirements.txt` | 📦 Lista de librerías Python necesarias para instalar. |
| `credentials.json` | 🔑 **NO incluido en el repositorio (archivo secreto).** Claves de acceso a Google API. Ver sección de configuración. |
| `token.json` | 🔑 **NO incluido en el repositorio (se genera automáticamente).** Token de sesión de Google. |

---

## ⚙️ Configuración Inicial (Primera vez en un computador nuevo)

### Paso 1: Instalar Python y las librerías
```bash
pip install -r requirements.txt
```

### Paso 2: Obtener el archivo de credenciales
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Selecciona el proyecto `Concurso Script`.
3. Ve a **APIs y Servicios > Credenciales**.
4. Descarga el archivo JSON del cliente OAuth.
5. Renómbralo a `credentials.json` y cópialo en la carpeta del proyecto.

### Paso 3: Autenticarse por primera vez
Al correr el programa por primera vez, se abrirá una ventana del navegador pidiendo permiso. Acepta y ya no volverá a pedirlo (el token se guarda en `token.json`).

### Paso 4: Instalar el código en Google Sheets
1. Abre el archivo de Google Sheets del concurso.
2. Ve a **Extensiones > Apps Script**.
3. Pega el contenido del archivo `auto_completado.gs`.
4. Guarda y recarga la hoja.
5. Ve a **Activadores (ícono de reloj) > Añadir activador**:
   - Función: `generarTodosLosEnlaces`
   - Evento: `Al enviarse el formulario`

---

## 🚀 Uso Diario (Operación Normal)

### La secretaria (Etapa 1):
1. Recibe la hoja de vida física del aspirante.
2. Abre el enlace del **Formulario 1**.
3. Ingresa los datos del candidato y hace clic en **Enviar**.
4. ✅ El sistema genera automáticamente los 3 enlaces en la hoja de cálculo.

### El verificador (Etapa 2):
1. Abre la hoja de cálculo y busca al candidato.
2. Hace clic en el enlace de la columna **"Llenar Formulario 2"**.
3. Completa la verificación (los datos básicos ya están pre-llenados).
4. Hace clic en **Enviar**.

### El evaluador (Etapas 3 y 4):
Igual que el verificador, pero usando las columnas **"Llenar Formulario 3"** y **"Llenar Formulario 4"**.

### Generar los documentos oficiales:
Al final del día (o cuando se desee), en el computador de la oficina:
1. Abre la carpeta `Proyecto-Concurso`.
2. Haz **doble clic** en el archivo `Generar_Documentos.bat`.
3. El programa se conectará a Google, procesará todos los formularios nuevos y subirá los documentos a Drive automáticamente.

---

## 📂 Google Drive

Todos los documentos generados se almacenan en:
```
Mi unidad / Documentos_Candidatos / {cedula}_{nombre} /
   ├── {cedula}_{nombre}_ETAPA2_Verificacion      (Google Doc)
   ├── {cedula}_{nombre}_ETAPA3_Calificacion      (Google Sheet)
   └── {cedula}_{nombre}_ETAPA4_FichaIngreso      (Google Doc)
```

---

## 🔒 Seguridad

> ⚠️ **IMPORTANTE:** Los archivos `credentials.json` y `token.json` contienen claves de acceso privadas a Google. **NUNCA** los compartas ni los subas a GitHub. Están protegidos en el `.gitignore`.

---

## 🛠️ Soporte

Este proyecto fue construido para la **Oficina de Asuntos Profesorales** de la Universidad del Quindío.  
Repositorio: [github.com/Josevargas998/Proyecto-Concurso](https://github.com/Josevargas998/Proyecto-Concurso)
