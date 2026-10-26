# CacaoPass

Credencial digital de acceso a planta para una fábrica de chocolates. App cliente del sistema de acceso físico
con **NFC (HCE + APDU)**, **Arduino Nano ESP32 + PN532** y un servidor web, hecha con **React Native**, **Expo** (SDK 57)
y un módulo nativo en **Kotlin**.
Práctica de Aplicaciones Móviles, Facultad de Ingeniería, Universidad La Salle México.

**Equipo:** David Alejandro Elizarraraz García (220437) y Diego Sastre Villaseñor (221320).
**Docente:** Felipe Mandujano Gómez.

## Qué hace
1. **Acceso** con usuario y contraseña contra la API de Monsterball Go (`POST /api/login`, contraseña en SHA-256).
2. **Credencial**: foto de perfil, nombre completo y número de usuario. La sesión se recuerda (sin la contraseña).
3. **NFC**: al acercar el teléfono al escáner, el servicio `CacaoApduService` contesta el `SELECT AID F0 12 34 56 78`
   con el número de usuario en 4 bytes + `90 00`. El teléfono vibra y la credencial muestra «Lector detectado».
   La app no sabe ni muestra si se concedió el acceso: eso lo decide el escáner con el servidor.
4. **Créditos**: equipo, grupo, fecha y tecnologías con su logotipo oficial.

### Orden de los bytes
El firmware (`ScannerHTTP.ino`) copia los 4 bytes recibidos con `memcpy` a un `uint32_t` del ESP32, que es
*little-endian*. Por eso la app manda el byte menos significativo primero: el usuario 220437 (`0x00035D15`) viaja como
`15 5D 03 00`. En «Detalles técnicos» se puede cambiar a big-endian si el firmware cambia.

## Configuración
Crea `.env.local` (no se sube a git) con el token de la API que se da en clase:
```bash
cp .env.example .env.local
```
Para cambiar la foto de perfil de un integrante con la API (`POST /api/setpfp`, JPG o PNG de máximo 2 MB):
```bash
tools/cambiar_foto.sh 220437 foto.jpg
```

## Ejecutar
Necesita una *development build* (Expo Go no incluye el módulo NFC propio). Con JDK 17 y el SDK de Android:
```bash
npm install
npx expo run:android                     # emulador o teléfono por USB; levanta Metro
npx expo run:android --variant release   # APK independiente para la demostración
```
El emulador no tiene NFC: ahí la credencial avisa «Este dispositivo no tiene NFC» y el botón
«Probar respuesta APDU» muestra los bytes que se enviarían al lector.

```bash
npx tsc --noEmit     # revisión de tipos
npx expo lint        # lint
```

## Estructura
| Ruta | Contenido |
|---|---|
| `src/app/` | Pantallas (Expo Router): `index` (acceso), `credencial`, `creditos` y `_layout` |
| `src/api/monsterball.ts` | Inicio de sesión y clasificación de errores |
| `src/session.tsx` | Sesión recordada con `expo-secure-store` y entrega del ID al servicio HCE |
| `modules/cacao-hce/` | Módulo nativo: `CacaoApduService` (HCE), `ApduProtocol`, `CacaoHceModule` y el AID en `res/xml` |
| `src/data/` | Equipo, curso, tech stack y logotipos (generados con `tools/extract-logos.mjs`) |
| `src/theme.ts`, `src/styles.ts` | Paleta y estilos reutilizables |
| `tools/make_icons.swift` | Dibuja el logotipo y los íconos |
