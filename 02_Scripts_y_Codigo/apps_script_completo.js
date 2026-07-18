// =====================================================================
// VARIABLES GLOBALES
// =====================================================================
var SS_ID        = "1fXU5t9fmDfXwskFs42r1eZNZa0KCxNo1Li77yrDpyvY";
var TPL_FORM2_ID = "1zMog_h7OCTm5thWbjCFP6J5D6fiWh9RJL9NHQHl29Mo"; // Plantilla Lista de Chequeo original con logos
var TPL_FORM3_ID = "1AsZXFF6IC4Ue5FNeGmfRTVk3-qAvGABxGw-hEgkmscM"; // Plantilla Hoja de Calificacion

var FORM_IDS = {
  2: "1xoVPJ8jAjrUibp-jH8zIhmdNe6r7Ilx9aPiFQUETSI4",
  3: "1DP9UE2oQJ2vCA3bV7oTnvUMW7xA5xiSiS-F96_8nnm8",
  4: "1A-YFD_8xGqwe-Dh3viMGerN6_Uj2agPRR_X8KuIwJlA"
};

// =====================================================================
// MAPEO GLOBAL DE PROGRAMAS A FACULTADES (ACUERDO 029 DE 2026)
// =====================================================================
var GLOBAL_PROG_FACULTAD = {
  "licenciatura en educacion fisica":    "FACULTAD DE CIENCIAS DE LA EDUCACION",
  "educacion fisica":                    "FACULTAD DE CIENCIAS DE LA EDUCACION",
  "licenciatura en lenguas modernas":    "FACULTAD DE CIENCIAS DE LA EDUCACION",
  "lenguas modernas":                    "FACULTAD DE CIENCIAS DE LA EDUCACION",
  "licenciatura en literatura":          "FACULTAD DE CIENCIAS DE LA EDUCACION",
  "literatura y lengua castellana":      "FACULTAD DE CIENCIAS DE LA EDUCACION",
  "ingenieria civil":                    "FACULTAD DE INGENIERIA",
  "ingenieria electronica":              "FACULTAD DE INGENIERIA",
  "ingenieria de sistemas":              "FACULTAD DE INGENIERIA",
  "gerontologia":                        "FACULTAD DE CIENCIAS DE LA SALUD",
  "medicina":                            "FACULTAD DE CIENCIAS DE LA SALUD",
  "enfermeria":                          "FACULTAD DE CIENCIAS DE LA SALUD",
  "seguridad y salud en el trabajo":     "FACULTAD DE CIENCIAS DE LA SALUD",
  "ciencias de la informacion":          "FACULTAD DE CIENCIAS HUMANAS Y BELLAS ARTES",
  "archivistica":                        "FACULTAD DE CIENCIAS HUMANAS Y BELLAS ARTES",
  "trabajo social":                      "FACULTAD DE CIENCIAS HUMANAS Y BELLAS ARTES",
  "comunicacion social":                 "FACULTAD DE CIENCIAS HUMANAS Y BELLAS ARTES",
  "periodismo":                          "FACULTAD DE CIENCIAS HUMANAS Y BELLAS ARTES",
  "biologia":                            "FACULTAD DE CIENCIAS BASICAS Y TECNOLOGIAS",
  "fisica":                              "FACULTAD DE CIENCIAS BASICAS Y TECNOLOGIAS",
  "administracion financiera":           "FACULTAD DE CIENCIAS ECONOMICAS Y ADMINISTRATIVAS",
  "administracion de negocios":          "FACULTAD DE CIENCIAS ECONOMICAS Y ADMINISTRATIVAS"
};

// =====================================================================
// SEMAFORO DE COLORES POR FACULTADES (ESTANTERIA FISICA & DIGITAL)
// =====================================================================
var SEMAFORO_FACULTAD = {
  "FACULTAD DE CIENCIAS DE LA EDUCACION": {
    sheetBg: "#d8f3dc",      // Verde Claro Pastel
    headerBg: "#2d6a4f",     // Verde Oscuro
    headerMedBg: "#52796f",  // Verde Medio
    text: "VERDE"
  },
  "FACULTAD DE INGENIERIA": {
    sheetBg: "#caf0f8",      // Azul Claro Pastel
    headerBg: "#0077b6",     // Azul Oscuro
    headerMedBg: "#0096c7",  // Azul Medio
    text: "AZUL"
  },
  "FACULTAD DE CIENCIAS DE LA SALUD": {
    sheetBg: "#ffccd5",      // Rojo/Rosa Claro Pastel
    headerBg: "#c9184a",     // Rojo Oscuro
    headerMedBg: "#ff4d6d",  // Rojo/Rosa Fuerte
    text: "ROJO"
  },
  "FACULTAD DE CIENCIAS HUMANAS Y BELLAS ARTES": {
    sheetBg: "#ffe5ec",      // Naranja/Salmón Suave Pastel
    headerBg: "#ff7096",     // Rosa/Naranja Fuerte
    headerMedBg: "#ff85a1",  // Naranja Medio
    text: "NARANJA"
  },
  "FACULTAD DE CIENCIAS BASICAS Y TECNOLOGIAS": {
    sheetBg: "#e8dbfc",      // Morado/Lila Claro Pastel
    headerBg: "#7209b7",     // Morado Fuerte
    headerMedBg: "#b5179e",  // Morado/Magenta Medio
    text: "MORADO"
  },
  "FACULTAD DE CIENCIAS ECONOMICAS Y ADMINISTRATIVAS": {
    sheetBg: "#fefae0",      // Amarillo Crema Pastel
    headerBg: "#d4a373",     // Cafe/Ocre Claro
    headerMedBg: "#e9c46a",  // Amarillo/Dorado
    text: "AMARILLO"
  }
};

