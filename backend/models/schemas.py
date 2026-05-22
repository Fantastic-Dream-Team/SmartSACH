from typing import Optional

from pydantic import BaseModel


class LoginRequest(BaseModel):
    correo: str
    password: str


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    cedula: str
    correo: str
    telefono: Optional[str] = ""
    password: str
    confirmPassword: str
    direccion: str
    descripcion: str
    latitud: float
    longitud: float


class ForgotPasswordRequest(BaseModel):
    correo: str


class ProfileUpdateRequest(BaseModel):
    nombre: str
    apellido: str
    telefono: Optional[str] = ""


class LocationCreateRequest(BaseModel):
    nombre_referencia: str
    descripcion_direccion: str
    latitud: float
    longitud: float


class LocationUpdateRequest(BaseModel):
    nombre_referencia: Optional[str] = ""
    descripcion_direccion: Optional[str] = ""


class PaymentRequest(BaseModel):
    suscripcion_id: int
    metodo_pago: Optional[str] = "Pago web"


class ReportCreateRequest(BaseModel):
    ubicacion_id: int
    tipo_incidencia: Optional[str] = "otro"
    descripcion: str
