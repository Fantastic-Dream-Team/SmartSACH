import os
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import db_cursor, serialize

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY") or "change-me-in-production"
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
TOKEN_COOKIE_NAME = os.getenv("TOKEN_COOKIE_NAME", "smartsach_token")


def ok(data: Any = None, message: Optional[str] = None) -> dict:
    payload = {"ok": True, "data": serialize(data)}
    if message:
        payload["message"] = message
    return payload


def fail(message: str, status_code: int = 400, errors: Optional[dict] = None) -> None:
    detail = {"ok": False, "message": message}
    if errors:
        detail["errors"] = errors
    raise HTTPException(status_code=status_code, detail=detail)


def clean_string(value: Any, max_length: int = 255) -> str:
    text = str(value or "").strip()
    text = re.sub(r"[\x00-\x1F\x7F]", "", text)
    return text[:max_length]


def validate_password_strength(password: str) -> Optional[str]:
    if len(password) < 8:
        return "La contrasena debe tener minimo 8 caracteres."
    if not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password) or not re.search(r"\d", password):
        return "La contrasena debe incluir mayusculas, minusculas y numeros."
    return None


def validate_cedula(cedula: str) -> bool:
    return bool(re.match(r"^[A-Z0-9]{1,3}-?\d{1,4}-?\d{1,6}$", cedula, re.IGNORECASE))


def validate_phone(phone: str) -> bool:
    return phone == "" or bool(re.match(r"^\+?[0-9\-\s]{7,20}$", phone))


def validate_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def create_access_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expires}, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        TOKEN_COOKIE_NAME,
        token,
        max_age=JWT_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=os.getenv("COOKIE_SECURE", "true").lower() in {"1", "true", "yes", "on"},
        samesite=os.getenv("COOKIE_SAMESITE", "none"),
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(TOKEN_COOKIE_NAME, path="/")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    token_cookie: Optional[str] = Cookie(default=None, alias=TOKEN_COOKIE_NAME),
) -> dict:
    token = credentials.credentials if credentials else token_cookie
    if not token:
        fail("Debes iniciar sesion.", status.HTTP_401_UNAUTHORIZED)

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        fail("La sesion ya no es valida.", status.HTTP_401_UNAUTHORIZED)

    with db_cursor() as cursor:
        cursor.execute(
            """
            SELECT usuario_id, nombre, apellido, cedula, correo_electronico,
                   telefono, estado_verificacion, fecha_registro
            FROM usuarios
            WHERE usuario_id = %s
            """,
            (user_id,),
        )
        user = cursor.fetchone()

    if not user:
        fail("La sesion ya no es valida.", status.HTTP_401_UNAUTHORIZED)

    request.state.user = user
    return user


def fetch_default_route_id(cursor) -> int:
    cursor.execute("SELECT ruta_id FROM rutas WHERE estado_ruta = 'activa' ORDER BY ruta_id ASC LIMIT 1")
    row = cursor.fetchone()
    if row:
        return int(row["ruta_id"])

    cursor.execute(
        """
        INSERT INTO rutas (nombre_ruta, zona_sector, horario_estimado, estado_ruta)
        VALUES ('Ruta David Centro', 'David, Chiriqui', 'Lunes a sabado', 'activa')
        RETURNING ruta_id
        """
    )
    return int(cursor.fetchone()["ruta_id"])


def account_summary(user_id: int) -> dict:
    with db_cursor() as cursor:
        cursor.execute(
            """
            SELECT
                COUNT(*) FILTER (WHERE estado_suscripcion = 'activa') AS rutas_activas,
                COUNT(*) FILTER (WHERE proximo_vencimiento < CURRENT_DATE) AS suscripciones_morosas,
                COALESCE(SUM(CASE WHEN proximo_vencimiento < CURRENT_DATE THEN monto_mensual ELSE 0 END), 0) AS deuda_estimada,
                MIN(proximo_vencimiento) AS proximo_vencimiento
            FROM suscripciones
            WHERE usuario_id = %s
            """,
            (user_id,),
        )
        summary = cursor.fetchone() or {}

    return {
        "rutas_activas": int(summary.get("rutas_activas") or 0),
        "suscripciones_morosas": int(summary.get("suscripciones_morosas") or 0),
        "deuda_estimada": float(summary.get("deuda_estimada") or 0),
        "proximo_vencimiento": summary.get("proximo_vencimiento"),
    }


def user_locations_with_routes(user_id: int) -> list[dict]:
    with db_cursor() as cursor:
        cursor.execute(
            """
            SELECT
                u.ubicacion_id,
                u.nombre_referencia,
                u.latitud,
                u.longitud,
                u.descripcion_direccion,
                u.fecha_creacion,
                s.suscripcion_id,
                s.estado_suscripcion,
                s.estado_pago,
                s.proximo_vencimiento,
                s.monto_mensual,
                r.ruta_id,
                r.nombre_ruta,
                r.zona_sector,
                r.horario_estimado
            FROM ubicaciones_servicio u
            LEFT JOIN suscripciones s ON s.ubicacion_id = u.ubicacion_id AND s.usuario_id = u.usuario_id
            LEFT JOIN rutas r ON r.ruta_id = s.ruta_id
            WHERE u.usuario_id = %s
            ORDER BY u.fecha_creacion ASC
            """,
            (user_id,),
        )
        return cursor.fetchall()
