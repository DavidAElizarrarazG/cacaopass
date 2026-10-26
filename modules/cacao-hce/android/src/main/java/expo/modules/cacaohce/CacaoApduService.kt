package expo.modules.cacaohce

import android.content.Context
import android.nfc.cardemulation.HostApduService
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log

private const val TAG = "CacaoHce"

// Android solo entrega APDUs a este servicio después de que el lector selecciona el AID
// registrado en cacao_apduservice.xml; por eso aquí únicamente contestamos ese SELECT.
class CacaoApduService : HostApduService() {
  override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
    val store = CredentialStore(this)
    val userId = store.userId
    val response = ApduProtocol.respond(commandApdu, userId, store.littleEndian)
    Log.d(TAG, "APDU IN: ${commandApdu?.let(ApduProtocol::toHex)} OUT: ${ApduProtocol.toHex(response)}")

    if (commandApdu != null && ApduProtocol.isSelectAid(commandApdu)) {
      vibrate()
      HceEvents.emit(
        "onReaderDetected",
        mapOf(
          "credentialSent" to (userId != null),
          "response" to ApduProtocol.toHex(response),
          "timestamp" to System.currentTimeMillis().toDouble()
        )
      )
    }
    return response
  }

  override fun onDeactivated(reason: Int) {
    Log.d(TAG, "onDeactivated reason=$reason")
    val why = if (reason == DEACTIVATION_LINK_LOSS) "linkLoss" else "deselected"
    HceEvents.emit("onReaderLost", mapOf("reason" to why))
  }

  private fun vibrate() {
    val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      (getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }
    vibrator.vibrate(VibrationEffect.createOneShot(120, VibrationEffect.DEFAULT_AMPLITUDE))
  }
}
