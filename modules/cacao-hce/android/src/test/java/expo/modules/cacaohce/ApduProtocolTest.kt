package expo.modules.cacaohce

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ApduProtocolTest {
  // Exactamente el arreglo selectApp[] de ScannerHTTP.ino
  private val firmwareSelect = bytes(0x00, 0xA4, 0x04, 0x00, 0x05, 0xF0, 0x12, 0x34, 0x56, 0x78, 0x00)

  private fun bytes(vararg values: Int) = ByteArray(values.size) { values[it].toByte() }

  // Lo que hace el firmware: memcpy de los 4 bytes a un uint32_t en un procesador little-endian.
  private fun firmwareReadsId(response: ByteArray): Long =
    (0 until 4).fold(0L) { acc, i -> acc or ((response[i].toLong() and 0xFF) shl (8 * i)) }

  @Test
  fun reconoceElSelectDelFirmware() {
    assertTrue(ApduProtocol.isSelectAid(firmwareSelect))
  }

  @Test
  fun ignoraOtroAid() {
    assertFalse(ApduProtocol.isSelectAid(bytes(0x00, 0xA4, 0x04, 0x00, 0x05, 0xF0, 0x00, 0x00, 0x00, 0x01, 0x00)))
  }

  @Test
  fun respondeNumeroDeUsuarioEnLittleEndianMas9000() {
    val response = ApduProtocol.respond(firmwareSelect, 220437, littleEndian = true)
    assertArrayEquals(bytes(0x15, 0x5D, 0x03, 0x00, 0x90, 0x00), response)
  }

  @Test
  fun elFirmwareLeeElMismoNumeroQueSeEnvio() {
    for (id in listOf(1, 3004, 111, 220437, 221320, 0x7FFFFFFF)) {
      val response = ApduProtocol.respond(firmwareSelect, id, littleEndian = true)
      assertEquals(id.toLong(), firmwareReadsId(response))
      // El firmware reserva userId[3] = 0xFE y 0xDE para la app de ejemplo del profesor.
      assertTrue(response[3] != 0xFE.toByte() && response[3] != 0xDE.toByte())
    }
  }

  @Test
  fun bigEndianSeLeeVolteadoEnElEsp32() {
    val response = ApduProtocol.respond(firmwareSelect, 220437, littleEndian = false)
    assertArrayEquals(bytes(0x00, 0x03, 0x5D, 0x15, 0x90, 0x00), response)
    assertEquals(358_417_152L, firmwareReadsId(response))
  }

  @Test
  fun sinCredencialRechazaCon6985() {
    assertArrayEquals(bytes(0x69, 0x85), ApduProtocol.respond(firmwareSelect, null, littleEndian = true))
  }

  @Test
  fun comandoNuloYComandoDesconocido() {
    assertArrayEquals(bytes(0x6F, 0x00), ApduProtocol.respond(null, 220437, littleEndian = true))
    assertArrayEquals(bytes(0x6D, 0x00), ApduProtocol.respond(bytes(0x00, 0xB0, 0x00, 0x00, 0x00), 220437, littleEndian = true))
  }
}
