"""
Instala un trigger de Apps Script en el Google Sheet
para que cuando alguien envie el formulario 2,
se genere automáticamente el Google Doc.
"""
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY"
HOJA  = "Respuestas de formulario 2"

SCRIPT_CODE = '''
// ================================================================
// GENERADOR AUTOMATICO - Formulario 2 (Verificacion de Requisitos)
// Se ejecuta cada vez que alguien envia el formulario 2
// ================================================================

var SS_ID  = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY";
var HOJA   = "Respuestas de formulario 2";
var COL_ENLACE = 31; // columna AF (0-indexed)

function onFormSubmit_F2(e) {
  try {
    var ss     = SpreadsheetApp.openById(SS_ID);
    var hoja   = ss.getSheetByName(HOJA);
    var ult    = hoja.getLastRow();
    var enc    = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    var fila   = hoja.getRange(ult, 1, 1, hoja.getLastColumn()).getValues()[0];

    function safe(key) {
      var i = enc.indexOf(key);
      return i >= 0 ? String(fila[i] || "").trim() : "";
    }

    var cedula   = safe("Cedula del Candidato");
    var nombre   = safe("Nombre Completo del Candidato");
    var programa = safe("Programa / Area del Concurso");
    var perfil   = safe("Perfil del Cargo");
    var concepto = safe("Concepto Final");
    var obs      = safe("Observaciones Generales de la Verificacion");
    var fecha    = safe("Fecha de Verificacion");

    var REQS = [
      "1. Formato de Inscripcion firmado por el aspirante",
      "2. Hoja de Vida UQ (Formato GH-FOR-006)",
      "3. Fotocopia de cedula y libreta militar",
      "4. Fotocopia de matricula o tarjeta profesional",
      "5. Certificados disciplinarios, judiciales o fiscales vigentes",
      "6. Certificado de experiencia docente universitaria (minimo 2 anos / 1024 horas catedra)",
      "7. Titulo de Pregrado requerido por el perfil",
      "8. Titulo de Posgrado requerido por el perfil",
      "9. Experiencia minima en el area del concurso (segun perfil)",
      "10. Tema de disertacion presentado (si aplica)",
      "11. Documentos debidamente foliados (Art. 8 A.C.A. 396)"
    ];
    var OBS_REQS = [
      "Observaciones - Formato de Inscripcion",
      "Observaciones - Hoja de Vida UQ",
      "Observaciones - Cedula / Libreta Militar",
      "Observaciones - Matricula / Tarjeta Profesional",
      "Observaciones - Certificados disciplinarios",
      "Observaciones - Experiencia Docente",
      "Observaciones - Titulo Pregrado",
      "Observaciones - Titulo Posgrado",
      "Observaciones - Experiencia en el Area",
      "Observaciones - Tema de Disertacion",
      "Observaciones - Tema de Disertacion"
    ];

    // Crear el Google Doc
    var titulo = "ETAPA2_" + cedula + "_" + nombre.substring(0, 30);
    var doc    = DocumentApp.create(titulo);
    var body   = doc.getBody();

    // Titulo
    var p = body.appendParagraph("VERIFICACIÓN DE REQUISITOS DEL PERFIL");
    p.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    // Encabezado
    body.appendParagraph("NOMBRE: " + nombre + "    C.C. " + cedula);
    body.appendParagraph("PROGRAMA: " + programa);
    body.appendParagraph("ÁREA O LÍNEA: " + perfil);
    body.appendParagraph("FECHA DE VERIFICACIÓN: " + fecha);
    body.appendParagraph("");

    // Tabla de requisitos
    var tabla = body.appendTable();
    var filaTit = tabla.appendTableRow();
    filaTit.appendTableCell("REQUISITO").setBackgroundColor("#4a86e8");
    filaTit.appendTableCell("OBSERVACIONES").setBackgroundColor("#4a86e8");
    filaTit.appendTableCell("CUMPLE").setBackgroundColor("#4a86e8");

    for (var i = 0; i < REQS.length; i++) {
      var vReq  = safe(REQS[i]);
      var vObs  = safe(OBS_REQS[i]);
      var cumple = (vReq.toUpperCase().indexOf("CUMPLE") >= 0 &&
                    vReq.toUpperCase().indexOf("NO CUMPLE") < 0) ? "SI" : "NO";
      var filaT = tabla.appendTableRow();
      filaT.appendTableCell(REQS[i]);
      filaT.appendTableCell(vObs);
      var celdaCumple = filaT.appendTableCell(cumple);
      if (cumple === "SI") {
        celdaCumple.setBackgroundColor("#b7e1cd");
      } else {
        celdaCumple.setBackgroundColor("#f4cccc");
      }
    }

    body.appendParagraph("");
    body.appendParagraph("CONCEPTO FINAL: " + concepto);
    body.appendParagraph("");
    body.appendParagraph("OBSERVACIONES GENERALES:");
    body.appendParagraph(obs);
    body.appendParagraph("");
    body.appendParagraph("____________________________________          ____________________________________");
    body.appendParagraph("NOMBRE Y FIRMA MIEMBRO COMISIÓN              NOMBRE Y FIRMA FUNCIONARIO ASUNTOS PROFESORALES");
    body.appendParagraph("");
    body.appendParagraph("____________________________________          ____________________________________");
    body.appendParagraph("Vo.Bo. COORDINADOR COMISIÓN                  Vo.Bo. JEFE OFICINA ASUNTOS PROFESORALES");

    doc.saveAndClose();

    var enlace = "https://docs.google.com/document/d/" + doc.getId() + "/edit";
    hoja.getRange(ult, COL_ENLACE + 1).setValue(enlace);

    Logger.log("Documento creado: " + enlace);

  } catch(err) {
    Logger.log("ERROR en onFormSubmit_F2: " + err.toString());
  }
}

function instalarTrigger() {
  // Eliminar triggers anteriores para evitar duplicados
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit_F2") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  // Crear el nuevo trigger
  var ss = SpreadsheetApp.openById(SS_ID);
  ScriptApp.newTrigger("onFormSubmit_F2")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  Logger.log("Trigger instalado correctamente en el Sheet.");
}
'''

