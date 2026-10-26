package expo.modules.cacaohce

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.nfc.NfcAdapter
import android.nfc.cardemulation.CardEmulation
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val AID = "F012345678"

class CacaoHceModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()
  private val store: CredentialStore
    get() = CredentialStore(context)
  private val nfcAdapter: NfcAdapter?
    get() = NfcAdapter.getDefaultAdapter(context)
  private val serviceComponent: ComponentName
    get() = ComponentName(context, CacaoApduService::class.java)

  override fun definition() = ModuleDefinition {
    Name("CacaoHce")

    Events("onReaderDetected", "onReaderLost")

    OnCreate {
      HceEvents.listener = { name, body -> sendEvent(name, body) }
    }

    OnDestroy {
      HceEvents.listener = null
    }

    // Con la app al frente, Android prefiere nuestro servicio sobre otras apps con el mismo AID
    // (por ejemplo, la app de ejemplo del profesor instalada en el mismo teléfono).
    OnActivityEntersForeground {
      setPreferred(true)
    }

    OnActivityEntersBackground {
      setPreferred(false)
    }

    Function("getStatus") {
      val adapter = nfcAdapter
      mapOf(
        "hasNfc" to (adapter != null),
        "nfcEnabled" to (adapter?.isEnabled == true),
        "hasHce" to context.packageManager.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION),
        "isDefaultForAid" to isDefaultForAid()
      )
    }

    Function("setCredential") { userId: Int -> store.userId = userId }
    Function("clearCredential") { store.userId = null }
    Function("getCredential") { store.userId }

    Function("setLittleEndian") { littleEndian: Boolean -> store.littleEndian = littleEndian }
    Function("isLittleEndian") { store.littleEndian }

    // Contesta un SELECT idéntico al del firmware con la misma lógica que el servicio.
    // Sirve para revisar los bytes en el emulador, que no tiene NFC.
    Function("simulateSelect") {
      val select = byteArrayOf(0x00, 0xA4.toByte(), 0x04, 0x00, ApduProtocol.AID.size.toByte()) +
        ApduProtocol.AID + byteArrayOf(0x00)
      mapOf(
        "command" to ApduProtocol.toHex(select),
        "response" to ApduProtocol.toHex(ApduProtocol.respond(select, store.userId, store.littleEndian))
      )
    }

    Function("openNfcSettings") {
      val intent = Intent(Settings.ACTION_NFC_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }
  }

  // CardEmulation.getInstance lanza excepción en equipos sin HCE, de ahí los try.
  private fun isDefaultForAid(): Boolean = try {
    val adapter = nfcAdapter
    adapter != null && CardEmulation.getInstance(adapter).isDefaultServiceForAid(serviceComponent, AID)
  } catch (e: Exception) {
    false
  }

  private fun setPreferred(preferred: Boolean) {
    val activity = appContext.currentActivity ?: return
    val adapter = nfcAdapter ?: return
    try {
      val emulation = CardEmulation.getInstance(adapter)
      if (preferred) emulation.setPreferredService(activity, serviceComponent)
      else emulation.unsetPreferredService(activity)
    } catch (e: Exception) {
      // Sin HCE o con la actividad fuera de primer plano no hay preferencia que fijar.
    }
  }
}