// Obtiene los datos del semáforo según el programa de concurso
function obtenerSemaforoPrograma(nombrePrograma) {
  var pLow = (nombrePrograma || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  var fac = "";
  for (var clave in GLOBAL_PROG_FACULTAD) {
    if (pLow.indexOf(clave) >= 0) {
      fac = GLOBAL_PROG_FACULTAD[clave];
      break;
    }
  }
  
  // Color por defecto en caso de no encontrarse
  var semaforoDefecto = {
    sheetBg: "#f1f3f4",      // Gris Claro
    headerBg: "#4a4a4a",     // Gris Oscuro
    headerMedBg: "#7a7a7a",  // Gris Medio
    text: "GRIS"
  };

  if (fac && SEMAFORO_FACULTAD[fac]) {
    var config = SEMAFORO_FACULTAD[fac];
    return {
      facultad: fac,
      sheetBg: config.sheetBg,
      headerBg: config.headerBg,
      headerMedBg: config.headerMedBg,
      colorFisico: config.text
    };
  }
  
  return {
    facultad: fac || nombrePrograma || "DESCONOCIDA",
    sheetBg: semaforoDefecto.sheetBg,
    headerBg: semaforoDefecto.headerBg,
    headerMedBg: semaforoDefecto.headerMedBg,
    colorFisico: semaforoDefecto.text
  };
}

// Colorea una fila del registro para la visualización del semáforo
function colorearFila(hoja, filaNum, colorHex) {
  try {
    var rng = hoja.getRange(filaNum, 1, 1, hoja.getLastColumn());
    rng.setBackground(colorHex);
  } catch(e) {
    Logger.log("Error coloreando fila: " + e);
  }
}


// =====================================================================
// FUNCIONES AUXILIARES
// =====================================================================
function getFilaDatos(hojaName) {
  var ss   = SpreadsheetApp.openById(SS_ID);
  var hoja = ss.getSheetByName(hojaName);
  var ult  = hoja.getLastRow();
  var enc  = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var fila = hoja.getRange(ult, 1, 1, hoja.getLastColumn()).getValues()[0];

  function normalizar(texto) {
    return String(texto || "")
      .toLowerCase()
      .trim()
      .replace(/ñ/g, 'n')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function safe(key) {
    var kNorm = normalizar(key);
    for (var i = 0; i < enc.length; i++) {
      var hNorm = normalizar(enc[i]);
      if (hNorm.indexOf(kNorm) !== -1) {
        return String(fila[i] || "").trim();
      }
    }
    return "";
  }

  function getColIndex(key) {
    var kNorm = normalizar(key);
    for (var i = 0; i < enc.length; i++) {
      var hNorm = normalizar(enc[i]);
      if (hNorm.indexOf(kNorm) !== -1) {
        return i + 1;
      }
    }
    return -1;
  }

  return { hoja: hoja, ult: ult, safe: safe, getColIndex: getColIndex, enc: enc, fila: fila };
}

// =====================================================================
// HELPER: Aplica bordes negros a todas las celdas de una tabla Google Doc
// =====================================================================
function aplicarBordesTabla(table) {
  try {
    for (var r = 0; r < table.getNumRows(); r++) {
      var row = table.getRow(r);
      for (var c = 0; c < row.getNumCells(); c++) {
        var cell = row.getCell(c);
        cell.setBorderColor("#000000");
        cell.setBorderWidth(1);
        cell.setPaddingTop(3);
        cell.setPaddingBottom(3);
        cell.setPaddingLeft(4);
        cell.setPaddingRight(4);
      }
    }
  } catch(e) {
    Logger.log("aplicarBordesTabla error: " + e);
  }
}

// =====================================================================
// DIAGNOSTICO: Corre esta funcion para ver todos los encabezados de
//              "Respuestas de formulario 2" en los Registros (Logger)
// =====================================================================
function debugF2Columnas() {
  var d = getFilaDatos("Respuestas de formulario 2");
  var lineas = ["Total columnas: " + d.enc.length, ""];
  for (var i = 0; i < d.enc.length; i++) {
    lineas.push("[" + (i + 1) + "] " + d.enc[i]);
  }
  Logger.log(lineas.join("\n"));
  SpreadsheetApp.getUi().alert("Revisa Ver > Registros para ver los nombres de las columnas.");
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
    var obsGen        = d.safe("Observaciones Generales");
    var conceptoFinal = d.safe("Concepto Final");
    // El concepto final lo decide el evaluador en el formulario
    // SI el concepto contiene "CUMPLE CON TODOS" → tabla final = SI, de lo contrario NO
    var cumpleTodos = conceptoFinal.toUpperCase().indexOf("CUMPLE CON TODOS") >= 0;

    // Buscar la facultad correcta segun el nombre del programa
    function getFacultad(nombrePrograma) {
      var pLow = (nombrePrograma || "").toLowerCase()
                   .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quitar tildes
      for (var clave in GLOBAL_PROG_FACULTAD) {
        if (pLow.indexOf(clave) >= 0) return GLOBAL_PROG_FACULTAD[clave];
      }
      // Fallback: si Form 1 envio "FACULTAD - Programa", usar la parte izquierda del guion
      if (nombrePrograma.indexOf("-") > -1) return nombrePrograma.split("-")[0].trim().toUpperCase();
      return ""; // desconocida
    }

    var fac = getFacultad(prog);
    var prg = prog; // el programa siempre es el nombre completo


    var colEnlace = d.getColIndex("Enlace Documento");
    if (colEnlace === -1) {
      colEnlace = d.enc.length + 1;
      d.hoja.getRange(1, colEnlace).setValue("Enlace Documento");
    }

    // ── 1. COPIAR PLANTILLA (logos y formato intactos) ───────────────
    var copia   = DriveApp.getFileById(TPL_FORM2_ID)
                    .makeCopy("ETAPA2_" + cedula + "_" + nombre.substring(0, 30));
    compartirArchivo(copia.getId()); // ← Compartir con cualquiera que tenga el enlace
    var copyDoc = DocumentApp.openById(copia.getId());
    var body    = copyDoc.getBody();

    // ── 2. REEMPLAZAR DATOS DEL CANDIDATO EN LOS PARRAFOS ───────────
    var paras = body.getParagraphs();
    for (var p = 0; p < paras.length; p++) {
      var txt = paras[p].getText().trim();
      var low = txt.toLowerCase();

      // Detener la busqueda despues de los primeros 15 parrafos para no tocar las tablas de requisitos
      if (p > 15) break;

      if (low.indexOf("nombre:") === 0) {
        paras[p].setText("NOMBRE: " + nombre.toUpperCase() +
                          "                                         C.C. " + cedula);
      } else if (low.indexOf("facultad:") === 0 || low.indexOf("facultad de") === 0) {
        paras[p].setText("FACULTAD: " + fac.toUpperCase());
      } else if (low.indexOf("programa:") === 0) {
        paras[p].setText("PROGRAMA: " + prg.toUpperCase());
      } else if (low.indexOf("perfil:") === 0 || low.indexOf("área o perfil") === 0 || low.indexOf("area o perfil") === 0 || low.indexOf("área o perfl") === 0) {
        paras[p].setText("PERFIL: " + perfil.toUpperCase());
      }
    }

    // Reemplazar linea de observaciones generales (linea de guiones bajos)
    if (obsGen && obsGen.length > 0) {
      body.replaceText("_{10,}", obsGen);
    }

    // ── 3. LLENAR TABLA DE REQUISITOS ────────────────────────────────
    // Mapeo explicito: cada entrada define la fila fisica del doc (en orden a,b,c,d,e...)
    // cumpleKey: busca en columnas de cumplimiento | obsKey: busca SOLO en columnas Observaciones
    var mapeoRequisitos = [
      { cumpleKey: "(a) Formato de inscripcion",              obsKey: "Formato de Inscripcion" },
      { cumpleKey: "(b) Hoja de Vida UQ",                     obsKey: "Hoja de Vida UQ" },
      { cumpleKey: "(c) Fotocopia del titulo de pregrado",    obsKey: "Titulo Pregrado" },
      { cumpleKey: "(d) Fotocopia de titulos o actas de grado de posgrado", obsKey: "Titulo Posgrado" },
      { cumpleKey: "(e) Fotocopia de la cedula",              obsKey: "Cedula" },
      { cumpleKey: "(f) Fotocopia de matricula",              obsKey: "Matricula" },
      { cumpleKey: "(g) Certificado de inhabilidades por delitos", obsKey: "delitos" },
      { cumpleKey: "(h) Certificado de registro de deudores", obsKey: "deudores" },
      { cumpleKey: "(i) Certificacion de experiencia especifica en docencia", obsKey: "docencia" },
      { cumpleKey: "(j) Certificacion de experiencia en investigacion", obsKey: "investigacion" },
      { cumpleKey: "(k) Certificacion de experiencia en extension", obsKey: "extension" },
      { cumpleKey: "(l) Certificacion de experiencia en cargos academico", obsKey: "cargos" },
      { cumpleKey: "(m) Certificacion de experiencia profesional", obsKey: "profesional" },
      { cumpleKey: "(n) Certificacion de suficiencia linguistica", obsKey: "linguistica" },
      { cumpleKey: "Documentos debidamente foliados",          obsKey: "foliados" },
      { cumpleKey: "5. Certificados disciplinarios",           obsKey: "disciplinarios" }
    ];

    var tables = body.getTables();
    var reqTable = null;
    for (var t = 0; t < tables.length; t++) {
      if (tables[t].getNumRows() >= 10 && tables[t].getRow(0).getNumCells() >= 3) {
        reqTable = tables[t];
        break;
      }
    }

    // Si la plantilla tiene 16 filas de datos (1 header + 15 datos) agregar la fila 16
    // El mapeoRequisitos tiene 16 items, la tabla debe tener 17 filas (1 header + 16 datos)
    if (reqTable && reqTable.getNumRows() < 17) {
      var newRow = reqTable.appendTableRow();
      newRow.appendTableCell("5. Certificados disciplinarios, judiciales o fiscales vigentes");
      newRow.appendTableCell("");
      newRow.appendTableCell("");
    }

    // Pre-indexar SOLO las columnas que comienzan con "Observaciones"
    // para evitar que d.safe() encuentre el valor CUMPLE en vez de la observacion
    var obsIndex = {};
    for (var k = 0; k < d.enc.length; k++) {
      var hdr = String(d.enc[k]).trim();
      if (hdr.toLowerCase().indexOf("observaci") >= 0 && hdr.toLowerCase().indexOf("general") < 0) {
        obsIndex[hdr.toLowerCase()] = String(d.fila[k] || "").trim();
      }
    }

    function buscarObservacion(obsKey) {
      var kk = obsKey.toLowerCase();
      for (var hdr in obsIndex) {
        if (hdr.indexOf(kk) >= 0) return obsIndex[hdr];
      }
      return "";
    }

    if (reqTable) {
      for (var i = 0; i < mapeoRequisitos.length && i < reqTable.getNumRows() - 1; i++) {
        var item    = mapeoRequisitos[i];
        var row     = reqTable.getRow(i + 1);
        var vReq    = d.safe(item.cumpleKey);
        var obsItem = buscarObservacion(item.obsKey);
        var cumple;
        if (!vReq) {
          cumple = "";
        } else if (vReq.toUpperCase().indexOf("NO CUMPLE") >= 0) {
          cumple = "NO";
        } else if (vReq.toUpperCase().indexOf("CUMPLE") >= 0) {
          cumple = "SI";
        } else if (vReq.toUpperCase().indexOf("PENDIENTE") >= 0) {
          cumple = "PENDIENTE";
        } else {
          cumple = "";
        }

        // Columna OBSERVACIONES
        var cObs = row.getCell(1);
        cObs.setText(obsItem || "");
        cObs.editAsText().setFontFamily("Arial").setFontSize(9).setBold(false);

        // Columna CUMPLE con color
        var cCump = row.getCell(2);
        cCump.setText(cumple);
        var bgColor = cumple === "SI" ? "#b7e1cd" : (cumple === "NO" ? "#f4cccc" : (cumple === "PENDIENTE" ? "#fff2cc" : "#ffffff"));
        cCump.setBackgroundColor(bgColor);
        cCump.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
        cCump.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      }

      // Aplicar bordes negros a toda la tabla de requisitos
      aplicarBordesTabla(reqTable);
    }

    // ── 4. TABLA "CUMPLE CON TODOS LOS REQUISITOS" ───────────────────
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
        aplicarBordesTabla(tables[t]);
        break;
      }
    }

    // Aplicar bordes a la tabla de firmas (cualquier tabla con celdas de firma al final)
    for (var t = 0; t < tables.length; t++) {
      var numRows = tables[t].getNumRows();
      var numCols = tables[t].getRow(0).getNumCells();
      if (numRows >= 2 && numCols >= 2 && tables[t] !== reqTable) {
        var txt0 = tables[t].getRow(0).getCell(0).getText().toLowerCase();
        if (txt0.indexOf("revision") >= 0 || txt0.indexOf("nombre") >= 0 || txt0.indexOf("firma") >= 0 || txt0.indexOf("verificacion") >= 0) {
          aplicarBordesTabla(tables[t]);
        }
      }
    }


    copyDoc.saveAndClose();
    d.hoja.getRange(d.ult, colEnlace).setValue(
      "https://docs.google.com/document/d/" + copia.getId() + "/edit"
    );

    // ── 5. GENERAR ENLACE AL FORMULARIO 3 (Mapeado automatico si cumple) ──
    var colLinkF3 = d.getColIndex("Llenar Formulario 3");
    if (colLinkF3 === -1) {
      colLinkF3 = d.enc.length + 2; // Columna siguiente
      d.hoja.getRange(1, colLinkF3).setValue("Llenar Formulario 3");
    }

    if (cumpleTodos) {
      // Generar el enlace prellenado para el Formulario 3
      var f3 = FormApp.openById(FORM_IDS[3]);
      var map3 = getItemsMapping(f3);
      var linkF3 = buildUrl(f3, map3, cedula, nombre, prog, perfil);
      d.hoja.getRange(d.ult, colLinkF3).setValue(linkF3);
      Logger.log("Enlace prellenado Formulario 3 generado para: " + nombre);
    } else {
      d.hoja.getRange(d.ult, colLinkF3).setValue("N/A - No cumple requisitos habilitantes");
    }

    // ── 6. SEMÁFORO: COLOREAR FILA Y REGISTRAR COLOR FÍSICO ──
    var semInfo = obtenerSemaforoPrograma(prog);
    colorearFila(d.hoja, d.ult, semInfo.sheetBg);
    
    var colColorEstante = d.getColIndex("Color Estante");
    if (colColorEstante === -1) {
      colColorEstante = d.hoja.getLastColumn() + 1;
      d.hoja.getRange(1, colColorEstante).setValue("Color Estante");
    }
    d.hoja.getRange(d.ult, colColorEstante).setValue(semInfo.colorFisico).setFontWeight("bold").setHorizontalAlignment("center");

  } catch(err) { Logger.log("Error F2: " + err); }
}

// =====================================================================
// HELPER: Extraer puntaje numerico de una opcion del formulario
// Las opciones tienen formato: "Descripcion -> X puntos" o "Descripcion -> X punto"
// =====================================================================
function extraerPuntaje(textoOpcion) {
  if (!textoOpcion) return 0;
  // Buscar patron "-> X puntos" o "-> X punto" al final del string
  var match = textoOpcion.match(/[\u2192>]\s*([\d.]+)\s*punt/i);
  if (match) return parseFloat(match[1]);
  return 0;
}

// =====================================================================
// COMPARTIR ARCHIVO: Comparte con editores de la hoja y público lector
// =====================================================================
function compartirArchivo(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    
    // 1. Permitir que cualquiera con el enlace pueda ver
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 2. Obtener editores de la hoja de cálculo principal y agregarlos como editores al documento
    var ss = SpreadsheetApp.openById(SS_ID);
    var editores = ss.getEditors();
    editores.forEach(function(editor) {
      try {
        file.addEditor(editor);
      } catch(errEditor) {
        Logger.log("No se pudo agregar editor " + editor.getEmail() + ": " + errEditor);
      }
    });
  } catch(e) {
    Logger.log("Error al compartir archivo " + fileId + ": " + e);
  }
}

// =====================================================================
// COMPARTIR RETROACTIVO: Comparte todos los documentos antiguos con los editores
// =====================================================================
function compartirTodosLosDocumentosExistentes() {
  var ss = SpreadsheetApp.openById(SS_ID);
  var nombresHojas = [
    "Respuestas de formulario 2",
    "Respuestas de formulario 3",
    "Respuestas de formulario 4"
  ];
  var totalCompartidos = 0;

  nombresHojas.forEach(function(nombreHoja) {
    var sheet = ss.getSheetByName(nombreHoja);
    if (!sheet) return;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    
    var colEnlace = -1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
      if (String(headers[i]).toLowerCase().indexOf("enlace documento") >= 0) {
        colEnlace = i + 1;
        break;
      }
    }
    if (colEnlace === -1) return;

    var enlaces = sheet.getRange(2, colEnlace, lastRow - 1, 1).getValues();
    enlaces.forEach(function(filaEnlace) {
      var url = String(filaEnlace[0] || "").trim();
      if (!url || url.indexOf("https://") === -1) return;
      
      // Extraer ID del archivo de la URL
      var fileId = "";
      var matchDoc = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (matchDoc) {
        fileId = matchDoc[1];
      }
      
      if (fileId) {
        compartirArchivo(fileId);
        totalCompartidos++;
      }
    });
  });

  SpreadsheetApp.getUi().alert("🔓 Compartido completado. Se sincronizaron los permisos de edición para " + totalCompartidos + " documentos con todos los editores de la tabla.");
}


