import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from psycopg2 import Error as PsycopgError

from routers import auth, locations, payments, profile, reports
from routers.common import ok

load_dotenv()

app = FastAPI(title="SmartSACH API", version="2.0.0")


def allowed_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS") or os.getenv("APP_ORIGIN") or os.getenv("FRONTEND_ORIGIN") or "http://localhost:5173"
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


origins = allowed_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX") or (r"https://.*\.vercel\.app" if "*" not in origins else None),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(locations.router)
app.include_router(payments.router)
app.include_router(reports.router)


@app.get("/")
@app.get("/api/health")
def health():
    return ok({"message": "SmartSACH API is running", "build": os.getenv("APP_BUILD", "fastapi")})


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "ok" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"ok": False, "message": str(exc.detail)})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    errors = {}
    for error in exc.errors():
        field = ".".join(str(part) for part in error.get("loc", []) if part != "body")
        errors[field or "request"] = error.get("msg", "Valor invalido.")
    return JSONResponse(
        status_code=422,
        content={"ok": False, "message": "Revisa los campos.", "errors": errors},
    )


@app.exception_handler(PsycopgError)
async def database_exception_handler(_: Request, exc: PsycopgError):
    error = str(exc)
    message = "No se pudo completar la operacion en la base de datos."
    if "relation" in error and "does not exist" in error:
        message = "Falta una tabla en la base de datos. Ejecuta la migracion de Supabase."
    elif "column" in error and "does not exist" in error:
        message = "Falta una columna en la base de datos. Revisa la migracion de Supabase."
    elif "password authentication failed" in error:
        message = "Las credenciales de conexion a Supabase no son correctas."
    elif "could not translate host name" in error or "Connection refused" in error:
        message = "No se pudo conectar con Supabase. Revisa las variables de conexion."

    payload = {"ok": False, "message": message}
    if os.getenv("APP_DEBUG", "false").lower() in {"1", "true", "yes", "on"}:
        payload["debug"] = error
    return JSONResponse(status_code=500, content=payload)


@app.exception_handler(Exception)
async def unexpected_exception_handler(_: Request, exc: Exception):
    payload = {"ok": False, "message": "Error inesperado del servidor."}
    if os.getenv("APP_DEBUG", "false").lower() in {"1", "true", "yes", "on"}:
        payload["debug"] = str(exc)
    return JSONResponse(status_code=500, content=payload)
