from fastapi import APIRouter, Depends, status

from database import db_cursor
from models.schemas import ProfileUpdateRequest
from routers.common import account_summary, clean_string, fail, get_current_user, ok, user_locations_with_routes, validate_phone

router = APIRouter(prefix="/api", tags=["profile"])


@router.get("/dashboard/overview")
def dashboard_overview(user: dict = Depends(get_current_user)):
    user_id = int(user["usuario_id"])
    summary = account_summary(user_id)

    with db_cursor() as cursor:
        cursor.execute(
            """
            SELECT
                s.suscripcion_id,
                s.proximo_vencimiento,
                s.estado_pago,
                s.estado_suscripcion,
                s.monto_mensual,
                r.ruta_id,
                r.nombre_ruta,
                r.zona_sector,
                r.horario_estimado,
                u.ubicacion_id,
                u.nombre_referencia,
                u.latitud,
                u.longitud,
                c.camion_id,
                c.placa_vehiculo,
                c.latitud AS camion_latitud,
                c.longitud AS camion_longitud,
                c.ultima_actualizacion
            FROM suscripciones s
            JOIN rutas r ON r.ruta_id = s.ruta_id
            JOIN ubicaciones_servicio u ON u.ubicacion_id = s.ubicacion_id
            LEFT JOIN camiones_rastreo c ON c.ruta_id = s.ruta_id
            WHERE s.usuario_id = %s AND s.estado_suscripcion = 'activa'
            ORDER BY s.proximo_vencimiento ASC
            """,
            (user_id,),
        )
        routes = cursor.fetchall()

        route_points = []
        if routes and routes[0].get("ruta_id"):
            cursor.execute(
                """
                SELECT secuencia, latitud, longitud
                FROM rutas_puntos
                WHERE ruta_id = %s
                ORDER BY secuencia ASC
                """,
                (routes[0]["ruta_id"],),
            )
            route_points = cursor.fetchall()

    return ok({"user": user, "summary": summary, "routes": routes, "route_points": route_points})


@router.get("/profile")
def profile(user: dict = Depends(get_current_user)):
    user_id = int(user["usuario_id"])
    return ok({"user": user, "locations": user_locations_with_routes(user_id), "summary": account_summary(user_id)})


@router.post("/profile/update")
def update_profile(payload: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    nombre = clean_string(payload.nombre, 50)
    apellido = clean_string(payload.apellido, 50)
    telefono = clean_string(payload.telefono, 20)
    errors = {}
    if nombre == "":
        errors["nombre"] = "El nombre es obligatorio."
    if apellido == "":
        errors["apellido"] = "El apellido es obligatorio."
    if not validate_phone(telefono):
        errors["telefono"] = "Telefono invalido."
    if errors:
        fail("Revisa los campos.", status.HTTP_422_UNPROCESSABLE_ENTITY, errors)

    with db_cursor(commit=True) as cursor:
        cursor.execute(
            "UPDATE usuarios SET nombre = %s, apellido = %s, telefono = %s WHERE usuario_id = %s",
            (nombre, apellido, telefono or None, user["usuario_id"]),
        )
    return ok({}, "Perfil actualizado correctamente.")
