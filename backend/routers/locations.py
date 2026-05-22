from fastapi import APIRouter, Depends, status

from database import db_cursor
from models.schemas import LocationCreateRequest, LocationUpdateRequest
from routers.common import clean_string, fail, fetch_default_route_id, get_current_user, ok

router = APIRouter(prefix="/api/locations", tags=["locations"])


@router.post("/create")
def create_location(payload: LocationCreateRequest, user: dict = Depends(get_current_user)):
    referencia = clean_string(payload.nombre_referencia, 255)
    descripcion = clean_string(payload.descripcion_direccion, 2000)
    errors = {}
    if referencia == "":
        errors["nombre_referencia"] = "La referencia es obligatoria."
    if descripcion == "":
        errors["descripcion_direccion"] = "La descripcion es obligatoria."
    if payload.latitud < -90 or payload.latitud > 90 or payload.longitud < -180 or payload.longitud > 180:
        errors["ubicacion"] = "Coordenadas invalidas."
    if errors:
        fail("Revisa los campos.", status.HTTP_422_UNPROCESSABLE_ENTITY, errors)

    with db_cursor(commit=True) as cursor:
        cursor.execute(
            """
            INSERT INTO ubicaciones_servicio (usuario_id, nombre_referencia, latitud, longitud, descripcion_direccion)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING ubicacion_id
            """,
            (user["usuario_id"], referencia, payload.latitud, payload.longitud, descripcion),
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
            (user["usuario_id"], location_id, route_id),
        )

    return ok({"ubicacion_id": location_id}, "Nueva ruta y ubicacion registradas.")


@router.post("/{location_id}/update")
def update_location(location_id: int, payload: LocationUpdateRequest, user: dict = Depends(get_current_user)):
    referencia = clean_string(payload.nombre_referencia, 255)
    descripcion = clean_string(payload.descripcion_direccion, 2000)

    with db_cursor(commit=True) as cursor:
        cursor.execute(
            "SELECT ubicacion_id FROM ubicaciones_servicio WHERE ubicacion_id = %s AND usuario_id = %s",
            (location_id, user["usuario_id"]),
        )
        if not cursor.fetchone():
            fail("No tienes permisos para esta ubicacion.", status.HTTP_403_FORBIDDEN)

        cursor.execute(
            """
            UPDATE ubicaciones_servicio
            SET nombre_referencia = %s, descripcion_direccion = %s
            WHERE ubicacion_id = %s
            """,
            (referencia or "Ubicacion", descripcion, location_id),
        )

    return ok({}, "Ubicacion actualizada.")
