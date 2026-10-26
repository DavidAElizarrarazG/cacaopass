package expo.modules.cacaohce

// Lógica pura del protocolo APDU, separada del servicio para poder revisarla sin un lector NFC.
object ApduProtocol {
  // AID de la credencial: el mismo que manda el firmware ScannerHTTP.ino en su comando SELECT
  val AID = byteArrayOf(0xF0.toByte(), 0x12, 0x34, 0x56, 0x78)

  // Palabras de estado (SW1 SW2) definidas en ISO/IEC 7816-4
  val SW_OK = byteArrayOf(0x90.toByte(), 0x00)
  val SW_NO_PRECISE_DIAGNOSIS = byteArrayOf(0x6F, 0x00)
  val SW_CONDITIONS_NOT_SATISFIED = byteArrayOf(0x69, 0x85.toByte())
  val SW_INS_NOT_SUPPORTED = byteArrayOf(0x6D, 0x00)

  // SELECT por nombre: CLA=00 INS=A4 P1=04 P2=00 Lc=05 seguido del AID (Le opcional al final)
  fun isSelectAid(apdu: ByteArray): Boolean {
    if (apdu.size < 5 + AID.size) return false
    val header = apdu[0] == 0x00.toByte() && apdu[1] == 0xA4.toByte() && apdu[2] == 0x04.toByte()
    val lc = apdu[4].toInt() and 0xFF
    return header && lc == AID.size && apdu.copyOfRange(5, 5 + AID.size).contentEquals(AID)
  }

  // El firmware copia los 4 bytes con memcpy a un uint32_t del ESP32, que es little-endian:
  // para que el lector lea 220437 (0x00035D15) hay que mandar 15 5D 03 00.
  fun userIdToBytes(userId: Int, littleEndian: Boolean): ByteArray {
    val bigEndian = byteArrayOf(
      (userId shr 24).toByte(),
      (userId shr 16).toByte(),
      (userId shr 8).toByte(),
      userId.toByte()
    )
    return if (littleEndian) bigEndian.reversedArray() else bigEndian
  }

  // Respuesta = 4 bytes del número de usuario + 90 00. Sin credencial cargada se rechaza con 69 85.
  fun respond(apdu: ByteArray?, userId: Int?, littleEndian: Boolean): ByteArray = when {
    apdu == null -> SW_NO_PRECISE_DIAGNOSIS
    !isSelectAid(apdu) -> SW_INS_NOT_SUPPORTED
    userId == null -> SW_CONDITIONS_NOT_SATISFIED
    else -> userIdToBytes(userId, littleEndian) + SW_OK
  }

  fun toHex(bytes: ByteArray): String = bytes.joinToString(" ") { "%02X".format(it) }
}
