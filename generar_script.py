import os

# Read logo base64
with open(r'C:\Users\jhvar\.gemini\antigravity-ide\scratch\Proyecto-Concurso\logo_base64.txt', 'r') as f:
    logo_b64 = f.read().strip()

# Read the rest of the file (everything from onFormSubmit_F3 onward)
with open(r'C:\Users\jhvar\.gemini\antigravity-ide\scratch\Proyecto-Concurso\02_Scripts_y_Codigo\apps_script_completo.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where onFormSubmit_F3 starts
marker = '// =====================================================================\n// FORMULARIO 3: HOJA DE CALIFICACION (Sheet)'
idx = content.find(marker)
rest_of_file = content[idx:]  # Everything from F3 onward

# Build the new onFormSubmit_F2
f2_func = '''// =====================================================================
// FORMULARIO 2: VERIFICACION DE REQUISITOS (Doc)
// Logo base64 embebido de la plantilla Word original
// =====================================================================
var LOGO_F2_BASE64 = "''' + logo_b64 + '''";

function onFormSubmit_F2(e) {
  try {
    var d        = getFilaDatos("Respuestas de formulario 2");
    var cedula   = d.safe("Cedula del Candidato");
    var nombre   = d.safe("Nombre Completo del Candidato");
    var prog     = d.safe("Programa / Area del Concurso");
    var perfil   = d.safe("Perfil del Cargo");
    var fecha    = d.safe("Fecha de Verificacion");
    var obsGen   = d.safe("Observaciones Generales de la Verificacion");
    var concepto = d.safe("Concepto Final");

    var fac = prog.indexOf("-") > -1 ? prog.split("-")[0].trim() : prog;
    var prg = prog.indexOf("-") > -1 ? prog.split("-")[1].trim() : prog;

    var colEnlace = d.getColIndex("Enlace Documento");
    if (colEnlace === -1) {
      colEnlace = d.enc.length + 1;
      d.hoja.getRange(1, colEnlace).setValue("Enlace Documento");
    }

    var doc  = DocumentApp.create("ETAPA2_" + cedula + "_" + nombre.substring(0, 30));
    var body = doc.getBody();
    body.setMarginTop(36);
    body.setMarginBottom(36);
    body.setMarginLeft(54);
    body.setMarginRight(54);

    // ── LOGO (imagen extraida del Word original) ─────────────────────
    var logoBytes = Utilities.base64Decode(LOGO_F2_BASE64);
    var logoBlob  = Utilities.newBlob(logoBytes, "image/png", "logo_uq.png");
    var img = body.insertImage(0, logoBlob);
    img.setWidth(490);

    // ── TITULOS ──────────────────────────────────────────────────────
    var pT1 = body.appendParagraph("LISTA DE CHEQUEO CONVOCATORIA");
    pT1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    pT1.editAsText().setFontFamily("Arial").setFontSize(11).setBold(true);

    var pT2 = body.appendParagraph("CONCURSO PUBLICO DE MERITOS DOCENTE DE CARRERA 2026");
    pT2.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    pT2.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);

    body.appendParagraph("");

    // ── DATOS DEL CANDIDATO (NOMBRE y CC en la misma linea) ──────────
    // Usamos tabla sin bordes para poner NOMBRE a la izquierda y CC a la derecha
    var tblHeader = body.appendTable([["NOMBRE:  " + nombre.toUpperCase(), "C.C.  " + cedula]]);
    tblHeader.setBorderWidth(0);
    var hR0C0 = tblHeader.getRow(0).getCell(0);
    var hR0C1 = tblHeader.getRow(0).getCell(1);
    hR0C0.editAsText().setFontFamily("Arial").setFontSize(10);
    hR0C0.editAsText().setBold(0, 6, true); // "NOMBRE:" bold
    hR0C1.editAsText().setFontFamily("Arial").setFontSize(10);
    hR0C1.editAsText().setBold(0, 3, true); // "C.C." bold
    hR0C1.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

    // FACULTAD, PROGRAMA, AREA O LINEA
    function addLinea(etiqueta, valor) {
      var p = body.appendParagraph(etiqueta + String(valor || "").toUpperCase());
      p.editAsText().setFontFamily("Arial").setFontSize(10);
      if (etiqueta.length > 0) {
        p.editAsText().setBold(0, etiqueta.length - 1, true);
      }
      return p;
    }
    addLinea("FACULTAD DE ", fac);
    addLinea("PROGRAMA: ", prg);
    addLinea("AREA O LINEA: ", perfil);

    body.appendParagraph("");

    // ── TABLA DE REQUISITOS ──────────────────────────────────────────
    // Encabezado: sin fondo de color, negrita y centrado (igual al Word)
    var REQS = [
      "1. Formato de Inscripcion firmado por el aspirante",
      "2. Hoja de vida UQ",
      "3. Fotocopia de la cedula y libreta militar",
      "4. Fotocopia de matricula o tarjeta profesional",
      "5. Certificados disciplinarios, judiciales o fiscales vigentes",
      "6. Certificado experiencia en docencia universitaria",
      "7. Titulo de Pregrado requerido por el perfil",
      "8. Titulo de Posgrado requerido por el perfil",
      "9. Experiencia minima en el area del concurso (segun perfil)",
      "10. Tema de disertacion presentado",
      "11. Documentos debidamente foliados"
    ];

    var tabla = body.appendTable();

    // Fila encabezado (sin fondo, negrita, centrado — como en el Word)
    var thdr = tabla.appendTableRow();
    var cH1  = thdr.appendTableCell("REQUISITOS DEL PERFIL");
    var cH2  = thdr.appendTableCell("OBSERVACIONES");
    var cH3  = thdr.appendTableCell("CUMPLE");
    cH1.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
    cH2.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
    cH3.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
    cH1.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    cH2.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    cH3.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    // Anchos de columna proporcionales a la plantilla Word
    // Requisitos: ancho, Observaciones: ancho, Cumple: angosta
    tabla.setColumnWidth(0, 220);
    tabla.setColumnWidth(1, 215);
    tabla.setColumnWidth(2, 57);

    var cumpleTodos = true;

    for (var i = 0; i < REQS.length; i++) {
      var vReq    = d.safe(REQS[i]);
      var obsItem = d.safe("Observaciones - " + (i + 1));
      var cumple  = (vReq.toUpperCase().indexOf("CUMPLE") >= 0 &&
                     vReq.toUpperCase().indexOf("NO CUMPLE") < 0) ? "SI" : "NO";
      if (cumple === "NO") cumpleTodos = false;

      var filaT = tabla.appendTableRow();
      var cReq  = filaT.appendTableCell(REQS[i]);
      var cObs  = filaT.appendTableCell(obsItem || "");
      var cCump = filaT.appendTableCell(cumple);

      cReq.editAsText().setFontFamily("Arial").setFontSize(9);
      cObs.editAsText().setFontFamily("Arial").setFontSize(9);
      cCump.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
      cCump.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);

      // VERDE para CUMPLE, ROJO para NO CUMPLE (comportamiento mantenido)
      cCump.setBackgroundColor(cumple === "SI" ? "#b7e1cd" : "#f4cccc");
    }

    body.appendParagraph("");

    // ── TABLA CUMPLE TODOS (2 filas — como en el Word) ───────────────
    // Fila 0: encabezados SI / NO con fondo gris (#D0CECE)
    // Fila 1: resultado con verde o rojo
    var tabCumple = body.appendTable();
    tabCumple.setColumnWidth(2, 57);

    var rHdr = tabCumple.appendTableRow();
    var rHdrDesc = rHdr.appendTableCell("Cumple con todos los requisitos");
    var rHdrSI   = rHdr.appendTableCell("SI");
    var rHdrNO   = rHdr.appendTableCell("NO");
    rHdrDesc.editAsText().setFontFamily("Arial").setFontSize(10);
    rHdrDesc.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    rHdrSI.setBackgroundColor("#D0CECE");
    rHdrSI.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
    rHdrSI.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    rHdrNO.setBackgroundColor("#D0CECE");
    rHdrNO.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
    rHdrNO.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    var rDat = tabCumple.appendTableRow();
    var rDatDesc = rDat.appendTableCell("Cumple con todos los requisitos");
    var rDatSI   = rDat.appendTableCell(cumpleTodos  ? "X" : "");
    var rDatNO   = rDat.appendTableCell(!cumpleTodos ? "X" : "");
    rDatDesc.editAsText().setFontFamily("Arial").setFontSize(10);
    rDatDesc.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    rDatSI.editAsText().setFontFamily("Arial").setFontSize(12).setBold(true);
    rDatSI.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    rDatNO.editAsText().setFontFamily("Arial").setFontSize(12).setBold(true);
    rDatNO.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    // Colorear el resultado
    rDatSI.setBackgroundColor(cumpleTodos  ? "#b7e1cd" : "#ffffff");
    rDatNO.setBackgroundColor(!cumpleTodos ? "#f4cccc"  : "#ffffff");

    body.appendParagraph("");

    // ── OBSERVACIONES GENERALES ──────────────────────────────────────
    var pObsT = body.appendParagraph("OBSERVACIONES GENERALES:");
    pObsT.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
    var pObs  = body.appendParagraph(obsGen || "");
    pObs.editAsText().setFontFamily("Arial").setFontSize(10);
    body.appendParagraph("");

    // ── TABLA DE FIRMAS (sin fondo azul — igual al Word) ─────────────
    var tabFirmas = body.appendTable();

    // Fila 0: REVISION | VERIFICACION (negrita, sin fondo de color)
    var fhdr = tabFirmas.appendTableRow();
    var fh1  = fhdr.appendTableCell("REVISION");
    var fh2  = fhdr.appendTableCell("VERIFICACION");
    fh1.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
    fh2.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);

    // Fila 1: Nombres y firmas (centrado)
    var fr1 = tabFirmas.appendTableRow();
    var ff1 = fr1.appendTableCell("NOMBRE Y FIRMA MIEMBRO COMISION\\n\\n\\n");
    var ff2 = fr1.appendTableCell("NOMBRE Y FIRMA FUNCIONARIO ASUNTOS PROFESORALES\\n\\n\\n");
    ff1.editAsText().setFontFamily("Arial").setFontSize(9);
    ff2.editAsText().setFontFamily("Arial").setFontSize(9);
    ff1.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    ff2.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    // Fila 2: VoBo (centrado)
    var fr2 = tabFirmas.appendTableRow();
    var fv1 = fr2.appendTableCell("Vo.Bo. COORDINADOR COMISION\\n\\n\\n");
    var fv2 = fr2.appendTableCell("Vo.Bo. JEFE OFICINA ASUNTOS PROFESORALES\\n\\n\\n");
    fv1.editAsText().setFontFamily("Arial").setFontSize(9);
    fv2.editAsText().setFontFamily("Arial").setFontSize(9);
    fv1.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    fv2.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    doc.saveAndClose();
    d.hoja.getRange(d.ult, colEnlace).setValue(
      "https://docs.google.com/document/d/" + doc.getId() + "/edit"
    );

  } catch(err) { Logger.log("Error F2: " + err); }
}

'''

# Build complete file
header = '''// =====================================================================
// VARIABLES GLOBALES
// =====================================================================
var SS_ID = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY";
var TPL_FORM3_ID = "1AsZXFF6IC4Ue5FNeGmfRTVk3-qAvGABxGw-hEgkmscM";

var FORM_IDS = {
  2: "1xoVPJ8jAjrUibp-jH8zIhmdNe6r7Ilx9aPiFQUETSI4",
  3: "1DP9UE2oQJ2vCA3bV7oTnvUMW7xA5xiSiS-F96_8nnm8",
  4: "1A-YFD_8xGqwe-Dh3viMGerN6_Uj2agPRR_X8KuIwJlA"
};

// =====================================================================
// FUNCIONES AUXILIARES
// =====================================================================
function getFilaDatos(hojaName) {
  var ss   = SpreadsheetApp.openById(SS_ID);
  var hoja = ss.getSheetByName(hojaName);
  var ult  = hoja.getLastRow();
  var enc  = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var fila = hoja.getRange(ult, 1, 1, hoja.getLastColumn()).getValues()[0];

  function safe(key) {
    for (var i = 0; i < enc.length; i++) {
      if (String(enc[i]).toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        return String(fila[i] || "").trim();
      }
    }
    return "";
  }

  function getColIndex(key) {
    for (var i = 0; i < enc.length; i++) {
      if (String(enc[i]).toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        return i + 1;
      }
    }
    return -1;
  }

  return { hoja: hoja, ult: ult, safe: safe, getColIndex: getColIndex, enc: enc, fila: fila };
}

'''

complete_file = header + f2_func + rest_of_file

output_path = r'C:\Users\jhvar\.gemini\antigravity-ide\scratch\Proyecto-Concurso\02_Scripts_y_Codigo\apps_script_completo.js'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(complete_file)

print("Archivo generado: {} lineas, {} bytes".format(
    complete_file.count('\n'), len(complete_file.encode('utf-8'))))
print("OK")