// =====================================================================
// FORMULARIO 3: HOJA DE CALIFICACION - Acuerdo 029 de 2026
// Genera el documento DESDE CERO sin plantilla.
// =====================================================================
function onFormSubmit_F3(e) {
  try {
    var d         = getFilaDatos("Respuestas de formulario 3");
    var cedula    = d.safe("Cedula del Candidato");
    var nombre    = d.safe("Nombre Completo del Candidato");
    var prog      = d.safe("Programa / Area del Concurso");
    var perfil    = d.safe("Perfil del Cargo");
    var evaluador = d.safe("Nombre del Evaluador");

    var colEnlace = d.getColIndex("Enlace Documento");
    if (colEnlace === -1) { colEnlace = d.enc.length + 1; d.hoja.getRange(1, colEnlace).setValue("Enlace Documento"); }

    // ── CALCULAR PUNTAJES ─────────────────────────────────────────────
    var v1       = d.safe("Nivel Academico Acreditado");
    var p1       = extraerPuntaje(v1);
    var v2a      = d.safe("2a. Experiencia Docente");
    var p2a      = extraerPuntaje(v2a);
    var v2bCoord = d.safe("2b. Participacion como Coordinador");
    var v2bFacil = d.safe("2b. Participacion como Facilitador");
    var v2bLabor = d.safe("2b. Participacion por labor");
    var p2bC = extraerPuntaje(v2bCoord);
    var p2bF = extraerPuntaje(v2bFacil);
    var p2bL = extraerPuntaje(v2bLabor);
    var p2b  = Math.min(8, p2bC + p2bF + p2bL);
    var v2c  = d.safe("2c. Experiencia Profesional Diferente");
    var p2c  = extraerPuntaje(v2c);
    var v2d  = d.safe("2d. Experiencia en Cargos Academico");
    var p2d  = extraerPuntaje(v2d);
    var p2Total = Math.min(17, p2a + p2b + p2c + p2d);
    var v3a1 = d.safe("3a. Articulos en Revistas Indexadas - Categoria A1");
    var v3a2 = d.safe("3b. Articulos en Revistas Indexadas - Categoria A2");
    var v3lib = d.safe("3c. Libros");
    var v3obr = d.safe("3d. Obras Artisticas");
    var v3sof = d.safe("3e. Software");
    var v3aud = d.safe("3f. Produccion Audiovisual");
    var p3Total = Math.min(8, extraerPuntaje(v3a1) + extraerPuntaje(v3a2) + extraerPuntaje(v3lib) + extraerPuntaje(v3obr) + extraerPuntaje(v3sof) + extraerPuntaje(v3aud));
    var pTotal  = Math.min(30, p1 + p2Total + p3Total);
    var obsGen  = d.safe("Observaciones Generales del Evaluador");
    var detArt  = d.safe("Detalle de articulos indexados");
    var detLib  = d.safe("Detalle de libros / obras");
    var just1   = d.safe("Justificacion - Nivel Academico");
    var just2a  = d.safe("Justificacion - Experiencia Docente");
    var just2b  = d.safe("Justificacion - Extension / Proyeccion");
    var just2c  = d.safe("Justificacion - Experiencia Profesional");
    var just2d  = d.safe("Justificacion - Cargos Academico Administrativos");

    // Facultad & Semáforo
    var semInfo = obtenerSemaforoPrograma(prog);
    var fac = semInfo.facultad;
    
    // Colorear fila de respuestas y registrar color estante en Sheet
    colorearFila(d.hoja, d.ult, semInfo.sheetBg);
    var colColorEstante = d.getColIndex("Color Estante");
    if (colColorEstante === -1) {
      colColorEstante = d.hoja.getLastColumn() + 1;
      d.hoja.getRange(1, colColorEstante).setValue("Color Estante");
    }
    d.hoja.getRange(d.ult, colColorEstante).setValue(semInfo.colorFisico).setFontWeight("bold").setHorizontalAlignment("center");

    // ── CREAR SPREADSHEET ─────────────────────────────────────────────
    var ss = SpreadsheetApp.create("ETAPA3_" + cedula + "_" + nombre.substring(0, 25));
    compartirArchivo(ss.getId()); // ← Compartir con cualquiera que tenga el enlace
    var ws = ss.getActiveSheet();
    ws.setName("Calificacion HV");
    ws.setColumnWidth(1, 30);
    ws.setColumnWidth(2, 340);
    ws.setColumnWidth(3, 175);
    ws.setColumnWidth(4, 125);

    // Semáforo dinámico en el Excel
    var CD = semInfo.headerBg;      // Cabecera Principal (Color Oscuro de la Facultad)
    var CM = semInfo.headerMedBg;   // Cabecera de Secciones
    var CL = semInfo.headerMedBg;   // Cabecera de Criterios
    var CS = semInfo.sheetBg;       // Subtotales (Color Pastel de la Facultad)
    var CSel = semInfo.sheetBg;     // Selección (Color Pastel de la Facultad)
    var CTot = "#f6bd60";           // Color Naranja/Oro para el total
    var CW = "#ffffff"; 
    var CGr = "#f8f9fa"; 
    var CN = "#f4f6f8";             // Nota (Gris muy suave neutro)
    var TW = "#ffffff"; 
    var TD = "#1a1a1a";
    var row = 1;

    function sc(r, c, val, bg, fg, bold, sz, hal) {
      var cell = ws.getRange(r, c);
      if (val !== null && val !== undefined) cell.setValue(val);
      if (bg) cell.setBackground(bg);
      if (fg) cell.setFontColor(fg);
      if (bold !== undefined) cell.setFontWeight(bold ? "bold" : "normal");
      if (sz) cell.setFontSize(sz);
      if (hal) cell.setHorizontalAlignment(hal);
      cell.setWrap(true);
    }
    function mc(r, c1, c2, val, bg, fg, bold, sz, hal) {
      var rng = ws.getRange(r, c1, 1, c2 - c1 + 1);
      rng.merge().setValue(val || "").setWrap(true);
      if (bg) rng.setBackground(bg);
      if (fg) rng.setFontColor(fg);
      if (bold !== undefined) rng.setFontWeight(bold ? "bold" : "normal");
      if (sz) rng.setFontSize(sz);
      if (hal) rng.setHorizontalAlignment(hal);
    }
    function optRow(r, txt, scale, score, selected) {
      var bg = selected ? CSel : CW;
      var bld = selected ? true : false;
      mc(r, 1, 2, (selected ? "✔   " : "        ") + txt, bg, TD, bld, 9, "left");
      sc(r, 3, scale, bg, TD, false, 9, "center");
      sc(r, 4, selected ? score : "", bg, TD, bld, 10, "center");
      ws.setRowHeight(r, 20);
    }
    function sel(resp, key) {
      if (!resp) return false;
      // Normalizar texto eliminando tildes y reemplazando ñ por n para comparar de forma segura internamente
      var r = resp.toLowerCase().trim().replace(/ñ/g, 'n').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      var k = key.toLowerCase().trim().replace(/ñ/g, 'n').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Evitar que "10 anos" coincida con "5 y hasta 10 anos"
      if (k === "10 anos" && r.indexOf("hasta 10") >= 0) {
        return false;
      }
      // Evitar que "11 anos" coincida con "7 y hasta 11 anos"
      if (k === "11 anos" && r.indexOf("hasta 11") >= 0) {
        return false;
      }
      // Evitar que "8 anos" coincida con "4 y hasta 8 anos" en cargos directivos
      if (k === "8 anos" && r.indexOf("hasta 8") >= 0) {
        return false;
      }
      
      return r.indexOf(k) >= 0;
    }
    function notaRow(r, txt) { mc(r, 1, 4, txt, CN, TD, false, 9, "left"); ws.setRowHeight(r, 18); }
    function justRow(r, txt, pts) {
      mc(r, 1, 3, "Justificacion: " + (txt || "(No especificada)"), CN, TD, false, 9, "left");
      sc(r, 4, pts, CS, TD, true, 10, "center");
      ws.setRowHeight(r, 18);
    }
    function subtotalRow(r, label, pts) {
      ws.setRowHeight(r, 24);
      mc(r, 1, 3, label, CS, TD, true, 10, "right");
      sc(r, 4, pts, CTot, TD, true, 12, "center");
    }
    function secRow(r, num, label, maxPts) {
      ws.setRowHeight(r, 26);
      sc(r, 1, num, CD, TW, true, 11, "center");
      mc(r, 2, 3, label, CD, TW, true, 11, "left");
      sc(r, 4, maxPts, CD, TW, true, 9, "center");
    }
    function subSecRow(r, ltr, label, maxPts) {
      ws.setRowHeight(r, 22);
      sc(r, 1, ltr, CL, TW, true, 10, "center");
      mc(r, 2, 3, label, CL, TW, true, 10, "left");
      sc(r, 4, maxPts, CL, TW, true, 9, "center");
    }

    // Encabezado
    ws.setRowHeight(row, 28); mc(row,1,4,"UNIVERSIDAD DEL QUINDIO — OFICINA DE ASUNTOS PROFESORALES",CD,TW,true,13,"center"); row++;
    ws.setRowHeight(row, 22); mc(row,1,4,"CONCURSO PUBLICO DE MERITOS — ACUERDO 029 DE 2026",CD,TW,true,10,"center"); row++;
    ws.setRowHeight(row, 26); mc(row,1,4,"HOJA DE CALIFICACION — ETAPA 3: HOJA DE VIDA",CM,TW,true,12,"center"); row++;
    ws.setRowHeight(row, 8);  mc(row,1,4,"",CGr); row++;
    ws.setRowHeight(row, 22); mc(row,1,4,"Candidato:  " + nombre + "     CC:  " + cedula, CGr,TD,true,10,"left"); row++;
    ws.setRowHeight(row, 20); mc(row,1,4,"Facultad:   " + fac, CGr,TD,false,10,"left"); row++;
    ws.setRowHeight(row, 20); mc(row,1,4,"Programa:   " + prog, CGr,TD,false,10,"left"); row++;
    ws.setRowHeight(row, 20); mc(row,1,4,"Perfil:  " + perfil + "       Evaluador:  " + evaluador, CGr,TD,false,10,"left"); row++;
    ws.setRowHeight(row, 8);  mc(row,1,4,"",CGr); row++;

    // Header tabla
    ws.setRowHeight(row, 28);
    mc(row,1,2,"CRITERIOS — ACUERDO 029 DE 2026, ART. 14",CM,TW,true,10,"center");
    sc(row,3,"Escala / Puntaje",CM,TW,true,9,"center");
    sc(row,4,"Pts. Asignados",CM,TW,true,9,"center"); row++;

    // ── CRITERIO 1 ────────────────────────────────────────────────────
    secRow(row, "1", "MAXIMO NIVEL ACADEMICO ADICIONAL AL REQUERIDO", "Hasta 5 pts"); row++;
    notaRow(row, "Solo se califica el titulo ADICIONAL al exigido por el perfil del concurso."); row++;
    optRow(row, "Sin titulo adicional al requerido",          "0 puntos", 0,   sel(v1,"Sin titulo")); row++;
    optRow(row, "Maestria adicional a la requerida",          "3 puntos", 3,   sel(v1,"Maestria adicional")); row++;
    optRow(row, "Especializacion Medico-Quirurgica adicional","3 puntos", 3,   sel(v1,"Medico-Quirurgica")); row++;
    optRow(row, "Doctorado adicional al requerido",           "5 puntos", 5,   sel(v1,"Doctorado adicional")); row++;
    justRow(row, just1, p1); row++;
    subtotalRow(row, "SUBTOTAL CRITERIO 1", p1); row++;
    row++;

    // ── CRITERIO 2 ────────────────────────────────────────────────────
    secRow(row, "2", "EXPERIENCIA", "Hasta 17 pts"); row++;

    subSecRow(row, "a.", "Experiencia Docente Universitaria", "Hasta 5 pts"); row++;
    notaRow(row, "Calculada en Tiempo Completo Equivalente (TCE). Mínimo exigido por el perfil: 3 años."); row++;
    optRow(row, "3 años o menos (mínimo requerido)",  "0 puntos", 0, sel(v2a,"3 años o menos")); row++;
    optRow(row, "Superior a 3 y hasta 7 años",        "1 punto",  1, sel(v2a,"3 y hasta 7")); row++;
    optRow(row, "Superior a 7 y hasta 11 años",       "3 puntos", 3, sel(v2a,"7 y hasta 11")); row++;
    optRow(row, "Superior a 11 años",                 "5 puntos", 5, sel(v2a,"11 años")); row++;
    justRow(row, just2a, p2a); row++;

    subSecRow(row, "b.", "Extensión y Desarrollo Social", "Hasta 8 pts"); row++;
    notaRow(row, "Proyectos de los últimos 5 años, cerrados/terminados/liquidados."); row++;
    mc(row,1,4,"Como Coordinador de proyectos:", CN,TD,true,9,"left"); ws.setRowHeight(row,18); row++;
    optRow(row, "Sin participación como coordinador",              "0 puntos", 0, sel(v2bCoord,"Sin participacion como coord")); row++;
    optRow(row, "Entre 1 y 10 proyectos como coordinador",        "2 puntos", 2, sel(v2bCoord,"1 y 10 proyectos como coord")); row++;
    optRow(row, "Desde 11 y más proyectos como coordinador",      "4 puntos", 4, sel(v2bCoord,"11 y mas proyectos como coord")); row++;
    mc(row,1,4,"Como Facilitador (cursos formación continua en IES):", CN,TD,true,9,"left"); ws.setRowHeight(row,18); row++;
    optRow(row, "Sin participación como facilitador",              "0 puntos", 0, sel(v2bFacil,"Sin participacion como facil")); row++;
    optRow(row, "Entre 200 y 400 horas como facilitador",         "1 punto",  1, sel(v2bFacil,"200 y 400")); row++;
    optRow(row, "401 horas o más como facilitador",               "2 puntos", 2, sel(v2bFacil,"401 horas")); row++;
    mc(row,1,4,"Participación por labor en proyectos:", CN,TD,true,9,"left"); ws.setRowHeight(row,18); row++;
    optRow(row, "Sin participación por labor",                    "0 puntos", 0, sel(v2bLabor,"Sin participacion por labor")); row++;
    optRow(row, "Entre 1 y 10 proyectos por labor",              "1 punto",  1, sel(v2bLabor,"1 y 10 proyectos por labor")); row++;
    optRow(row, "Desde 11 y más proyectos por labor",            "2 puntos", 2, sel(v2bLabor,"11 y mas proyectos por labor")); row++;
    justRow(row, just2b, p2b); row++;

    subSecRow(row, "c.", "Experiencia Profesional Diferente a Docente", "Hasta 2 pts"); row++;
    optRow(row, "5 años o menos (mínimo requerido)", "0 puntos", 0, sel(v2c,"5 años o menos")); row++;
    optRow(row, "Superior a 5 y hasta 10 años",      "1 punto",  1, sel(v2c,"5 y hasta 10")); row++;
    optRow(row, "Superior a 10 años",                "2 puntos", 2, sel(v2c,"10 años")); row++;
    justRow(row, just2c, p2c); row++;

    subSecRow(row, "d.", "Experiencia en Cargos Académico-Administrativos en IES", "Hasta 2 pts"); row++;
    optRow(row, "Sin experiencia en cargos académico-administrativos", "0 puntos",   0,   sel(v2d,"Sin experiencia")); row++;
    optRow(row, "De 1 a 4 años",                                      "0.5 puntos", 0.5, sel(v2d,"1 a 4 años")); row++;
    optRow(row, "Superior a 4 y hasta 8 años",                        "1 punto",    1,   sel(v2d,"4 y hasta 8")); row++;
    optRow(row, "Superior a 8 años",                                  "2 puntos",   2,   sel(v2d,"8 años")); row++;
    justRow(row, just2d, p2d); row++;

    subtotalRow(row, "SUBTOTAL CRITERIO 2", p2Total); row++;
    row++;

    // ── CRITERIO 3 ────────────────────────────────────────────────────
    secRow(row, "3", "PRODUCTIVIDAD ACADEMICA", "Hasta 8 pts"); row++;
    notaRow(row, "Solo publicaciones de los últimos 5 años. Libros, software y obras: máximo 3 autores."); row++;

    subSecRow(row, "a.", "Articulos A1 Minciencias", "Hasta 2 pts"); row++;
    optRow(row, "No presenta articulos A1", "0 puntos",   0,   sel(v3a1,"No presenta articulos A1")); row++;
    optRow(row, "1 a 2 articulos A1",       "0.5 puntos", 0.5, sel(v3a1,"1 a 2 articulos A1")); row++;
    optRow(row, "3 articulos A1",           "1 punto",    1,   sel(v3a1,"3 articulos A1")); row++;
    optRow(row, "4 articulos A1",           "1.5 puntos", 1.5, sel(v3a1,"4 articulos A1")); row++;
    optRow(row, "5 o mas articulos A1",     "2 puntos",   2,   sel(v3a1,"5 o mas articulos A1")); row++;

    subSecRow(row, "b.", "Articulos A2 Minciencias", "Hasta 2 pts"); row++;
    optRow(row, "No presenta articulos A2", "0 puntos",   0,   sel(v3a2,"No presenta articulos A2")); row++;
    optRow(row, "1 a 2 articulos A2",       "0.5 puntos", 0.5, sel(v3a2,"1 a 2 articulos A2")); row++;
    optRow(row, "3 articulos A2",           "1 punto",    1,   sel(v3a2,"3 articulos A2")); row++;
    optRow(row, "4 articulos A2",           "1.5 puntos", 1.5, sel(v3a2,"4 articulos A2")); row++;
    optRow(row, "5 o mas articulos A2",     "2 puntos",   2,   sel(v3a2,"5 o mas articulos A2")); row++;

    if (detArt) { notaRow(row, "Detalle articulos: " + detArt); row++; }

    subSecRow(row, "c.", "Libros (maximo 3 autores)", "Hasta 1 pt"); row++;
    optRow(row, "No presenta libros", "0 puntos",   0,   sel(v3lib,"No presenta libros")); row++;
    optRow(row, "1 libro",            "0.5 puntos", 0.5, sel(v3lib,"1 libro")); row++;
    optRow(row, "2 o mas libros",     "1 punto",    1,   sel(v3lib,"2 o mas libros")); row++;

    subSecRow(row, "d.", "Obras Artisticas", "Hasta 1 pt"); row++;
    optRow(row, "No presenta obras artisticas", "0 puntos",   0,   sel(v3obr,"No presenta obras")); row++;
    optRow(row, "1 obra",                        "0.5 puntos", 0.5, sel(v3obr,"1 obra")); row++;
    optRow(row, "2 o mas obras",                 "1 punto",    1,   sel(v3obr,"2 o mas obras")); row++;

    subSecRow(row, "e.", "Software (maximo 3 autores)", "Hasta 1 pt"); row++;
    optRow(row, "No presenta software", "0 puntos",   0,   sel(v3sof,"No presenta software")); row++;
    optRow(row, "1 software",            "0.5 puntos", 0.5, sel(v3sof,"1 software")); row++;
    optRow(row, "2 o mas software",      "1 punto",    1,   sel(v3sof,"2 o mas software")); row++;

    subSecRow(row, "f.", "Produccion Audiovisual y Comunicativa", "Hasta 1 pt"); row++;
    optRow(row, "No presenta produccion audiovisual",    "0 puntos",   0,   sel(v3aud,"No presenta produccion")); row++;
    optRow(row, "1 produccion audiovisual",              "0.5 puntos", 0.5, sel(v3aud,"1 produccion audiovisual")); row++;
    optRow(row, "2 o mas producciones audiovisuales",    "1 punto",    1,   sel(v3aud,"2 o mas producciones")); row++;

    if (detLib) { notaRow(row, "Detalle libros/obras: " + detLib); row++; }

    subtotalRow(row, "SUBTOTAL CRITERIO 3", p3Total); row++;
    row++;

    // ── RESUMEN FINAL ─────────────────────────────────────────────────
    ws.setRowHeight(row, 28); mc(row,1,4,"RESUMEN — TOTAL HOJA DE VIDA",CM,TW,true,12,"center"); row++;
    ws.setRowHeight(row,22); mc(row,1,3,"Criterio 1 — Nivel Academico Adicional (max 5 pts)",CS,TD,true,10,"left"); sc(row,4,p1,CS,TD,true,11,"center"); row++;
    ws.setRowHeight(row,22); mc(row,1,3,"Criterio 2 — Experiencia (max 17 pts)",CS,TD,true,10,"left"); sc(row,4,p2Total,CS,TD,true,11,"center"); row++;
    ws.setRowHeight(row,22); mc(row,1,3,"Criterio 3 — Productividad Academica (max 8 pts)",CS,TD,true,10,"left"); sc(row,4,p3Total,CS,TD,true,11,"center"); row++;
    ws.setRowHeight(row,34); mc(row,1,3,"TOTAL HOJA DE VIDA  (maximo 30 puntos)",CM,TW,true,13,"right"); sc(row,4,pTotal,CTot,TD,true,15,"center"); row++;
    row++;

    ws.setRowHeight(row,20); mc(row,1,4,"Observaciones del Evaluador:",CD,TW,true,10,"left"); row++;
    ws.setRowHeight(row, Math.max(60, Math.ceil((obsGen || "").length / 60) * 18));
    mc(row,1,4,obsGen || "(Sin observaciones)",CGr,TD,false,10,"left"); row++;
    row++;

    ws.setRowHeight(row,55);
    mc(row,1,2,"\n\n____________________________\nFirma del Evaluador\n" + evaluador,CGr,TD,false,9,"center");
    mc(row,3,4,"\n\n____________________________\nVo.Bo. Oficina Asuntos Profesorales",CGr,TD,false,9,"center");

    d.hoja.getRange(d.ult, colEnlace).setValue("https://docs.google.com/spreadsheets/d/" + ss.getId() + "/edit");
    Logger.log("F3 OK — " + nombre + " — Total: " + pTotal + "/30");

  } catch(err) { Logger.log("Error F3: " + err); }
}



