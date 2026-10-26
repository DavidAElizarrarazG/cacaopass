package expo.modules.cacaohce

import android.content.Context

// Lo que el servicio necesita para contestar vive en SharedPreferences, porque Android puede
// despertar al servicio aunque la parte de JavaScript no esté corriendo.
class CredentialStore(context: Context) {
  private val prefs = context.getSharedPreferences("cacao_hce", Context.MODE_PRIVATE)

  var userId: Int?
    get() = if (prefs.contains(KEY_USER_ID)) prefs.getInt(KEY_USER_ID, 0) else null
    set(value) {
      val editor = prefs.edit()
      if (value == null) editor.remove(KEY_USER_ID) else editor.putInt(KEY_USER_ID, value)
      editor.apply()
    }

  var littleEndian: Boolean
    get() = prefs.getBoolean(KEY_LITTLE_ENDIAN, true)
    set(value) = prefs.edit().putBoolean(KEY_LITTLE_ENDIAN, value).apply()

  private companion object {
    const val KEY_USER_ID = "user_id"
    const val KEY_LITTLE_ENDIAN = "little_endian"
  }
}
