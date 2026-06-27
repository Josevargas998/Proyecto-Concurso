import os

# Read current file to get the F3+ content
with open(r'C:\Users\jhvar\.gemini\antigravity-ide\scratch\Proyecto-Concurso\02_Scripts_y_Codigo\apps_script_completo.js', encoding='utf-8') as f:
    content = f.read()

marker = '// =====================================================================\n// FORMULARIO 3'
idx = content.find(marker)
rest_of_file = content[idx:]

# Build complete new file
new_file = r'''// =====================================================================
// VARIABLES GLOBALES
// =====================================================================
var SS_ID        = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY";
var TPL_FORM2_ID = "1zMog_h7OCTm5thWbjCFP6J5D6fiWh9RJL9NHQHl29Mo"; // Plantilla Lista de Chequeo
var TPL_FORM3_ID = "1AsZXFF6IC4Ue5FNeGmfRTVk3-qAvGABxGw-hEgkmscM"; // Plantilla Hoja de Calificacion

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

// =====================================================================
// FORMULARIO 2: VERIFICACION DE REQUISITOS
// Copia la plantilla Google Doc (TPL_FORM2_ID) y llena los datos.
// Los logos y el formato se preservan automaticamente.
// =====================================================================
function onFormSubmit_F2(e) {
  try {
    var d        = getFilaDatos("Respuestas de formulario 2");
    var cedula   = d.safe("Cedula del Candidato");
    var nombre   = d.safe("Nombre Completo del Candidato");
    var prog     = d.safe("Programa / Area del Concurso");
    var perfil   = d.safe("Perfil del Cargo");
    var obsGen   = d.safe("Observaciones Generales de la Verificacion");

    var fac = prog.indexOf("-") > -1 ? prog.split("-")[0].trim() : prog;
    var prg = prog.indexOf("-") > -1 ? prog.split("-")[1].trim() : prog;

    var colEnlace = d.getColIndex("Enlace Documento");
    if (colEnlace === -1) {
      colEnlace = d.enc.length + 1;
      d.hoja.getRange(1, colEnlace).setValue("Enlace Documento");
    }

    // ── 1. COPIAR PLANTILLA (logos y formato intactos) ───────────────
    var copia   = DriveApp.getFileById(TPL_FORM2_ID)
                    .makeCopy("ETAPA2_" + cedula + "_" + nombre.substring(0, 30));
    var copyDoc = DocumentApp.openById(copia.getId());
    var body    = copyDoc.getBody();

    // ── 2. REEMPLAZAR DATOS DEL CANDIDATO EN LOS PARRAFOS ───────────
    var paras = body.getParagraphs();
    for (var p = 0; p < paras.length; p++) {
      var txt = paras[p].getText();
      var low = txt.toLowerCase();

      if (low.indexOf("nombre:") >= 0 && low.indexOf("c.c.") >= 0) {
        // NOMBRE y CC en la misma linea (preservar estructura de la plantilla)
        paras[p].setText("NOMBRE: " + nombre.toUpperCase() +
                          "                                         C.C. " + cedula);
      } else if (low.indexOf("facultad de") >= 0) {
        paras[p].setText("FACULTAD DE " + fac.toUpperCase());
      } else if (low.indexOf("programa:") >= 0 && low.indexOf("area") < 0) {
        paras[p].setText("PROGRAMA: " + prg.toUpperCase());
      } else if (low.indexOf("area o linea:") >= 0) {
        paras[p].setText("AREA O LINEA: " + perfil.toUpperCase());
      } else if (txt.indexOf("____") >= 0 && low.indexOf("observaciones") < 0) {
        paras[p].setText(obsGen || "");
      }
    }

    // ── 3. LLENAR TABLA DE REQUISITOS ────────────────────────────────
    var REQS = [
      "1. Formato de Inscripcion firmado por el aspirante",
      "2. Hoja de Vida UQ (Formato GH-FOR-006)",
      "3. Fotocopia de cedula y libreta militar",
      "4. Fotocopia de matricula o tarjeta profesional",
      "5. Certificados disciplinarios, judiciales o fiscales vigentes",
      "6. Certificado de experiencia docente universitaria",
      "7. Titulo de Pregrado requerido por el perfil",
      "8. Titulo de Posgrado requerido por el perfil",
      "9. Experiencia minima en el area del concurso (segun perfil)",
      "10. Tema de disertacion presentado",
      "11. Documentos debidamente foliados"
    ];

    var tables = body.getTables();

    // Buscar la tabla de requisitos: la que tiene 3 columnas y al menos 10 filas
    var reqTable = null;
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].getNumRows() >= 10 && tables[t].getRow(0).getNumCells() >= 3) {
        reqTable = tables[t];
        break;
      }
    }

    var cumpleTodos = true;
    if (reqTable) {
      for (var i = 0; i < REQS.length && i < reqTable.getNumRows() - 1; i++) {
        var row     = reqTable.getRow(i + 1); // Fila 0 es encabezado
        var vReq    = d.safe(REQS[i]);
        var obsItem = d.safe("Observaciones - " + (i + 1));
        var cumple  = (vReq.toUpperCase().indexOf("CUMPLE") >= 0 &&
                       vReq.toUpperCase().indexOf("NO CUMPLE") < 0) ? "SI" : "NO";
        if (cumple === "NO") cumpleTodos = false;

        // Columna OBSERVACIONES (col 1)
        row.getCell(1).setText(obsItem || "");

        // Columna CUMPLE (col 2): VERDE o ROJO
        var cCump = row.getCell(2);
        cCump.setText(cumple);
        cCump.setBackgroundColor(cumple === "SI" ? "#b7e1cd" : "#f4cccc");
        cCump.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
        cCump.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      }
    }

    // ── 4. TABLA "CUMPLE CON TODOS LOS REQUISITOS" ───────────────────
    // Buscar: 2 filas y 3 columnas
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].getNumRows() === 2 && tables[t].getRow(0).getNumCells() >= 3) {
        var dataRow = tables[t].getRow(1);
        var siCell  = dataRow.getCell(1);
        var noCell  = dataRow.getCell(2);

        siCell.setText(cumpleTodos  ? "X" : "");
        noCell.setText(!cumpleTodos ? "X" : "");
        siCell.setBackgroundColor(cumpleTodos  ? "#b7e1cd" : "#ffffff");
        noCell.setBackgroundColor(!cumpleTodos ? "#f4cccc"  : "#ffffff");
        siCell.editAsText().setFontFamily("Arial").setFontSize(12).setBold(true);
        noCell.editAsText().setFontFamily("Arial").setFontSize(12).setBold(true);
        siCell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        noCell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        break;
      }
    }

    copyDoc.saveAndClose();

    d.hoja.getRange(d.ult, colEnlace).setValue(
      "https://docs.google.com/document/d/" + copia.getId() + "/edit"
    );

  } catch(err) { Logger.log("Error F2: " + err); }
}

''' + rest_of_file

output = r'C:\Users\jhvar\.gemini\antigravity-ide\scratch\Proyecto-Concurso\02_Scripts_y_Codigo\apps_script_completo.js'
with open(output, 'w', encoding='utf-8') as f:
    f.write(new_file)

lines = new_file.count('\n')
size  = len(new_file.encode('utf-8'))
print("Generado: {} lineas, {} bytes".format(lines, size))
print("OK - listo para pegar en Apps Script")
