#!/bin/sh
# Genera el reporte en PDF: Chrome sin interfaz imprime report.html y luego se le pone el membrete.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --allow-file-access-from-files \
  --print-to-pdf="$PWD/sin_membrete.pdf" "file://$PWD/report.html"
swift stamp_membrete.swift sin_membrete.pdf Practica4_CacaoPass_Elizarraraz_Sastre.pdf img/membrete.png \
  https://github.com/DavidAElizarrarazG/cacaopass
rm sin_membrete.pdf
