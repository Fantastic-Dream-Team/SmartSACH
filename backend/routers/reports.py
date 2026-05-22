from fastapi import APIRouter, Depends, status

from database import db_cursor
from models.schemas import ReportCreateRequest
from routers.common import clean_string, fail, get_current_user, ok

router = APIRouter(prefix="/api", tags=["reports"])

ALLOWED_REPORT_TYPES = {"no_paso_camion", "mala_atencion", "desperdicio_en_via", "recomendacion", "otro"}


@router.post("/reports/create")
def create_report(payload: ReportCreateRequest, user: dict = Depends(get_current_user)):
    tipo = clean_string(payload.tipo_incidencia or "otro", 50)
    descripcion = clean_string(payload.descripcion, 2000)
    if tipo not in ALLOWED_REPORT_TYPES:
        tipo = "otro"
    if descripcion == "":
        fail("Describe tu reporte para poder enviarlo.", status.HTTP_422_UNPROCESSABLE_ENTITY)

    with db_cursor(commit=True) as cursor:
        cursor.execute(
            "SELECT ubicacion_id FROM ubicaciones_servicio WHERE ubicacion_id = %s AND usuario_id = %s",
            (payload.ubicacion_id, user["usuario_id"]),
        )
        if not cursor.fetchone():
            fail("Selecciona una ubicacion valida.", status.HTTP_422_UNPROCESSABLE_ENTITY)

        cursor.execute(
            """
            INSERT INTO reportes_servicio (usuario_id, ubicacion_id, tipo_incidencia, descripcion, estado_reporte)
            VALUES (%s, %s, %s, %s, 'abierto')
            """,
            (user["usuario_id"], payload.ubicacion_id, tipo, descripcion),
        )

    return ok({}, "Gracias. Tu reporte fue enviado al equipo SmartSACH.")


@router.get("/paz-y-salvo")
def paz_y_salvo(user: dict = Depends(get_current_user)):
    with db_cursor() as cursor:
        cursor.execute("SELECT * FROM vista_estado_cuenta_usuario WHERE usuario_id = %s", (user["usuario_id"],))
        rows = cursor.fetchall()
    return ok(rows)
