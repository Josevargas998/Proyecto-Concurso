import base64, os

img_path = r'C:\Users\jhvar\.gemini\antigravity-ide\scratch\Proyecto-Concurso\imagenes_plantilla\image1.png'
with open(img_path, 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('ascii')

print("Longitud base64: {} caracteres".format(len(b64)))

# Guardar en un archivo para pegar en el script
out_path = r'C:\Users\jhvar\.gemini\antigravity-ide\scratch\Proyecto-Concurso\logo_base64.txt'
with open(out_path, 'w') as f:
    f.write(b64)

print("Guardado en:", out_path)
print("Primeros 80 chars:", b64[:80])
