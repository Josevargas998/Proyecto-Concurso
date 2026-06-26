// ============================================================
// Actualizar los 4 formularios:
// 1. Activar captura automática del correo del respondente
// 2. Eliminar los campos manuales de "Nombre de quien recibe"
//    y "Nombre del evaluador" (el email ya los identifica)
// ============================================================

var FORM_IDS = {
  "ETAPA 1": "1oS3N1XdQR5gVACxxdZYRxeIWEtBB3VKus7uwhUiX4nw",
  "ETAPA 2": "1xoVPJ8jAjrUibp-jH8zIhmdNe6r7Ilx9aPiFQUETSI4",
  "ETAPA 3": "1DP9UE2oQJ2vCA3bV7oTnvUMW7xA5xiSiS-F96_8nnm8",
  "ETAPA 4": "1A-YFD_8xGqwe-Dh3viMGerN6_Uj2agPRR_X8KuIwJlA",
};

// Palabras clave de los campos a eliminar (ya no son necesarios)
var CAMPOS_A_ELIMINAR = [
  "quien recibe",
  "funcionaria",
  "miembro del comite",
  "miembro de comision",
  "nombre del evaluador",
  "nombre del miembro",
  "proyecto",   // en etapa 4 era nombre del funcionario que proyecta
  "aprobo",     // en etapa 4 era nombre del jefe
];

function actualizarFormularios() {
  for (var etapa in FORM_IDS) {
    var formId = FORM_IDS[etapa];
    try {
      var form = FormApp.openById(formId);

      // ── 1. Activar captura automática del correo ──────────
      form.setCollectEmail(true);
      Logger.log("✅ " + etapa + " — Email activado: " + form.getTitle());

      // ── 2. Eliminar campos de nombre manual ───────────────
      var items = form.getItems();
      var eliminados = [];

      for (var i = items.length - 1; i >= 0; i--) {
        var titulo = items[i].getTitle().toLowerCase();
        var debeEliminar = false;

        for (var j = 0; j < CAMPOS_A_ELIMINAR.length; j++) {
          if (titulo.indexOf(CAMPOS_A_ELIMINAR[j]) !== -1) {
            debeEliminar = true;
            break;
          }
        }

        if (debeEliminar) {
          eliminados.push(items[i].getTitle());
          form.deleteItem(items[i]);
        }
      }

      if (eliminados.length > 0) {
        Logger.log("   Campos eliminados: " + eliminados.join(" | "));
      } else {
        Logger.log("   Sin campos que eliminar.");
      }

    } catch(e) {
      Logger.log("❌ Error en " + etapa + ": " + e.message);
    }
  }

  Logger.log("");
  Logger.log("==============================================");
  Logger.log("LISTO - Los 4 formularios ahora capturan");
  Logger.log("automáticamente el correo de quien responde.");
  Logger.log("El campo 'nombre de quien recibe' fue removido.");
  Logger.log("==============================================");
}
