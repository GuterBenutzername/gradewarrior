import psycopg2
import psycopg2.extras

from db.base import DatabaseProvider


class PostgresProvider(DatabaseProvider):
    def __init__(self, connection_string: str) -> None:
        self.connection_string = connection_string

    def get_connection(self):
        return psycopg2.connect(self.connection_string)

    def execute_query(self, query: str, params: tuple = ()) -> list[dict]:
        query = query.replace("?", "%s")

        with (
            self.get_connection() as conn,
            conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor,
        ):
            cursor.execute(query, params)
            results = cursor.fetchall()
            return [dict(row) for row in results]

    def execute_command(self, command: str, params: tuple = ()) -> int:
        command = command.replace("?", "%s")

        with self.get_connection() as conn, conn.cursor() as cursor:
            if "INSERT" in command.upper() and "RETURNING" not in command.upper():
                command = command + " RETURNING id"
                cursor.execute(command, params)
                last_id = cursor.fetchone()[0]
            else:
                cursor.execute(command, params)
                last_id = 0

            conn.commit()
            return last_id

    def init_db(self) -> None:
        with self.get_connection() as conn, conn.cursor() as cursor:
            tables = [
                """
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL
                    )
                    """,
                """
                    CREATE TABLE IF NOT EXISTS courses (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL,
                        user_id INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    )
                    """,
                """
                    CREATE TABLE IF NOT EXISTS assignments (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL,
                        grade REAL NOT NULL,
                        weight REAL NOT NULL,
                        course_id INTEGER NOT NULL,
                        is_theoretical BOOLEAN NOT NULL DEFAULT FALSE,
                        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
                    )
                    """,
            ]

            for table_sql in tables:
                cursor.execute(table_sql)

            conn.commit()
