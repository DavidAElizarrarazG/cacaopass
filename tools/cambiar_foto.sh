#!/bin/sh
# Cambia la imagen de perfil de un usuario con POST /api/setpfp (JPG o PNG de máximo 2 MB).
# Usa el token de .env.local. Uso: tools/cambiar_foto.sh 220437 foto.jpg
set -e
cd "$(dirname "$0")/.."
[ $# -eq 2 ] || { echo "Uso: $0 <numero_de_usuario> <imagen.jpg|png>"; exit 1; }
TOKEN=$(grep -E '^EXPO_PUBLIC_MONSTERBALL_TOKEN=' .env.local 2>/dev/null | cut -d= -f2-)
[ -n "$TOKEN" ] || { echo "Falta EXPO_PUBLIC_MONSTERBALL_TOKEN en .env.local"; exit 1; }
curl -sS -X POST https://monsterballgo.com/api/setpfp \
  -F "token=$TOKEN" -F "id=$1" -F "image=@$2"
echo
