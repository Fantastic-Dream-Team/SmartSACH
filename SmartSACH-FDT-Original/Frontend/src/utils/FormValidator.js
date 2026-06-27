// src/utils/FormValidator.js
//
// Clase base de validación de formularios.
// Aplica:
//   - Encapsulamiento: #errores es un campo privado, solo accesible
//     mediante los métodos públicos de la clase (getErrores, tieneErrores).
//   - Constructor: inicializa el estado interno de la instancia.
//   - Tipos de datos / conversión de tipos: normaliza valores antes de
//     validarlos (String(), trim()) para no asumir que siempre llega
//     el tipo esperado desde un <input>.
//   - Funciones: cada regla de validación vive en su propio método.

export class FormValidator {
  // Campo privado (encapsulamiento real, no por convención de nombre)
  #errores;

  constructor() {
    this.#errores = {};
  }

  // ----- Encapsulamiento: acceso controlado al estado interno -----
  getErrores() {
    return { ...this.#errores }; // copia, no la referencia interna
  }

  tieneErrores() {
    return Object.keys(this.#errores).length > 0;
  }

  // Solo las subclases (y la propia clase) pueden registrar errores;
  // no se expone #errores directamente fuera de la clase.
  _registrarError(campo, mensaje) {
    this.#errores[campo] = mensaje;
  }

  _limpiarErrores() {
    this.#errores = {};
  }

  // ----- Reglas básicas reutilizables -----

  // Conversión de tipos: fuerza el valor a string antes de operar,
  // sin importar qué tipo llegue realmente desde el formulario.
  _normalizarTexto(valor) {
    return String(valor ?? "").trim();
  }

  _campoRequerido(valor, nombreCampo) {
    const texto = this._normalizarTexto(valor);
    if (texto.length === 0) {
      this._registrarError(nombreCampo, `${nombreCampo} es obligatorio.`);
      return false;
    }
    return true;
  }

  _longitudMinima(valor, nombreCampo, minimo) {
    const texto = this._normalizarTexto(valor);
    // Operador de comparación + expresión booleana
    if (texto.length < minimo) {
      this._registrarError(
        nombreCampo,
        `${nombreCampo} debe tener al menos ${minimo} caracteres.`
      );
      return false;
    }
    return true;
  }
}