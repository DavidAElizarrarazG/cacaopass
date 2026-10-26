package expo.modules.cacaohce

// Puente entre el servicio y el módulo de Expo. Ambos viven en el mismo proceso, así que basta
// un listener estático; si la app está cerrada no hay listener y el único aviso es la vibración.
object HceEvents {
  var listener: ((name: String, body: Map<String, Any?>) -> Unit)? = null

  fun emit(name: String, body: Map<String, Any?>) {
    listener?.invoke(name, body)
  }
}
