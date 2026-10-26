// Dibuja el logotipo de CacaoPass (barra de chocolate + ondas NFC doradas) y genera los íconos de la app.
// Uso: swift tools/make_icons.swift assets/images
import AppKit
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "assets/images"

func rgb(_ hex: UInt32, _ a: CGFloat = 1) -> CGColor {
  CGColor(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255,
          blue: CGFloat(hex & 0xFF) / 255, alpha: a)
}

let BG = rgb(0x2A1B14), BG_DEEP = rgb(0x1B110C), GOLD = rgb(0xD9A441)
let BAR = rgb(0x6B3E26), FACE = rgb(0x7A472C), LIGHT = rgb(0x9A5E3B), SHADOW = rgb(0x46271A)

func canvas(_ size: Int, _ draw: (CGContext, CGFloat) -> Void) -> CGImage {
  let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0,
                      space: CGColorSpace(name: CGColorSpace.sRGB)!,
                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  // Origen arriba a la izquierda y unidades de un lienzo de 1024 px.
  ctx.translateBy(x: 0, y: CGFloat(size))
  ctx.scaleBy(x: CGFloat(size) / 1024, y: -CGFloat(size) / 1024)
  draw(ctx, CGFloat(size) / 1024)
  return ctx.makeImage()!
}

func save(_ image: CGImage, _ name: String) {
  let url = URL(fileURLWithPath: "\(out)/\(name)")
  let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, image, nil)
  CGImageDestinationFinalize(dest)
  print("\(name) \(image.width)x\(image.height)")
}

func roundedRect(_ ctx: CGContext, _ r: CGRect, _ radius: CGFloat, _ color: CGColor) {
  ctx.addPath(CGPath(roundedRect: r, cornerWidth: radius, cornerHeight: radius, transform: nil))
  ctx.setFillColor(color)
  ctx.fillPath()
}

// Motivo centrado en el área segura de los íconos adaptables (círculo de 676 px).
func motif(_ ctx: CGContext, mono: CGColor? = nil) {
  let bar = CGRect(x: 250, y: 300, width: 310, height: 424)
  roundedRect(ctx, bar, 40, mono ?? BAR)
  // 2 x 3 cuadros con relieve: luz arriba-izquierda, sombra abajo-derecha.
  let pad: CGFloat = 26, gap: CGFloat = 18
  let w = (bar.width - pad * 2 - gap) / 2, h = (bar.height - pad * 2 - gap * 2) / 3
  for row in 0..<3 {
    for col in 0..<2 {
      let cell = CGRect(x: bar.minX + pad + CGFloat(col) * (w + gap),
                        y: bar.minY + pad + CGFloat(row) * (h + gap), width: w, height: h)
      if let mono {
        ctx.setBlendMode(.clear)
        roundedRect(ctx, cell.insetBy(dx: 10, dy: 10), 14, mono)
        ctx.setBlendMode(.normal)
      } else {
        roundedRect(ctx, cell.offsetBy(dx: 6, dy: 6), 16, SHADOW)
        roundedRect(ctx, cell.offsetBy(dx: -4, dy: -4), 16, LIGHT)
        roundedRect(ctx, cell.insetBy(dx: 6, dy: 6), 12, FACE)
      }
    }
  }
  // Ondas NFC saliendo del costado derecho de la barra.
  ctx.setStrokeColor(mono ?? GOLD)
  ctx.setLineWidth(38)
  ctx.setLineCap(.round)
  let center = CGPoint(x: 590, y: 512)
  for radius in [92.0, 156.0, 220.0] as [CGFloat] {
    ctx.addArc(center: center, radius: radius, startAngle: -.pi / 4.2, endAngle: .pi / 4.2, clockwise: false)
    ctx.strokePath()
  }
}

func badge(_ ctx: CGContext) {
  roundedRect(ctx, CGRect(x: 0, y: 0, width: 1024, height: 1024), 230, BG)
  roundedRect(ctx, CGRect(x: 28, y: 28, width: 968, height: 968), 205, BG_DEEP)
  ctx.setStrokeColor(GOLD)
  ctx.setLineWidth(10)
  ctx.addPath(CGPath(roundedRect: CGRect(x: 60, y: 60, width: 904, height: 904), cornerWidth: 180, cornerHeight: 180, transform: nil))
  ctx.strokePath()
  motif(ctx)
}

save(canvas(1024) { ctx, _ in
  ctx.setFillColor(BG_DEEP); ctx.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024)); motif(ctx)
}, "icon.png")
save(canvas(1024) { ctx, _ in motif(ctx) }, "android-icon-foreground.png")
save(canvas(1024) { ctx, _ in ctx.setFillColor(BG_DEEP); ctx.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024)) }, "android-icon-background.png")
save(canvas(1024) { ctx, _ in motif(ctx, mono: rgb(0xFFFFFF)) }, "android-icon-monochrome.png")
save(canvas(1024) { ctx, _ in motif(ctx) }, "splash-icon.png")
save(canvas(512) { ctx, _ in badge(ctx) }, "logo.png")
save(canvas(48) { ctx, _ in badge(ctx) }, "favicon.png")