// =====================================================================
// FORMULARIO 4: FICHA DE INGRESO (Doc Programatico)

// =====================================================================
function onFormSubmit_F4(e) {
  try {
    var d = getFilaDatos("Respuestas de formulario 4");
    var cedula = d.safe("Cedula de Ciudadania");
    var nombre = d.safe("Nombre Completo");
    var prog   = d.safe("Programa Academico");
    
    var colEnlace = d.getColIndex("Enlace Documento");
    if (colEnlace === -1) { colEnlace = d.enc.length + 1; d.hoja.getRange(1, colEnlace).setValue("Enlace Documento"); }

    // ── SEMÁFORO: COLOREAR FILA Y REGISTRAR COLOR FÍSICO ──
    var semInfo = obtenerSemaforoPrograma(prog);
    colorearFila(d.hoja, d.ult, semInfo.sheetBg);
    
    var colColorEstante = d.getColIndex("Color Estante");
    if (colColorEstante === -1) {
      colColorEstante = d.hoja.getLastColumn() + 1;
      d.hoja.getRange(1, colColorEstante).setValue("Color Estante");
    }
    d.hoja.getRange(d.ult, colColorEstante).setValue(semInfo.colorFisico).setFontWeight("bold").setHorizontalAlignment("center");

    var doc  = DocumentApp.create("ETAPA4_" + cedula + "_" + nombre.substring(0, 30));
    compartirArchivo(doc.getId()); // ← Compartir con cualquiera que tenga el enlace
    var body = doc.getBody();


    function addCenterBold(t, sz) {
      var p = body.appendParagraph(t);
      p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      p.editAsText().setBold(true);
      if (sz) p.editAsText().setFontSize(sz);
    }

    addCenterBold("FICHA DE INGRESO A LA CARRERA DOCENTE - ANNO " + d.safe("Anno del Concurso"), 12);
    addCenterBold("NOMBRE: " + nombre.toUpperCase() + "   C.C. " + cedula, 11);
    addCenterBold("PROGRAMA: " + d.safe("Programa Academico").toUpperCase() + "   FACULTAD: " + d.safe("Facultad").toUpperCase(), 11);
    addCenterBold(d.safe("Categoria de Ingreso").toUpperCase() + "=" + d.safe("Puntos por Categoria") + " PTS.   TOPE EXP. CALIFICADA= " + d.safe("SUBTOTAL EXPERIENCIA CALIFICADA") + " PTS", 10);
    body.appendParagraph("");

    var tb = body.appendTable();
    function addR(c0, c1, c2, bold) {
      var r  = tb.appendTableRow();
      r.appendTableCell(c0);
      r.appendTableCell(c1);
      var c = r.appendTableCell(String(c2));
      c.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
      if (bold) {
        r.getCell(0).editAsText().setBold(true);
        r.getCell(1).editAsText().setBold(true);
        r.getCell(2).editAsText().setBold(true);
      }
    }

    addR("", "PUNTOS", "", true);
    addR("PREGRADO", d.safe("Institucion Pregrado") + "   " + d.safe("Titulo de Pregrado"), d.safe("Puntaje Titulo Pregrado"), false);
    addR("1. TITULOS", "", "", false);
    addR("POSTGRADO", d.safe("Institucion Posgrado") + "   " + d.safe("Titulo de Posgrado"), d.safe("Puntaje Titulo Posgrado"), false);
    addR("2. CATEGORIA", d.safe("Categoria de Ingreso") + " Cumple con requisitos", d.safe("Puntos por Categoria"), false);
    addR("3.1 INVESTIGACION", d.safe("Detalle Investigacion"), d.safe("3.1 Investigacion (puntos)"), false);
    addR("3.2 DOCENCIA UNIV.", d.safe("Detalle Docencia Universitaria"), d.safe("3.2 Docencia Universitaria (puntos)"), false);
    addR("3.3 CARGOS DIR.", d.safe("Detalle Cargos Direccion") || "N/P", d.safe("3.3 Experiencia en Cargos de Direccion"), false);
    addR("3.4 EXP. PROF.", d.safe("Detalle Experiencia Profesional") || "N/P", d.safe("3.4 Experiencia Profesional (puntos)"), false);
    addR("SUBTOTAL", "", d.safe("SUBTOTAL EXPERIENCIA CALIFICADA"), true);

    var arts = d.safe("Articulos en Revistas Indexadas").split("\n");
    for (var i = 0; i < arts.length; i++) if (arts[i].trim()) addR(i === 0 ? "4. PRODUCTIVIDAD" : "", arts[i].trim(), "", false);

    var libros = d.safe("Libros y Capitulos de Libro").split("\n");
    for (var i = 0; i < libros.length; i++) if (libros[i].trim()) addR("LIBROS", libros[i].trim(), "", false);

    addR("SUBTOTAL", "", d.safe("SUBTOTAL PRODUCTIVIDAD ACADEMICA"), true);

    body.appendParagraph("");
    addCenterBold("TOTAL PUNTOS: " + d.safe("TOTAL PUNTOS FINALES"), 12);
    body.appendParagraph("Remuneracion mensual: $ " + d.safe("Remuneracion Mensual") + " MONEDA CORRIENTE")
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    body.appendParagraph("");
    body.appendParagraph("PROYECTO: " + d.safe("Proyecto") + "\nAPROBO: " + d.safe("Aprobo"));

    doc.saveAndClose();
    d.hoja.getRange(d.ult, colEnlace).setValue("https://docs.google.com/document/d/" + doc.getId() + "/edit");
  } catch(err) { Logger.log("Error F4: " + err); }
}

