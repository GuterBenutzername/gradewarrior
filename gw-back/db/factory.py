import os

from db.base import DatabaseProvider
from db.postgres import PostgresProvider
from db.sqlite import SQLiteProvider


def create_db_provider() -> DatabaseProvider:
    db_type = os.environ.get("DB_TYPE", "sqlite")

    if db_type == "sqlite":
        db_path = os.environ.get("DB_PATH", "gradewarrior.db")
        return SQLiteProvider(db_path)
    if db_type == "postgres":
        host = os.environ.get("DB_HOST", "localhost")
        port = os.environ.get("DB_PORT", "5432")
        name = os.environ.get("DB_NAME", "gradewarrior")
        user = os.environ.get("DB_USER", "postgres")
        password = os.environ.get("DB_PASSWORD", "")

        connection_string = f"host={host} port={port} dbname={name} user={user} password={password}"
        return PostgresProvider(connection_string)

    msg = f"Unsupported database type: {db_type}"
    raise ValueError(msg)
