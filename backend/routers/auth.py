from fastapi import APIRouter, Depends, Response, status

from database import db_cursor
from models.schemas import ForgotPasswordRequest, LoginRequest, RegisterRequest
from routers.common import (
    clean_string,
    clear_auth_cookie,
    create_access_token,
    fail,
    fetch_default_route_id,
    get_current_user,
    hash_password,
    ok,
    set_auth_cookie,
    validate_cedula,
    validate_email,
    validate_password_strength,
    validate_phone,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
def register(payload: RegisterRequest, response: Response):
    nombre = clean_string(payload.nombre, 50)
    apellido = clean_string(payload.apellido, 50)
    cedula = clean_string(payload.cedula, 20).upper()
    correo = clean_string(payload.correo, 100).lower()
    telefono = clean_string(payload.telefono, 20)
    direccion = clean_string(payload.direccion, 255)
    descripcion = clean_string(payload.descripcion, 2000)
    latitud = payload.latitud
    longitud = payload.longitud

    errors = {}
    for field, value in {
        "nombre": nombre,
        "apellido": apellido,
        "cedula": cedula,
        "correo": correo,
        "direccion": direccion,
        "descripcion": descripcion,
    }.items():
        if value == "":
            errors[field] = "Este campo es obligatorio."
    if not validate_cedula(cedula):
        errors["cedula"] = "Cedula invalida. Usa un formato como 4-826-1202."
    if not validate_email(correo):
        errors["correo"] = "Correo electronico invalido."
    if not validate_phone(telefono):
        errors["telefono"] = "Telefono invalido."
    if payload.password != payload.confirmPassword:
        errors["confirmPassword"] = "Las contrasenas no coinciden."
    password_error = validate_password_strength(payload.password)
    if password_error:
        errors["password"] = password_error
    if latitud < -90 or latitud > 90 or longitud < -180 or longitud > 180:
        errors["ubicacion"] = "Selecciona una ubicacion valida en el mapa."
    if errors:
        fail("Revisa los campos marcados.", status.HTTP_422_UNPROCESSABLE_ENTITY, errors)

    with db_cursor(commit=True) as cursor:
        cursor.execute(
            """
            SELECT correo_electronico, cedula
            FROM usuarios
            WHERE correo_electronico = %s OR cedula = %s
            LIMIT 1
            """,
            (correo, cedula),
        )
        duplicate = cursor.fetchone()
        if duplicate:
            errors = {}
            if duplicate.get("correo_electronico") == correo:
                errors["correo"] = "Este correo ya esta registrado."
            if duplicate.get("cedula") == cedula:
                errors["cedula"] = "Esta cedula ya esta registrada."
            fail("Ya existe una cuenta con estos datos.", status.HTTP_409_CONFLICT, errors)

        cursor.execute(
            """
            INSERT INTO usuarios (nombre, apellido, cedula, correo_electronico, telefono, password, estado_verificacion)
            VALUES (%s, %s, %s, %s, %s, %s, 'activo')
            RETURNING usuario_id
            """,
            (nombre, apellido, cedula, correo, telefono or None, hash_password(payload.password)),
        )
        user_id = int(cursor.fetchone()["usuario_id"])

        cursor.execute(
            """
            INSERT INTO ubicaciones_servicio (usuario_id, nombre_referencia, latitud, longitud, descripcion_direccion)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING ubicacion_id
            """,
            (user_id, direccion, latitud, longitud, descripcion),
        )
        location_id = int(cursor.fetchone()["ubicacion_id"])

        route_id = fetch_default_route_id(cursor)
        cursor.execute(
            """
            INSERT INTO suscripciones (
                usuario_id, ubicacion_id, ruta_id, fecha_activacion, proximo_vencimiento,
                estado_pago, estado_suscripcion, monto_mensual
            )
            VALUES (%s, %s, %s, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'al_dia', 'activa', 10.00)
            """,
            (user_id, location_id, route_id),
        )

    token = create_access_token(user_id)
    set_auth_cookie(response, token)
    return ok(
        {
            "token": token,
            "token_type": "bearer",
            "user": {
                "usuario_id": user_id,
                "nombre": nombre,
                "apellido": apellido,
                "correo_electronico": correo,
                "telefono": telefono,
            },
        },
        "Cuenta creada correctamente.",
    )


@router.post("/login")
def login(payload: LoginRequest, response: Response):
    correo = clean_string(payload.correo, 100).lower()
    if not validate_email(correo) or payload.password == "":
        fail("Correo o contrasena invalidos.", status.HTTP_422_UNPROCESSABLE_ENTITY)

    with db_cursor() as cursor:
        cursor.execute(
            """
            SELECT usuario_id, nombre, apellido, cedula, correo_electronico, telefono, password, estado_verificacion
            FROM usuarios
            WHERE correo_electronico = %s
            LIMIT 1
            """,
            (correo,),
        )
        user = cursor.fetchone()

    if not user or not verify_password(payload.password, user["password"]):
        fail("Correo o contrasena incorrectos.", status.HTTP_401_UNAUTHORIZED)

    token = create_access_token(int(user["usuario_id"]))
    set_auth_cookie(response, token)
    user.pop("password", None)
    return ok({"token": token, "token_type": "bearer", "user": user}, "Bienvenido a SmartSACH.")


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return ok({"user": user})


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return ok({}, "Sesion cerrada.")


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    correo = clean_string(payload.correo, 100).lower()
    if not validate_email(correo):
        fail("Ingresa un correo valido.", status.HTTP_422_UNPROCESSABLE_ENTITY)
    return ok({}, "Si el correo existe, recibiras instrucciones para recuperar tu contrasena.")