// =====================================================================
// INSTALADOR DE TRIGGERS
// =====================================================================
function instalarTodosLosTriggers() {
  var ss       = SpreadsheetApp.openById(SS_ID);
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) ScriptApp.deleteTrigger(triggers[i]);

  // F1: genera enlaces automaticamente al enviar Formulario 1
  ScriptApp.newTrigger("onFormSubmit_F1").forSpreadsheet(ss).onFormSubmit().create();
  // F2, F3, F4: generan documentos al enviar cada formulario
  ScriptApp.newTrigger("onFormSubmit_F2").forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger("onFormSubmit_F3").forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger("onFormSubmit_F4").forSpreadsheet(ss).onFormSubmit().create();

  Logger.log("Triggers de Formularios 1, 2, 3 y 4 instalados correctamente");
}

// =====================================================================
// PRELLENADO DE ENLACES - v2 CORREGIDO
// =====================================================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Acciones Concurso")
    .addItem("Generar / Actualizar TODOS los enlaces",       "generarTodosLosEnlaces")
    .addSeparator()
    .addItem("🎨 Colorear todo segun facultad (Semaforo)",   "colorearTodoSemaforoPorFacultad")
    .addItem("🧹 Limpiar columnas duplicadas",               "limpiarColumnasBasura")
    .addItem("📊 Actualizar Hoja Resumen de Candidatos",     "actualizarHojaResumen")
    .addItem("🔓 Compartir todos los docs con editores",     "compartirTodosLosDocumentosExistentes")
    .addToUi();
}

// =====================================================================
// SEMAFORO RETROACTIVO: Colorea todas las filas existentes
// =====================================================================
function colorearTodoSemaforoPorFacultad() {
  var hojas = [
    { nombre: "Respuestas de formulario 1", colProg: "programa" },
    { nombre: "Respuestas de formulario 2", colProg: "programa" },
    { nombre: "Respuestas de formulario 3", colProg: "programa" },
    { nombre: "Respuestas de formulario 4", colProg: "programa academico" }
  ];
  var ss = SpreadsheetApp.openById(SS_ID);
  var total = 0;

  hojas.forEach(function(h) {
    var sheet = ss.getSheetByName(h.nombre);
    if (!sheet) return;
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2) return;

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var colProg = -1;
    for (var i = 0; i < headers.length; i++) {
      if (String(headers[i]).toLowerCase().indexOf(h.colProg) >= 0) { colProg = i; break; }
    }
    if (colProg === -1) return;

    // Buscar o crear columna "Color Estante"
    var colEstante = -1;
    for (var j = 0; j < headers.length; j++) {
      if (String(headers[j]).toLowerCase() === "color estante") { colEstante = j + 1; break; }
    }
    if (colEstante === -1) {
      colEstante = lastCol + 1;
      sheet.getRange(1, colEstante).setValue("Color Estante");
    }

    var datos = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    for (var r = 0; r < datos.length; r++) {
      var prog = String(datos[r][colProg] || "");
      if (!prog.trim()) continue;
      var sem = obtenerSemaforoPrograma(prog);
      colorearFila(sheet, r + 2, sem.sheetBg);
      sheet.getRange(r + 2, colEstante).setValue(sem.colorFisico).setFontWeight("bold").setHorizontalAlignment("center");
      total++;
    }
  });

  SpreadsheetApp.getUi().alert("✅ Semáforo aplicado a " + total + " filas en todas las hojas.");
}

// =====================================================================
// LIMPIEZA: Elimina columnas cuyo encabezado sea una URL o duplicadas
// =====================================================================
function limpiarColumnasBasura() {
  var nombres = [
    "Respuestas de formulario 1",
    "Respuestas de formulario 2",
    "Respuestas de formulario 3",
    "Respuestas de formulario 4"
  ];
  var ss = SpreadsheetApp.openById(SS_ID);
  var totalEliminadas = 0;

  nombres.forEach(function(nombre) {
    var sheet = ss.getSheetByName(nombre);
    if (!sheet) return;
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Encontrar columnas a eliminar (de derecha a izquierda para no desplazar índices)
    var colsAEliminar = [];
    var vistoEnlace = false;
    var vistoColor  = false;

    for (var i = headers.length - 1; i >= 0; i--) {
      var h = String(headers[i]).trim();
      // Columna basura: encabezado es una URL
      if (h.indexOf("https://") === 0 || h.indexOf("http://") === 0) {
        colsAEliminar.push(i + 1);
        continue;
      }
      // Columna "Enlace Documento" duplicada: mantener solo la primera encontrada (más a la derecha)
      if (h.toLowerCase() === "enlace documento") {
        if (vistoEnlace) { colsAEliminar.push(i + 1); } else { vistoEnlace = true; }
        continue;
      }
      // Columna "Color Estante" duplicada
      if (h.toLowerCase() === "color estante") {
        if (vistoColor) { colsAEliminar.push(i + 1); } else { vistoColor = true; }
        continue;
      }
      // Columna cuyo encabezado es solo un color (GRIS, VERDE, AZUL...)
      if (["gris","verde","azul","rojo","naranja","morado","amarillo"].indexOf(h.toLowerCase()) >= 0) {
        colsAEliminar.push(i + 1);
      }
    }

    // Eliminar de derecha a izquierda
    colsAEliminar.sort(function(a,b){ return b - a; });
    colsAEliminar.forEach(function(col) {
      sheet.deleteColumn(col);
      totalEliminadas++;
    });
  });

  SpreadsheetApp.getUi().alert("🧹 Limpieza completada. Se eliminaron " + totalEliminadas + " columnas duplicadas o basura.");
}

// =====================================================================
// HOJA RESUMEN: Consolida el estado de cada candidato por cedula
// =====================================================================
function actualizarHojaResumen() {
  var ss = SpreadsheetApp.openById(SS_ID);

  // Obtener o crear la hoja de resumen
  var resumen = ss.getSheetByName("RESUMEN CANDIDATOS");
  if (!resumen) {
    resumen = ss.insertSheet("RESUMEN CANDIDATOS");
    // Mover al inicio
    ss.setActiveSheet(resumen);
    ss.moveActiveSheet(1);
  }
  resumen.clearContents();
  resumen.clearFormats();

  // ── Encabezado ────────────────────────────────────────────────────
  var HDARK = "#1a1a2e"; var HMED = "#16213e"; var TW = "#ffffff";
  var encabezados = [
    "Fecha Ingreso", "Cedula", "Nombre Completo", "Programa / Area", "Facultad", "Color Estante",
    "F1 Registro", "F2 Estado", "F2 Doc. Lista Chequeo",
    "F3 Puntaje HV", "F3 Doc. Calificacion",
    "F4 Ficha Ingreso"
  ];
  resumen.setFrozenRows(2);
  resumen.setColumnWidth(1, 130);
  resumen.setColumnWidth(2, 110);
  resumen.setColumnWidth(3, 200);
  resumen.setColumnWidth(4, 200);
  resumen.setColumnWidth(5, 220);
  resumen.setColumnWidth(6, 100);
  resumen.setColumnWidth(7, 120);
  resumen.setColumnWidth(8, 140);
  resumen.setColumnWidth(9, 160);
  resumen.setColumnWidth(10, 110);
  resumen.setColumnWidth(11, 160);
  resumen.setColumnWidth(12, 140);

  // Fila 1: título
  var tituloRange = resumen.getRange(1, 1, 1, encabezados.length);
  tituloRange.merge()
    .setValue("CONCURSO PÚBLICO DE MÉRITOS — UNIVERSIDAD DEL QUINDÍO — RESUMEN DE CANDIDATOS")
    .setBackground(HDARK).setFontColor(TW).setFontWeight("bold").setFontSize(11)
    .setHorizontalAlignment("center");
  resumen.setRowHeight(1, 30);

  // Fila 2: encabezados de columna
  var hdrRange = resumen.getRange(2, 1, 1, encabezados.length);
  hdrRange.setValues([encabezados])
    .setBackground(HMED).setFontColor(TW).setFontWeight("bold").setFontSize(9)
    .setHorizontalAlignment("center").setWrap(true);
  resumen.setRowHeight(2, 28);

  // ── Leer datos de cada hoja ───────────────────────────────────────
  function leerHoja(nombre) {
    var sh = ss.getSheetByName(nombre);
    if (!sh || sh.getLastRow() < 2) return [];
    var last = sh.getLastRow();
    var cols = sh.getLastColumn();
    var enc  = sh.getRange(1, 1, 1, cols).getValues()[0];
    var data = sh.getRange(2, 1, last - 1, cols).getValues();
    return data.map(function(row) {
      var obj = {};
      enc.forEach(function(h, i) { obj[String(h).toLowerCase().trim()] = row[i]; });
      return obj;
    });
  }

  var f1 = leerHoja("Respuestas de formulario 1");
  var f2 = leerHoja("Respuestas de formulario 2");
  var f3 = leerHoja("Respuestas de formulario 3");
  var f4 = leerHoja("Respuestas de formulario 4");

  // Índice por cedula
  function indexarPorCedula(filas, campoCedula) {
    var idx = {};
    filas.forEach(function(f) {
      var ced = String(f[campoCedula] || "").trim();
      if (ced) idx[ced] = f; // mantiene el último si hay duplicados
    });
    return idx;
  }

  var idxF1 = indexarPorCedula(f1, "cedula del candidato");
  var idxF2 = indexarPorCedula(f2, "cedula del candidato");
  var idxF3 = indexarPorCedula(f3, "cedula del candidato");
  var idxF4 = indexarPorCedula(f4, "cedula de ciudadania");

  // Unión de todas las cédulas conocidas
  var cedulas = {};
  [idxF1, idxF2, idxF3, idxF4].forEach(function(idx) {
    Object.keys(idx).forEach(function(c) { cedulas[c] = true; });
  });

  // ── Escribir filas de datos ───────────────────────────────────────
  var filas = [];
  Object.keys(cedulas).sort().forEach(function(ced) {
    var r1 = idxF1[ced] || {};
    var r2 = idxF2[ced] || {};
    var r3 = idxF3[ced] || {};
    var r4 = idxF4[ced] || {};

    var nombre  = r1["nombre completo del candidato"] || r2["nombre completo del candidato"] || r3["nombre completo del candidato"] || r4["nombre completo"] || "";
    var prog    = r1["programa / area del concurso"]  || r2["programa / area del concurso"]  || r3["programa / area del concurso"]  || r4["programa academico"] || "";
    var sem     = obtenerSemaforoPrograma(prog);

    var f1Estado = Object.keys(r1).length > 0 ? "✅ Registrado" : "—";
    
    var fechaIngreso = "—";
    var tsKey = Object.keys(r1).filter(function(k) { return k.indexOf("marca temporal") >= 0 || k.indexOf("timestamp") >= 0; })[0];
    if (tsKey && r1[tsKey]) {
      try {
        var d = new Date(r1[tsKey]);
        if (!isNaN(d.getTime())) {
          fechaIngreso = Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
        } else {
          fechaIngreso = r1[tsKey];
        }
      } catch(e) { fechaIngreso = r1[tsKey]; }
    }

    var f2Estado = Object.keys(r2).length > 0
      ? (String(r2["concepto final"] || "").toUpperCase().indexOf("CUMPLE") >= 0 ? "✅ CUMPLE" : "❌ NO CUMPLE")
      : "—";

    // Enlace F2
    var enlaceF2 = "";
    for (var k in r2) { if (k.indexOf("enlace") >= 0) { enlaceF2 = r2[k] || ""; break; } }

    // Puntaje F3 (extraer del enlace o del campo de observaciones)
    var enlaceF3 = "";
    for (var k in r3) { if (k.indexOf("enlace") >= 0) { enlaceF3 = r3[k] || ""; break; } }
    var puntajeF3 = Object.keys(r3).length > 0 ? "Ver doc." : "—";

    // Recalcular puntaje desde respuestas F3 si existen
    if (Object.keys(r3).length > 0) {
      try {
        var p1   = extraerPuntaje(r3["nivel academico acreditado"] || "");
        var p2a  = extraerPuntaje(r3["2a. experiencia docente"] || "");
        var p2bC = extraerPuntaje(r3["2b. participacion como coordinador de proyectos de extension"] || "");
        var p2bF = extraerPuntaje(r3["2b. participacion como facilitador (cursos formacion continua en ies)"] || "");
        var p2bL = extraerPuntaje(r3["2b. participacion por labor en proyectos de extension"] || "");
        var p2b  = Math.min(8, p2bC + p2bF + p2bL);
        var p2c  = extraerPuntaje(r3["2c. experiencia profesional diferente"] || "");
        var p2d  = extraerPuntaje(r3["2d. experiencia en cargos academico"] || "");
        var p2   = Math.min(17, p2a + p2b + p2c + p2d);
        var p3a1 = extraerPuntaje(r3["3a. articulos en revistas indexadas - categoria a1 minciencias"] || "");
        var p3a2 = extraerPuntaje(r3["3b. articulos en revistas indexadas - categoria a2 minciencias"] || "");
        var p3l  = extraerPuntaje(r3["3c. libros (máximo 3 autores, últimos 5 años)"] || "");
        var p3o  = extraerPuntaje(r3["3d. obras artísticas (últimos 5 años)"] || "");
        var p3s  = extraerPuntaje(r3["3e. software (máximo 3 autores, últimos 5 años)"] || "");
        var p3av = extraerPuntaje(r3["3f. producción audiovisual y comunicativa (últimos 5 años)"] || "");
        var p3   = Math.min(8, p3a1 + p3a2 + p3l + p3o + p3s + p3av);
        var tot  = Math.min(30, p1 + p2 + p3);
        puntajeF3 = tot + " / 30";
      } catch(ex) { puntajeF3 = "Ver doc."; }
    }

    // Enlace F4
    var enlaceF4 = "";
    for (var k in r4) { if (k.indexOf("enlace") >= 0) { enlaceF4 = r4[k] || ""; break; } }
    var f4Estado = Object.keys(r4).length > 0 ? (enlaceF4 ? "✅ " + enlaceF4 : "✅ Ingresado") : "—";

    filas.push([
      fechaIngreso, ced, nombre, prog, sem.facultad, sem.colorFisico,
      f1Estado, f2Estado, enlaceF2 || "—",
      puntajeF3, enlaceF3 || "—",
      f4Estado
    ]);
  });

  if (filas.length === 0) {
    resumen.getRange(3, 1).setValue("(Sin datos aún en ninguno de los formularios)");
    SpreadsheetApp.getUi().alert("📊 Hoja Resumen actualizada. No hay candidatos registrados aún.");
    return;
  }

  var dataRange = resumen.getRange(3, 1, filas.length, encabezados.length);
  dataRange.setValues(filas).setFontSize(9).setWrap(false).setVerticalAlignment("middle");

  // Colorear filas según facultad
  for (var r = 0; r < filas.length; r++) {
    var progFila = filas[r][3];
    var semFila  = obtenerSemaforoPrograma(progFila);
    resumen.getRange(r + 3, 1, 1, encabezados.length).setBackground(semFila.sheetBg);
    resumen.getRange(r + 3, 6).setFontWeight("bold").setHorizontalAlignment("center");
  }

  // Bordes
  resumen.getRange(2, 1, filas.length + 1, encabezados.length)
    .setBorder(true, true, true, true, true, true, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);

  SpreadsheetApp.getUi().alert("📊 Hoja Resumen actualizada con " + filas.length + " candidato(s).");
}


