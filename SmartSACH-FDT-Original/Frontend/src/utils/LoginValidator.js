// src/utils/LoginValidator.js
//
// Hereda de FormValidator y agrega las reglas específicas del login.
// Aplica:
//   - Herencia: extends FormValidator + super() en el constructor.
//   - Constantes: reglas fijas que no deberían cambiar en tiempo de ejecución.
//   - Operadores y expresiones: regex + comparaciones en la validación de correo.
//   - Uso de funciones de JS: String.prototype.trim(), RegExp.prototype.test().

import { FormValidator } from "./FormValidator.js";

// Constantes del módulo: reglas fijas de negocio
const LONGITUD_MINIMA_PASSWORD = 6;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LoginValidator extends FormValidator {
  constructor() {
    super(); // inicializa el estado privado (#errores) de la clase padre
  }

  // ----- Regla propia: formato de correo -----
  _correoValido(correo) {
    const texto = this._normalizarTexto(correo);
    if (!PATRON_CORREO.test(texto)) {
      this._registrarError("correo", "Ingresa un correo electrónico válido.");
      return false;
    }
    return true;
  }

  // Método público principal: valida todo el formulario de login.
  // Devuelve true/false (tipo de dato boolean explícito) según el resultado.
  validar({ correo, password }) {
    this._limpiarErrores();

    const correoOk = this._campoRequerido(correo, "correo") && this._correoValido(correo);
    const passwordOk =
      this._campoRequerido(password, "password") &&
      this._longitudMinima(password, "password", LONGITUD_MINIMA_PASSWORD);

    // Operador lógico AND: el formulario es válido solo si ambos campos lo son
    return correoOk && passwordOk;
  }
}