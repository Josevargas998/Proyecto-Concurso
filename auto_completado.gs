var FORM_IDS = {
  2: "1xoVPJ8jAjrUibp-jH8zIhmdNe6r7Ilx9aPiFQUETSI4",
  3: "1DP9UE2oQJ2vCA3bV7oTnvUMW7xA5xiSiS-F96_8nnm8",
  4: "1A-YFD_8xGqwe-Dh3viMGerN6_Uj2agPRR_X8KuIwJlA"
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Acciones Concurso')
      .addItem('Generar Enlaces Pre-llenados (Todas las filas)', 'generarTodosLosEnlaces')
      .addToUi();
}

// Esta función genera los links y se puede configurar para correr automáticamente o manualmente
function generarTodosLosEnlaces() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
  if(!sheet) return;
  
  var data = sheet.getDataRange().getValues();
  if(data.length < 2) return; // Solo hay encabezados
  var headers = data[0];
  
  // Buscar índices de las columnas importantes
  var colCedula = -1, colNombre = -1, colPrograma = -1;
  var colLink2 = headers.indexOf("Llenar Formulario 2");
  var colLink3 = headers.indexOf("Llenar Formulario 3");
  var colLink4 = headers.indexOf("Llenar Formulario 4");
  
  for(var i=0; i<headers.length; i++){
    var h = String(headers[i]).toLowerCase();
    if(h.indexOf("cedula") !== -1 || h.indexOf("cédula") !== -1) colCedula = i;
    else if(h.indexOf("nombre") !== -1 && colNombre === -1) colNombre = i;
    else if(h.indexOf("programa") !== -1) colPrograma = i;
  }
  
  if(colCedula === -1 || colNombre === -1) {
    SpreadsheetApp.getUi().alert("Error: No se encontró la columna de Nombre o Cédula en el Formulario 1.");
    return;
  }
  
  // Si no existen las columnas de enlace, crearlas al final
  if(colLink2 === -1) { colLink2 = headers.length; sheet.getRange(1, colLink2+1).setValue("Llenar Formulario 2"); headers.push("Llenar Formulario 2"); }
  if(colLink3 === -1) { colLink3 = headers.length; sheet.getRange(1, colLink3+1).setValue("Llenar Formulario 3"); headers.push("Llenar Formulario 3"); }
  if(colLink4 === -1) { colLink4 = headers.length; sheet.getRange(1, colLink4+1).setValue("Llenar Formulario 4"); headers.push("Llenar Formulario 4"); }

  // Cargar los 3 formularios
  var f2 = FormApp.openById(FORM_IDS[2]);
  var f3 = FormApp.openById(FORM_IDS[3]);
  var f4 = FormApp.openById(FORM_IDS[4]);
  
  // Mapear los items de cada formulario
  var map2 = getItemsMapping(f2);
  var map3 = getItemsMapping(f3);
  var map4 = getItemsMapping(f4);
  
  // Recorrer todas las filas de la hoja 1
  for(var r=1; r<data.length; r++) {
    var fila = data[r];
    var cedula = String(fila[colCedula] || "");
    var nombre = String(fila[colNombre] || "");
    var programa = colPrograma !== -1 ? String(fila[colPrograma] || "") : "";
    
    if(!cedula || !nombre) continue; // Fila vacía
    
    // Generar link F2 si no existe
    if(!fila[colLink2] || fila[colLink2] === "") {
       var link2 = buildUrl(f2, map2, cedula, nombre, programa);
       sheet.getRange(r+1, colLink2+1).setValue(link2);
    }
    // Generar link F3 si no existe
    if(!fila[colLink3] || fila[colLink3] === "") {
       var link3 = buildUrl(f3, map3, cedula, nombre, programa);
       sheet.getRange(r+1, colLink3+1).setValue(link3);
    }
    // Generar link F4 si no existe
    if(!fila[colLink4] || fila[colLink4] === "") {
       var link4 = buildUrl(f4, map4, cedula, nombre, programa);
       sheet.getRange(r+1, colLink4+1).setValue(link4);
    }
  }
  
  SpreadsheetApp.getUi().alert("¡Enlaces pre-llenados generados exitosamente!");
}

function getItemsMapping(form) {
  var items = form.getItems();
  var map = {cedula: null, nombre: null, programa: null};
  for(var i=0; i<items.length; i++){
    var t = items[i].getTitle().toLowerCase();
    if(t.indexOf("cedula") !== -1 || t.indexOf("cédula") !== -1) map.cedula = items[i];
    else if(t.indexOf("nombre") !== -1 && !map.nombre) map.nombre = items[i];
    else if(t.indexOf("programa") !== -1 && !map.programa) map.programa = items[i];
  }
  return map;
}

function buildUrl(form, map, cedula, nombre, programa) {
  var formResponse = form.createResponse();
  
  if(map.cedula) fillItem(formResponse, map.cedula, cedula);
  if(map.nombre) fillItem(formResponse, map.nombre, nombre);
  if(map.programa && programa) fillItem(formResponse, map.programa, programa);
  
  return formResponse.toPrefilledUrl();
}

function fillItem(formResponse, item, value) {
   var t = item.getType();
   try {
     if (t === FormApp.ItemType.TEXT) formResponse.withItemResponse(item.asTextItem().createResponse(value));
     else if (t === FormApp.ItemType.MULTIPLE_CHOICE) formResponse.withItemResponse(item.asMultipleChoiceItem().createResponse(value));
     else if (t === FormApp.ItemType.LIST) formResponse.withItemResponse(item.asListItem().createResponse(value));
   } catch(e) {
     // Ignorar si el tipo no coincide o el valor exacto no está en la lista desplegable
   }
}