// Trigger: genera enlaces solo cuando el envio viene del Formulario 1
function onFormSubmit_F1(e) {
  try {
    var nombreHoja = e.range.getSheet().getName();
    if (nombreHoja !== "Respuestas de formulario 1") return;
    Utilities.sleep(2000);
    generarEnlacesFila(e.range.getRow());
  } catch(err) { Logger.log("Error en onFormSubmit_F1: " + err); }
}

// Genera enlaces SOLO para la fila recien enviada (rapido)
function generarEnlacesFila(numFila) {
  var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("Respuestas de formulario 1");
  if (!sheet) return;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var fila    = sheet.getRange(numFila, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colCedula = -1, colNombre = -1, colPrograma = -1, colPerfil = -1;
  var colLink2  = headers.indexOf("Llenar Formulario 2");
  var colLink3  = headers.indexOf("Llenar Formulario 3");
  var colLink4  = headers.indexOf("Llenar Formulario 4");
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toLowerCase().trim();
    if (h.indexOf("cedula") !== -1 && colCedula === -1) colCedula = i;
    else if (h.indexOf("nombre") !== -1 && h.indexOf("recibe") === -1 &&
             h.indexOf("evaluador") === -1 && h.indexOf("miembro") === -1 && colNombre === -1) colNombre = i;
    else if (h.indexOf("programa") !== -1 && colPrograma === -1) colPrograma = i;
    else if (h.indexOf("perfil") !== -1 && colPerfil === -1) colPerfil = i;
  }
  if (colCedula === -1 || colNombre === -1) return;
  if (colLink2 === -1) { colLink2 = headers.length; sheet.getRange(1, colLink2+1).setValue("Llenar Formulario 2"); headers.push("Llenar Formulario 2"); }
  if (colLink3 === -1) { colLink3 = headers.length; sheet.getRange(1, colLink3+1).setValue("Llenar Formulario 3"); headers.push("Llenar Formulario 3"); }
  if (colLink4 === -1) { colLink4 = headers.length; sheet.getRange(1, colLink4+1).setValue("Llenar Formulario 4"); headers.push("Llenar Formulario 4"); }
  var cedula   = String(fila[colCedula]  || "").trim();
  var nombre   = String(fila[colNombre]  || "").trim();
  var programa = colPrograma !== -1 ? String(fila[colPrograma] || "").trim() : "";
  var perfil   = colPerfil   !== -1 ? String(fila[colPerfil]   || "").trim() : "";
  if (!cedula || !nombre) return;
  var f2 = FormApp.openById(FORM_IDS[2]);
  var f3 = FormApp.openById(FORM_IDS[3]);
  var f4 = FormApp.openById(FORM_IDS[4]);
  var map2 = getItemsMapping(f2);
  var map3 = getItemsMapping(f3);
  var map4 = getItemsMapping(f4);
  // Form 2 usa el nombre del programa SIN el prefijo de facultad
  var programaF2 = programa.indexOf("-") > -1 ? programa.split("-").slice(1).join("-").trim() : programa;
  sheet.getRange(numFila, colLink2+1).setValue(buildUrl(f2, map2, cedula, nombre, programaF2, perfil));
  sheet.getRange(numFila, colLink3+1).setValue(buildUrl(f3, map3, cedula, nombre, programa, perfil));
  sheet.getRange(numFila, colLink4+1).setValue(buildUrl(f4, map4, cedula, nombre, programa, perfil));
  Logger.log("Enlaces generados para fila " + numFila + ": " + nombre);
}

function generarTodosLosEnlaces() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
  if (!sheet) {
    Logger.log("ERROR: No se encontro la hoja 'Respuestas de formulario 1'");
    return;
  }
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;
  var headers = data[0];

  var colCedula = -1, colNombre = -1, colPrograma = -1, colPerfil = -1;
  var colLink2  = headers.indexOf("Llenar Formulario 2");
  var colLink3  = headers.indexOf("Llenar Formulario 3");
  var colLink4  = headers.indexOf("Llenar Formulario 4");

  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toLowerCase().trim();
    if ((h.indexOf("cedula") !== -1 || h.indexOf("cedula") !== -1) && colCedula === -1) {
      colCedula = i;
    } else if (h.indexOf("nombre") !== -1 && h.indexOf("recibe") === -1 &&
               h.indexOf("evaluador") === -1 && h.indexOf("miembro") === -1 && colNombre === -1) {
      colNombre = i;
    } else if (h.indexOf("programa") !== -1 && colPrograma === -1) {
      colPrograma = i;
    } else if (h.indexOf("perfil") !== -1 && colPerfil === -1) {
      colPerfil = i;
    }
  }

  Logger.log("Columnas -> cedula:" + colCedula + " nombre:" + colNombre + " programa:" + colPrograma + " perfil:" + colPerfil);

  if (colCedula === -1 || colNombre === -1) {
    SpreadsheetApp.getUi().alert("Error: No se encontro la columna de Nombre o Cedula.");
    return;
  }

  if (colLink2 === -1) { colLink2 = headers.length; sheet.getRange(1, colLink2 + 1).setValue("Llenar Formulario 2"); headers.push("Llenar Formulario 2"); }
  if (colLink3 === -1) { colLink3 = headers.length; sheet.getRange(1, colLink3 + 1).setValue("Llenar Formulario 3"); headers.push("Llenar Formulario 3"); }
  if (colLink4 === -1) { colLink4 = headers.length; sheet.getRange(1, colLink4 + 1).setValue("Llenar Formulario 4"); headers.push("Llenar Formulario 4"); }

  var f2   = FormApp.openById(FORM_IDS[2]);
  var f3   = FormApp.openById(FORM_IDS[3]);
  var f4   = FormApp.openById(FORM_IDS[4]);
  var map2 = getItemsMapping(f2);
  var map3 = getItemsMapping(f3);
  var map4 = getItemsMapping(f4);

  Logger.log("F2 perfil encontrado: " + (map2.perfil !== null ? map2.perfil.getTitle() : "NO"));

  var actualizados = 0;
  for (var r = 1; r < data.length; r++) {
    var fila     = data[r];
    var cedula   = String(fila[colCedula]  || "").trim();
    var nombre   = String(fila[colNombre]  || "").trim();
    var programa = colPrograma !== -1 ? String(fila[colPrograma] || "").trim() : "";
    var perfil   = colPerfil   !== -1 ? String(fila[colPerfil]   || "").trim() : "";
    if (!cedula || !nombre) continue;

    Logger.log("Candidato: " + nombre + " | Perfil: '" + perfil + "'");

    sheet.getRange(r + 1, colLink2 + 1).setValue(buildUrl(f2, map2, cedula, nombre, programa, perfil));
    sheet.getRange(r + 1, colLink3 + 1).setValue(buildUrl(f3, map3, cedula, nombre, programa, perfil));
    sheet.getRange(r + 1, colLink4 + 1).setValue(buildUrl(f4, map4, cedula, nombre, programa, perfil));
    actualizados++;
  }

  Logger.log("Completado: " + actualizados + " candidato(s) actualizados.");
  SpreadsheetApp.getUi().alert("Listo\n\n" + actualizados + " candidato(s) actualizados.\nRevisa Ver > Registros para ver el detalle.");
}

// Verifica el tipo del item antes de asignarlo como "perfil"
// para evitar asignar encabezados de seccion
function getItemsMapping(form) {
  var items = form.getItems();
  var map   = { cedula: null, nombre: null, programa: null, perfil: null };
  for (var i = 0; i < items.length; i++) {
    var t    = items[i].getTitle().toLowerCase().trim();
    var tipo = items[i].getType();
    if ((t.indexOf("cedula") !== -1 || t.indexOf("cedula") !== -1) && !map.cedula) {
      map.cedula = items[i];
    } else if (t.indexOf("nombre") !== -1 && t.indexOf("recibe") === -1 &&
               t.indexOf("evaluador") === -1 && t.indexOf("miembro") === -1 && !map.nombre) {
      map.nombre = items[i];
    } else if (t.indexOf("programa") !== -1 && !map.programa) {
      map.programa = items[i];
    } else if (t.indexOf("perfil") !== -1 && t.indexOf("chequeo") === -1 && !map.perfil) {
      if (tipo === FormApp.ItemType.LIST ||
          tipo === FormApp.ItemType.MULTIPLE_CHOICE ||
          tipo === FormApp.ItemType.TEXT) {
        map.perfil = items[i];
        Logger.log("Perfil mapeado -> '" + items[i].getTitle() + "' tipo: " + tipo);
      }
    }
  }
  return map;
}

function buildUrl(form, map, cedula, nombre, programa, perfil) {
  var formResponse = form.createResponse();
  if (map.cedula)               fillItem(formResponse, map.cedula,   cedula);
  if (map.nombre)               fillItem(formResponse, map.nombre,   nombre);
  if (map.programa && programa) fillItem(formResponse, map.programa, programa);
  if (map.perfil   && perfil)   fillItem(formResponse, map.perfil,   perfil);
  return formResponse.toPrefilledUrl();
}

