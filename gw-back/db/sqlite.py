import sqlite3

from db.base import DatabaseProvider


class SQLiteProvider(DatabaseProvider):
    def __init__(self, db_path: str) -> None:
        self.db_path = db_path

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def execute_query(self, query: str, params: tuple = ()) -> list[dict]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def execute_command(self, command: str, params: tuple = ()) -> int:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(command, params)
            last_id = cursor.lastrowid
            conn.commit()
            return last_id

    def init_db(self) -> None:
        with self.get_connection() as conn:
            cursor = conn.cursor()

            tables = [
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS courses (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    user_id INTEGER,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS assignments (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    grade REAL NOT NULL,
                    weight REAL NOT NULL,
                    course_id INTEGER,
                    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
                )
                """,
            ]

            for table_sql in tables:
                cursor.execute(table_sql)

            conn.commit()