def main():
    creds = Credentials.from_authorized_user_file("token.json",
        ["https://www.googleapis.com/auth/drive",
         "https://www.googleapis.com/auth/script.projects"])
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())

    script_service = build("script", "v1", credentials=creds)

    # Crear el proyecto de Apps Script vinculado al Sheet
    project = script_service.projects().create(body={
        "title": "AutoDoc Formulario 2 - Concurso 2026",
        "parentId": SS_ID
    }).execute()

    script_id = project["scriptId"]
    print(f"Proyecto Apps Script creado: {script_id}")

    # Subir el código
    script_service.projects().updateContent(
        scriptId=script_id,
        body={
            "files": [
                {
                    "name": "Code",
                    "type": "SERVER_JS",
                    "source": SCRIPT_CODE
                },
                {
                    "name": "appsscript",
                    "type": "JSON",
                    "source": '{"timeZone":"America/Bogota","dependencies":{},"exceptionLogging":"STACKDRIVER","runtimeVersion":"V8"}'
                }
            ]
        }
    ).execute()

    print("Código subido exitosamente.")
    print()
    print("=" * 60)
    print("PASO FINAL — Instalar el trigger automático:")
    print(f"1. Abre: https://script.google.com/d/{script_id}/edit")
    print("2. Selecciona la función: instalarTrigger")
    print("3. Haz clic en ▶ Ejecutar")
    print("4. Acepta los permisos")
    print("5. ¡Listo! Desde ese momento cada envío del formulario")
    print("   generará automáticamente el documento en Google Drive.")
    print("=" * 60)

if __name__ == "__main__":
    main()