// Valida que la opcion exista en el dropdown antes de crear la respuesta
function fillItem(formResponse, item, value) {
  var v      = String(value || "").trim();
  if (!v) return;
  var t      = item.getType();
  var titulo = item.getTitle();
  try {
    if (t === FormApp.ItemType.TEXT) {
      formResponse.withItemResponse(item.asTextItem().createResponse(v));
    } else if (t === FormApp.ItemType.PARAGRAPH_TEXT) {
      formResponse.withItemResponse(item.asParagraphTextItem().createResponse(v));
    } else if (t === FormApp.ItemType.MULTIPLE_CHOICE) {
      var cMC  = item.asMultipleChoiceItem().getChoices();
      var mMC  = buscarOpcion(cMC, v);
      if (mMC) {
        formResponse.withItemResponse(item.asMultipleChoiceItem().createResponse(mMC));
      } else {
        Logger.log("RADIO '" + titulo + "': '" + v + "' no encontrada. Opciones: " + cMC.map(function(c) { return c.getValue(); }).join(", "));
      }
    } else if (t === FormApp.ItemType.LIST) {
      var cL = item.asListItem().getChoices();
      var mL = buscarOpcion(cL, v);
      if (mL) {
        formResponse.withItemResponse(item.asListItem().createResponse(mL));
        Logger.log("DROPDOWN '" + titulo + "': '" + mL + "' OK");
      } else {
        Logger.log("DROPDOWN '" + titulo + "': '" + v + "' NO encontrada. Opciones: " + cL.map(function(c) { return c.getValue(); }).join(", "));
      }
    } else if (t === FormApp.ItemType.CHECKBOX) {
      formResponse.withItemResponse(item.asCheckboxItem().createResponse([v]));
    } else {
      Logger.log("Tipo no manejado '" + titulo + "': " + t);
    }
  } catch(e) {
    Logger.log("ERROR fillItem '" + titulo + "': " + e.message);
  }
}

// Busca una opcion ignorando mayusculas/minusculas y espacios
function buscarOpcion(choices, valor) {
  var vN = valor.trim().toLowerCase();
  for (var i = 0; i < choices.length; i++) {
    if (choices[i].getValue().trim().toLowerCase() === vN) {
      return choices[i].getValue();
    }
  }
  return null;
}

// =====================================================================
// ACTUALIZAR PLANTILLA GOOGLE DOC - FORMULARIO 2
// Ejecutar UNA SOLA VEZ cuando cambies el orden de los requisitos.
// Reconstruye la tabla en orden ALFABETICO ESTRICTO: a,b,c,d,e,f,g,h,i,m,n
// IMPORTANTE: despues de ejecutar esta funcion, ejecuta onFormSubmit_F2
//             para que el mapeo del script coincida con la plantilla.
// =====================================================================
function actualizarPlantillaF2() {
  var doc  = DocumentApp.openById(TPL_FORM2_ID);
  var body = doc.getBody();

  // Orden ALFABETICO ESTRICTO segun Acuerdo 029 - Articulo Noveno
  var REQUISITOS = [
    "(a) Formato de inscripcion (A-GH-03-F-13) diligenciado y firmado por el aspirante",
    "(b) Hoja de Vida UQ (VIG-M-DO-03-F-12) diligenciada y firmada por el aspirante",
    "(c) Fotocopia del titulo de pregrado exigido para el perfil o Acta de Grado",
    "(d) Fotocopia de titulos o actas de grado de posgrado exigidos para el perfil",
    "(e) Fotocopia de la cedula y libreta militar (Ley 1861/2017)",
    "(f) Fotocopia de matricula o tarjeta profesional (o constancia de tramite)",
    "(g) Certificado de inhabilidades por delitos sexuales",
    "(h) Certificado de registro de deudores alimentarios morosos (REDAM)",
    "(i) Certificacion de experiencia especifica en docencia universitaria (minimo 3 anos)",
    "(j) Certificacion de experiencia en investigacion (rol, titulo del proyecto)",
    "(k) Certificacion de experiencia en extension o desarrollo social",
    "(l) Certificacion de experiencia en cargos academico-administrativos en IES",
    "(m) Certificacion de experiencia profesional diferente a docencia (minimo 5 anos - Art. 7 literal c)",
    "(n) Certificacion de suficiencia linguistica nivel B1 en ingles",
    "Documentos debidamente foliados (Art. 9 Acuerdo 029)"
  ];

  var tables   = body.getTables();
  var reqTable = null;
  for (var t = 0; t < tables.length; t++) {
    if (tables[t].getNumRows() >= 8 && tables[t].getRow(0).getNumCells() >= 3) {
      reqTable = tables[t];
      break;
    }
  }

  if (!reqTable) {
    Logger.log("No se encontro la tabla de requisitos en la plantilla.");
    return;
  }

  Logger.log("Tabla encontrada con " + reqTable.getNumRows() + " filas. Reconstruyendo...");

  // Eliminar TODAS las filas de datos (dejar solo el encabezado en fila 0)
  var filasActuales = reqTable.getNumRows();
  for (var f = filasActuales - 1; f >= 1; f--) {
    reqTable.removeRow(f);
  }

  // Insertar las 12 filas en orden alfabetico estricto
  for (var i = 0; i < REQUISITOS.length; i++) {
    var nuevaFila   = reqTable.appendTableRow();

    var celdaReq    = nuevaFila.appendTableCell(REQUISITOS[i]);
    celdaReq.editAsText().setFontFamily("Arial").setFontSize(9).setBold(false);
    celdaReq.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.LEFT);

    var celdaObs    = nuevaFila.appendTableCell("");
    celdaObs.editAsText().setFontFamily("Arial").setFontSize(9);

    var celdaCumple = nuevaFila.appendTableCell("");
    celdaCumple.editAsText().setFontFamily("Arial").setFontSize(10).setBold(true);
    celdaCumple.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  }

  doc.saveAndClose();
  Logger.log("Plantilla actualizada correctamente con " + REQUISITOS.length + " requisitos en orden a,b,c,d,e,f,g,h,i,m,n.");
}

// =====================================================================
// AGREGAR PREGUNTAS FALTANTES EN EL FORMULARIO 2 (j, k, l)
// Ejecutar una sola vez. Busca si existen las preguntas para (j), (k), (l)
// en el formulario y si no existen, las crea automáticamente.
// =====================================================================
function agregarPreguntasFaltantesF2() {
  var form = FormApp.openById(FORM_IDS[2]);
  var items = form.getItems();
  var titulosExistentes = items.map(function(item) { return item.getTitle().toLowerCase(); });

  var nuevasPreguntas = [
    {
      tipo: "MC", // Multiple Choice
      titulo: "(j) Certificacion de experiencia en investigacion (rol, titulo del proyecto)",
      opciones: ["CUMPLE", "NO CUMPLE", "PENDIENTE - Requiere revision"]
    },
    {
      tipo: "TXT", // Text
      titulo: "Observaciones - Certificacion de experiencia en investigacion"
    },
    {
      tipo: "MC",
      titulo: "(k) Certificacion de experiencia en extension o desarrollo social",
      opciones: ["CUMPLE", "NO CUMPLE", "PENDIENTE - Requiere revision"]
    },
    {
      tipo: "TXT",
      titulo: "Observaciones - Certificacion de experiencia en extension"
    },
    {
      tipo: "MC",
      titulo: "(l) Certificacion de experiencia en cargos academico-administrativos en IES",
      opciones: ["CUMPLE", "NO CUMPLE", "PENDIENTE - Requiere revision"]
    },
    {
      tipo: "TXT",
      titulo: "Observaciones - Certificacion de experiencia en cargos"
    }
  ];

  var creadas = 0;
  for (var i = 0; i < nuevasPreguntas.length; i++) {
    var p = nuevasPreguntas[i];
    if (titulosExistentes.indexOf(p.titulo.toLowerCase()) === -1) {
      if (p.tipo === "MC") {
        var mcItem = form.addMultipleChoiceItem();
        mcItem.setTitle(p.titulo);
        mcItem.setChoices(p.opciones.map(function(op) { return mcItem.createChoice(op); }));
        mcItem.setRequired(true);
      } else if (p.tipo === "TXT") {
        var txtItem = form.addParagraphTextItem();
        txtItem.setTitle(p.titulo);
      }
      creadas++;
      Logger.log("Creada pregunta: " + p.titulo);
    }
  }

  if (creadas > 0) {
    // Si creamos preguntas nuevas, llamamos a reordenar para que queden en el lugar alfabético correcto
    Logger.log("Reordenando formulario...");
    reordenarFormulario2();
    SpreadsheetApp.getUi().alert("Se crearon " + creadas + " preguntas y el Formulario 2 fue reordenado con éxito.");
  } else {
    SpreadsheetApp.getUi().alert("Las preguntas ya existían en el formulario.");
  }
}

// =====================================================================
// REORDENAR FORMULARIO 2
// Reorganiza todas las preguntas del Formulario 2 en orden alfabetico.
// =====================================================================
function reordenarFormulario2() {
  var form  = FormApp.openById(FORM_IDS[2]);
  var items = form.getItems();

  var ordenDeseado = [
    "Cedula del Candidato",
    "Nombre Completo del Candidato",
    "Programa / Area del Concurso",
    "Perfil del Cargo",
    "Fecha de Verificacion",
    "(a) Formato de inscripcion",
    "Observaciones - Formato de Inscripcion",
    "(b) Hoja de Vida UQ",
    "Observaciones - Hoja de Vida UQ",
    "(c) Fotocopia del titulo de pregrado",
    "Observaciones - Titulo Pregrado",
    "(d) Fotocopia de titulos o actas de grado de posgrado",
    "Observaciones - Titulo Posgrado",
    "(e) Fotocopia de la cedula",
    "Observaciones - Cedula / Libreta Militar",
    "(f) Fotocopia de matricula",
    "Observaciones - Matricula / Tarjeta Profesional",
    "(g) Certificado de inhabilidades por delitos",
    "delitos sexuales",
    "(h) Certificado de registro de deudores",
    "registro de deudores alimentarios",
    "(i) Certificacion de experiencia especifica en docencia",
    "experiencia especifica en docencia",
    "(j) Certificacion de experiencia en investigacion",
    "Observaciones - Certificacion de experiencia en investigacion",
    "(k) Certificacion de experiencia en extension",
    "Observaciones - Certificacion de experiencia en extension",
    "(l) Certificacion de experiencia en cargos academico",
    "Observaciones - Certificacion de experiencia en cargos",
    "(m) Certificacion de experiencia profesional diferente a docencia",
    "experiencia profesional diferente a docencia",
    "(n) Certificacion de suficiencia linguistica",
    "suficiencia linguistica nivel B1",
    "Documentos debidamente foliados",
    "Documentos debidamente foliados",
    "5. Certificados disciplinarios",
    "Observaciones - Certificados disciplinarios",
    "Concepto Final",
    "Observaciones Generales"
  ];

  var posActual = 0;
  for (var o = 0; o < ordenDeseado.length; o++) {
    var clave = ordenDeseado[o].toLowerCase();
    for (var j = posActual; j < items.length; j++) {
      if (items[j].getTitle().toLowerCase().indexOf(clave) !== -1) {
        if (j !== posActual) {
          form.moveItem(j, posActual);
          items = form.getItems(); // refrescar
        }
        posActual++;
        break;
      }
    }
  }
  Logger.log("Formulario 2 reordenado correctamente.");
}

