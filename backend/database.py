import os
from contextlib import contextmanager
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Iterator

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

load_dotenv()


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default)


def get_connection():
    database_url = _env("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

    return psycopg2.connect(
        host=_env("DB_HOST", "localhost"),
        port=_env("DB_PORT", "5432"),
        dbname=_env("DB_NAME", "postgres"),
        user=_env("DB_USER", "postgres"),
        password=_env("DB_PASS"),
        sslmode=_env("DB_SSLMODE", "require"),
        cursor_factory=RealDictCursor,
    )


@contextmanager
def db_cursor(commit: bool = False) -> Iterator[Any]:
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            yield cursor
        if commit:
            conn.commit()
    except Exception:
        if commit:
            conn.rollback()
        raise
    finally:
        conn.close()


def serialize(value: Any) -> Any:
    if isinstance(value, list):
        return [serialize(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize(item) for key, item in value.items()}
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value
