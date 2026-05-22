from datetime import date

from fastapi import APIRouter, Depends, status

from database import db_cursor
from models.schemas import PaymentRequest
from routers.common import account_summary, clean_string, fail, get_current_user, ok

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/summary")
def payments_summary(user: dict = Depends(get_current_user)):
    user_id = int(user["usuario_id"])
    with db_cursor() as cursor:
        cursor.execute(
            """
            SELECT
                s.suscripcion_id,
                s.proximo_vencimiento,
                s.estado_pago,
                s.monto_mensual,
                r.nombre_ruta,
                u.nombre_referencia,
                u.descripcion_direccion
            FROM suscripciones s
            JOIN rutas r ON r.ruta_id = s.ruta_id
            JOIN ubicaciones_servicio u ON u.ubicacion_id = s.ubicacion_id
            WHERE s.usuario_id = %s
            ORDER BY s.proximo_vencimiento ASC
            """,
            (user_id,),
        )
        subscriptions = cursor.fetchall()

        cursor.execute(
            """
            SELECT
                p.pago_id,
                p.suscripcion_id,
                p.monto,
                p.fecha_pago,
                p.metodo_pago,
                p.periodo_referencia,
                p.estado_pago,
                r.nombre_ruta
            FROM pagos p
            JOIN suscripciones s ON s.suscripcion_id = p.suscripcion_id
            JOIN rutas r ON r.ruta_id = s.ruta_id
            WHERE p.usuario_id = %s
            ORDER BY p.fecha_pago DESC
            LIMIT 30
            """,
            (user_id,),
        )
        payments = cursor.fetchall()

    summary = account_summary(user_id)
    estado_cuenta = "con_saldo_pendiente" if summary["suscripciones_morosas"] > 0 else "al_dia"
    return ok({"estado_cuenta": estado_cuenta, "summary": summary, "subscriptions": subscriptions, "payments": payments})


@router.post("/pay")
def pay_subscription(payload: PaymentRequest, user: dict = Depends(get_current_user)):
    if payload.suscripcion_id <= 0:
        fail("Suscripcion invalida.", status.HTTP_422_UNPROCESSABLE_ENTITY)

    metodo_pago = clean_string(payload.metodo_pago or "Pago web", 50)
    with db_cursor(commit=True) as cursor:
        cursor.execute(
            """
            SELECT suscripcion_id, monto_mensual, proximo_vencimiento
            FROM suscripciones
            WHERE suscripcion_id = %s AND usuario_id = %s
            """,
            (payload.suscripcion_id, user["usuario_id"]),
        )
        subscription = cursor.fetchone()
        if not subscription:
            fail("Suscripcion no encontrada.", status.HTTP_404_NOT_FOUND)

        proximo = subscription["proximo_vencimiento"]
        periodo = proximo.strftime("%Y-%m") if isinstance(proximo, date) else str(proximo)[:7]

        cursor.execute(
            """
            INSERT INTO pagos (usuario_id, suscripcion_id, monto, metodo_pago, periodo_referencia, estado_pago)
            VALUES (%s, %s, %s, %s, %s, 'pagado')
            """,
            (user["usuario_id"], payload.suscripcion_id, subscription["monto_mensual"], metodo_pago, periodo),
        )
        cursor.execute(
            """
            UPDATE suscripciones
            SET proximo_vencimiento = GREATEST(proximo_vencimiento, CURRENT_DATE) + INTERVAL '30 days',
                estado_pago = 'al_dia'
            WHERE suscripcion_id = %s
            """,
            (payload.suscripcion_id,),
        )

    return ok({}, "Pago registrado correctamente.")