// =====================================================================
// CONSTRUIR FORMULARIO 3 DESDE CERO — ACUERDO 029 DE 2026 ART. 14
// ADVERTENCIA: Borra todas las preguntas existentes y reconstruye.
// Ejecutar UNA SOLA VEZ despues de confirmar que no hay respuestas.
// =====================================================================
function construirFormulario3Acuerdo029() {
  var form = FormApp.openById(FORM_IDS[3]);

  // Borrar todas las preguntas existentes
  var items = form.getItems();
  for (var i = items.length - 1; i >= 0; i--) {
    form.deleteItem(items[i]);
  }

  form.setTitle("ETAPA 3 - Hoja de Calificacion - Concurso Publico de Meritos 2026");
  form.setDescription(
    "Universidad del Quindio | Oficina de Asuntos Profesorales\n" +
    "Hoja de Calificacion segun Articulo Decimo Cuarto del Acuerdo 029 de 2026.\n" +
    "Total Hoja de Vida: 30 puntos.\n\n" +
    "NOTA: Diligencie unicamente para candidatos que CUMPLIERON todos los requisitos en la Etapa 2."
  );

  // ── DATOS BASICOS ──────────────────────────────────────────────────
  form.addTextItem().setTitle("Cedula del Candidato").setRequired(true);
  form.addTextItem().setTitle("Nombre Completo del Candidato").setRequired(true);
  form.addTextItem().setTitle("Programa / Area del Concurso").setRequired(true);
  form.addTextItem().setTitle("Perfil del Cargo").setRequired(true);
  form.addTextItem().setTitle("Nombre del Evaluador").setRequired(true);

  // ── CRITERIO 1: NIVEL ACADEMICO ADICIONAL (max 5 pts) ─────────────
  form.addPageBreakItem()
    .setTitle("CRITERIO 1 — Maximo Nivel Academico Adicional al Requerido")
    .setHelpText("Hasta 5 puntos. Solo se califica el titulo ADICIONAL al exigido por el perfil.");

  var v1 = form.addMultipleChoiceItem();
  v1.setTitle("Nivel Academico Acreditado");
  v1.setHelpText("Seleccione el titulo adicional que presenta el candidato (diferente al requerido por el perfil).");
  v1.setChoices([
    v1.createChoice("Sin titulo adicional al requerido \u2192 0 puntos"),
    v1.createChoice("Maestria adicional a la requerida \u2192 3 puntos"),
    v1.createChoice("Especializacion Medico-Quirurgica adicional \u2192 3 puntos"),
    v1.createChoice("Doctorado adicional al requerido \u2192 5 puntos")
  ]);
  v1.setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Justificacion - Nivel Academico")
    .setHelpText("Indique nombre del titulo adicional, institucion y anio de grado.")
    .setRequired(true);

  // ── CRITERIO 2: EXPERIENCIA (max 17 pts) ──────────────────────────
  form.addPageBreakItem()
    .setTitle("CRITERIO 2 — Experiencia (Hasta 17 puntos total)")
    .setHelpText("Suma de: Docencia (5) + Extensión (8) + Profesional (2) + Cargos Admin. (2)");

  // 2a: Docencia universitaria
  form.addSectionHeaderItem()
    .setTitle("2a. Experiencia Docente Universitaria — Hasta 5 puntos");
  var v2a = form.addMultipleChoiceItem();
  v2a.setTitle("2a. Experiencia Docente");
  v2a.setHelpText("Total de años certificados en docencia universitaria (contabilizados en TCE).");
  v2a.setChoices([
    v2a.createChoice("3 años o menos (solo el mínimo requerido) \u2192 0 puntos"),
    v2a.createChoice("Superior a 3 y hasta 7 años \u2192 1 punto"),
    v2a.createChoice("Superior a 7 y hasta 11 años \u2192 3 puntos"),
    v2a.createChoice("Superior a 11 años \u2192 5 puntos")
  ]);
  v2a.setRequired(true);
  form.addParagraphTextItem()
    .setTitle("Justificacion - Experiencia Docente")
    .setHelpText("Indique instituciones, periodos y TCE calculado.").setRequired(true);

  // 2b: Extension y Desarrollo Social
  form.addSectionHeaderItem()
    .setTitle("2b. Extensión y Desarrollo Social — Hasta 8 puntos (proyectos últimos 5 años cerrados/liquidados)");

  var v2bCoord = form.addMultipleChoiceItem();
  v2bCoord.setTitle("2b. Participacion como Coordinador de proyectos de Extension");
  v2bCoord.setChoices([
    v2bCoord.createChoice("Sin participacion como coordinador \u2192 0 puntos"),
    v2bCoord.createChoice("Entre 1 y 10 proyectos como coordinador \u2192 2 puntos"),
    v2bCoord.createChoice("Desde 11 y mas proyectos como coordinador \u2192 4 puntos")
  ]);
  v2bCoord.setRequired(true);

  var v2bFacil = form.addMultipleChoiceItem();
  v2bFacil.setTitle("2b. Participacion como Facilitador (cursos formacion continua en IES)");
  v2bFacil.setHelpText("Docente/tutor de cursos de formacion continua o aprendizaje permanente en IES.");
  v2bFacil.setChoices([
    v2bFacil.createChoice("Sin participacion como facilitador \u2192 0 puntos"),
    v2bFacil.createChoice("Entre 200 y 400 horas como facilitador \u2192 1 punto"),
    v2bFacil.createChoice("401 horas o mas como facilitador \u2192 2 puntos")
  ]);
  v2bFacil.setRequired(true);

  var v2bLabor = form.addMultipleChoiceItem();
  v2bLabor.setTitle("2b. Participacion por labor en proyectos de Extension");
  v2bLabor.setChoices([
    v2bLabor.createChoice("Sin participacion por labor \u2192 0 puntos"),
    v2bLabor.createChoice("Entre 1 y 10 proyectos por labor \u2192 1 punto"),
    v2bLabor.createChoice("Desde 11 y mas proyectos por labor \u2192 2 puntos")
  ]);
  v2bLabor.setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Justificacion - Extension / Proyeccion")
    .setHelpText("Liste proyectos, rol, entidad y años.").setRequired(true);

  // 2c: Experiencia profesional != docente
  form.addSectionHeaderItem()
    .setTitle("2c. Experiencia Profesional Diferente a Docente — Hasta 2 puntos");
  var v2c = form.addMultipleChoiceItem();
  v2c.setTitle("2c. Experiencia Profesional Diferente");
  v2c.setHelpText("Años de experiencia profesional diferente a la docente (superior al mínimo de 5 años).");
  v2c.setChoices([
    v2c.createChoice("5 años o menos (solo el mínimo requerido) \u2192 0 puntos"),
    v2c.createChoice("Superior a 5 y hasta 10 años \u2192 1 punto"),
    v2c.createChoice("Superior a 10 años \u2192 2 puntos")
  ]);
  v2c.setRequired(true);
  form.addParagraphTextItem()
    .setTitle("Justificacion - Experiencia Profesional")
    .setHelpText("Indique empresa/entidad, cargo y periodo.").setRequired(true);

  // 2d: Cargos academico-administrativos
  form.addSectionHeaderItem()
    .setTitle("2d. Experiencia en Cargos Académico-Administrativos en IES — Hasta 2 puntos");
  var v2d = form.addMultipleChoiceItem();
  v2d.setTitle("2d. Experiencia en Cargos Academico");
  v2d.setHelpText("Cargos de direccion o administracion academica en Instituciones de Educacion Superior.");
  v2d.setChoices([
    v2d.createChoice("Sin experiencia en cargos academico-administrativos \u2192 0 puntos"),
    v2d.createChoice("De 1 a 4 años en cargos academico-administrativos \u2192 0.5 puntos"),
    v2d.createChoice("Superior a 4 y hasta 8 años \u2192 1 punto"),
    v2d.createChoice("Superior a 8 años \u2192 2 puntos")
  ]);
  v2d.setRequired(true);
  form.addParagraphTextItem()
    .setTitle("Justificacion - Cargos Academico Administrativos")
    .setHelpText("Indique cargo, IES y periodo.").setRequired(true);

  // ── CRITERIO 3: PRODUCTIVIDAD ACADEMICA (max 8 pts) ───────────────
  form.addPageBreakItem()
    .setTitle("CRITERIO 3 — Productividad Académica (Hasta 8 puntos)")
    .setHelpText("Solo publicaciones de los ÚLTIMOS 5 AÑOS. Libros/software: máximo 3 autores.");

  // Articulos A1
  var v3a1 = form.addMultipleChoiceItem();
  v3a1.setTitle("3a. Articulos en Revistas Indexadas - Categoria A1 Minciencias");
  v3a1.setChoices([
    v3a1.createChoice("No presenta articulos A1 \u2192 0 puntos"),
    v3a1.createChoice("1 a 2 articulos A1 \u2192 0.5 puntos"),
    v3a1.createChoice("3 articulos A1 \u2192 1 punto"),
    v3a1.createChoice("4 articulos A1 \u2192 1.5 puntos"),
    v3a1.createChoice("5 o mas articulos A1 \u2192 2 puntos")
  ]);
  v3a1.setRequired(true);

  // Articulos A2
  var v3a2 = form.addMultipleChoiceItem();
  v3a2.setTitle("3b. Articulos en Revistas Indexadas - Categoria A2 Minciencias");
  v3a2.setChoices([
    v3a2.createChoice("No presenta articulos A2 \u2192 0 puntos"),
    v3a2.createChoice("1 a 2 articulos A2 \u2192 0.5 puntos"),
    v3a2.createChoice("3 articulos A2 \u2192 1 punto"),
    v3a2.createChoice("4 articulos A2 \u2192 1.5 puntos"),
    v3a2.createChoice("5 o mas articulos A2 \u2192 2 puntos")
  ]);
  v3a2.setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Detalle de articulos indexados")
    .setHelpText("Titulo, revista, anio, categoria (A1/A2).");

  // Libros
  var v3lib = form.addMultipleChoiceItem();
  v3lib.setTitle("3c. Libros (máximo 3 autores, últimos 5 años)");
  v3lib.setChoices([
    v3lib.createChoice("No presenta libros \u2192 0 puntos"),
    v3lib.createChoice("1 libro \u2192 0.5 puntos"),
    v3lib.createChoice("2 o mas libros \u2192 1 punto")
  ]);
  v3lib.setRequired(true);

  // Obras artisticas
  var v3obr = form.addMultipleChoiceItem();
  v3obr.setTitle("3d. Obras Artísticas (últimos 5 años)");
  v3obr.setChoices([
    v3obr.createChoice("No presenta obras artisticas \u2192 0 puntos"),
    v3obr.createChoice("1 obra \u2192 0.5 puntos"),
    v3obr.createChoice("2 o mas obras \u2192 1 punto")
  ]);
  v3obr.setRequired(true);

  // Software
  var v3sof = form.addMultipleChoiceItem();
  v3sof.setTitle("3e. Software (máximo 3 autores, últimos 5 años)");
  v3sof.setChoices([
    v3sof.createChoice("No presenta software \u2192 0 puntos"),
    v3sof.createChoice("1 software \u2192 0.5 puntos"),
    v3sof.createChoice("2 o mas software \u2192 1 punto")
  ]);
  v3sof.setRequired(true);

  // Produccion audiovisual
  var v3aud = form.addMultipleChoiceItem();
  v3aud.setTitle("3f. Producción Audiovisual y Comunicativa (últimos 5 años)");
  v3aud.setChoices([
    v3aud.createChoice("No presenta produccion audiovisual \u2192 0 puntos"),
    v3aud.createChoice("1 produccion audiovisual \u2192 0.5 puntos"),
    v3aud.createChoice("2 o mas producciones audiovisuales \u2192 1 punto")
  ]);
  v3aud.setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Detalle de libros / obras")
    .setHelpText("Titulo, editorial/plataforma, anio, tipo, numero de autores.");

  // ── OBSERVACIONES ─────────────────────────────────────────────────
  form.addPageBreakItem()
    .setTitle("Observaciones del Evaluador");
  form.addParagraphTextItem()
    .setTitle("Observaciones Generales del Evaluador")
    .setHelpText("Comentarios adicionales, salvedades o aclaraciones sobre la evaluacion.");

  var total = form.getItems().length;
  Logger.log("Formulario 3 reconstruido con " + total + " preguntas — Acuerdo 029 de 2026.");
  SpreadsheetApp.getUi().alert(
    "Formulario 3 reconstruido exitosamente con " + total + " preguntas\n" +
    "segun el Articulo 14 del Acuerdo 029 de 2026.\n\n" +
    "Los puntajes se calculan AUTOMATICAMENTE al enviar."
  );
}

// =====================================================================
// REORDENAR FORMULARIO 3
// Reorganiza todas las preguntas del Formulario 3 en orden lógico.
// =====================================================================
function reordenarFormulario3() {
  var form  = FormApp.openById(FORM_IDS[3]);
  var items = form.getItems();

  var ordenDeseado = [
    "Cedula del Candidato",
    "Nombre Completo del Candidato",
    "Programa / Area del Concurso",
    "Perfil del Cargo",
    "Nombre del Evaluador",
    "Nivel Academico Acreditado",
    "Institucion Pregrado",
    "Titulo de Pregrado",
    "Puntaje Titulo Pregrado",
    "Posgrado Requerido por el Perfil",
    "Institucion Posgrado",
    "Titulo de Posgrado",
    "Puntaje Titulo Posgrado",
    "Justificacion - Nivel Academico",
    "Puntaje Total Criterio 1",
    "2a. Experiencia Docente",
    "Justificacion - Experiencia Docente",
    "2b. Experiencia en Investigacion",
    "Justificacion - Investigacion",
    "2c. Experiencia en Extension",
    "Justificacion - Extension / Proyeccion",
    "2d. Experiencia Profesional Diferente",
    "Justificacion - Experiencia Profesional",
    "2e. Experiencia en Cargos Academico",
    "Justificacion - Cargos Academico Administrativos",
    "Puntaje Total Criterio 2",
    "3a. Articulos en Revistas Indexadas",
    "Detalle de articulos indexados",
    "3b. Libros, Obras, Software",
    "Detalle de libros / obras",
    "Puntaje Total Criterio 3",
    "Observaciones Generales del Evaluador"
  ];

  var posActual = 0;
  for (var o = 0; o < ordenDeseado.length; o++) {
    var clave = ordenDeseado[o].toLowerCase();
    for (var j = posActual; j < items.length; j++) {
      if (items[j].getTitle().toLowerCase().indexOf(clave) !== -1) {
        if (j !== posActual) {
          form.moveItem(j, posActual);
          items = form.getItems(); // refrescar
        }
        posActual++;
        break;
      }
    }
  }
  Logger.log("Formulario 3 reordenado correctamente.");
}



