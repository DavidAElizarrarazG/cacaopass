// Pone el membrete de La Salle y el encabezado «PRACTICARIO | FACULTAD DE INGENIERÍA» debajo de cada página
// del PDF que genera Chrome, y vuelve a crear el enlace al repositorio.
// Uso: swift stamp_membrete.swift entrada.pdf salida.pdf img/membrete.png URL_REPO
import AppKit
import CoreText
import PDFKit

let args = CommandLine.arguments
let (src, out, letterhead, repo) = (args[1], args[2], args[3], args[4])
let input = PDFDocument(url: URL(fileURLWithPath: src))!
let image = NSImage(contentsOfFile: letterhead)!.cgImage(forProposedRect: nil, context: nil, hints: nil)!

let title = "PRACTICARIO | FACULTAD DE INGENIERÍA"
let font = CTFontCreateWithName("Helvetica-Bold" as CFString, 1, nil)
let unitWidth = CTLineGetTypographicBounds(
  CTLineCreateWithAttributedString(NSAttributedString(string: title, attributes: [.font: font])), nil, nil, nil)
// Mismo ancho que el encabezado de la plantilla (de x = 228 a x = 540 pt).
let size = min(18.0, 312.0 / unitWidth)
let titleLine = CTLineCreateWithAttributedString(NSAttributedString(string: title, attributes: [
  .font: CTFontCreateWithName("Helvetica-Bold" as CFString, size, nil),
  .foregroundColor: CGColor(red: 16 / 255, green: 29 / 255, blue: 97 / 255, alpha: 1),
]))

var mediaBox = CGRect(x: 0, y: 0, width: 612, height: 792)
let ctx = CGContext(URL(fileURLWithPath: out) as CFURL, mediaBox: &mediaBox, [
  kCGPDFContextTitle: "Práctica 4: Aplicación cliente de un sistema de acceso físico con NFC",
  kCGPDFContextAuthor: "David Alejandro Elizarraraz García; Diego Sastre Villaseñor",
  kCGPDFContextSubject: "Aplicaciones Móviles",
] as CFDictionary)!

for i in 0..<input.pageCount {
  let page = input.page(at: i)!
  ctx.beginPDFPage(nil)
  // Mismo rectángulo que en la práctica 3 (coordenadas con origen abajo a la izquierda).
  ctx.draw(image, in: CGRect(x: 40, y: 792 - 773.7, width: 532, height: 773.7 - 30.45))
  page.draw(with: .mediaBox, to: ctx)
  ctx.textPosition = CGPoint(x: 228, y: 792 - 62)
  CTLineDraw(titleLine, ctx)
  ctx.endPDFPage()
}
ctx.closePDF()

// Al redibujar las páginas se pierden los enlaces; se vuelve a crear el del repositorio.
let stamped = PDFDocument(url: URL(fileURLWithPath: out))!
for selection in stamped.findString(repo, withOptions: []) {
  for page in selection.pages {
    let link = PDFAnnotation(bounds: selection.bounds(for: page), forType: .link, withProperties: nil)
    link.url = URL(string: repo)
    page.addAnnotation(link)
  }
}
stamped.write(to: URL(fileURLWithPath: out))
print("páginas \(stamped.pageCount), tamaño del título \(String(format: "%.1f", size))")
