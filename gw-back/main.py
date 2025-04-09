import os
import sqlite3
from abc import ABC, abstractmethod
from pathlib import Path

import psycopg2
import psycopg2.extras
import uvicorn
from ariadne import ObjectType, gql, make_executable_schema
from ariadne.asgi import GraphQL
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware


# Database abstraction layer
class DatabaseProvider(ABC):
    @abstractmethod
    def execute_query(self, query: str, params: tuple = ()) -> list[dict]:
        pass

    @abstractmethod
    def execute_command(self, command: str, params: tuple = ()) -> int:
        pass

    @abstractmethod
    def init_db(self) -> None:
        pass


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
                        course_id INTEGER,
                        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
                    )
                    """,
            ]

            for table_sql in tables:
                cursor.execute(table_sql)

            conn.commit()


# Create a database provider based on configuration
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

        connection_string = (
            f"host={host} port={port} dbname={name} user={user} password={password}"
        )
        return PostgresProvider(connection_string)

    msg = f"Unsupported database type: {db_type}"
    raise ValueError(msg)


# Database object and initialization
db = create_db_provider()
db.init_db()

# Read schema from file
with Path("../schema.graphql").open("r") as schema_file:
    type_defs = gql(schema_file.read())


# Database operations
class DbOps:
    @staticmethod
    def get_by_id(table, id):
        results = db.execute_query(f"SELECT * FROM {table} WHERE id = ?", (id,))
        return results[0] if results else None

    @staticmethod
    def get_all(table):
        return db.execute_query(f"SELECT * FROM {table}")

    @staticmethod
    def get_by_foreign_key(table, foreign_key, value):
        return db.execute_query(
            f"SELECT * FROM {table} WHERE {foreign_key} = ?",
            (value,),
        )


# Define Query resolvers
query = ObjectType("Query")


@query.field("user")
def resolve_user(_, _info, id):
    return DbOps.get_by_id("users", int(id))


@query.field("users")
def resolve_users(_, _info):
    return DbOps.get_all("users")


@query.field("course")
def resolve_course(_, _info, id):
    return DbOps.get_by_id("courses", int(id))


@query.field("courses")
def resolve_courses(_, _info):
    return DbOps.get_all("courses")


@query.field("assignment")
def resolve_assignment(_, _info, id):
    return DbOps.get_by_id("assignments", int(id))


@query.field("assignments")
def resolve_assignments(_, _info):
    return DbOps.get_all("assignments")


# Define type resolvers
user = ObjectType("User")
course = ObjectType("Course")
assignment = ObjectType("Assignment")


@user.field("courses")
def resolve_user_courses(obj, _info):
    return DbOps.get_by_foreign_key("courses", "user_id", obj["id"])


@course.field("assignments")
def resolve_course_assignments(obj, _info):
    return DbOps.get_by_foreign_key("assignments", "course_id", obj["id"])


# Define Mutation resolvers
mutation = ObjectType("Mutation")


@mutation.field("createUser")
def resolve_create_user(_, _info, input):
    user_id = db.execute_command(
        "INSERT INTO users (name) VALUES (?)",
        (input["name"],),
    )
    return {"id": user_id, "name": input["name"]}


@mutation.field("updateUser")
def resolve_update_user(_, _info, input):
    user_id = int(input["id"])
    user = DbOps.get_by_id("users", user_id)

    if not user:
        msg = f"User with ID {user_id} not found"
        raise Exception(msg)

    name = input.get("name", user["name"])
    db.execute_command("UPDATE users SET name = ? WHERE id = ?", (name, user_id))
    return {"id": user_id, "name": name}


@mutation.field("deleteUser")
def resolve_delete_user(_, _info, id):
    user_id = int(id)
    user = DbOps.get_by_id("users", user_id)

    if not user:
        msg = f"User with ID {user_id} not found"
        raise Exception(msg)
    db.execute_command(
        "DELETE FROM assignments WHERE course_id IN (SELECT id FROM courses WHERE user_id = ?)",
        (user_id,),
    )
    db.execute_command("DELETE FROM courses WHERE user_id = ?", (user_id,))
    db.execute_command("DELETE FROM users WHERE id = ?", (user_id,))
    return id


@mutation.field("createCourse")
def resolve_create_course(_, _info, input):
    course_id = db.execute_command(
        "INSERT INTO courses (name) VALUES (?)",
        (input["name"],),
    )
    return {"id": course_id, "name": input["name"]}


@mutation.field("updateCourse")
def resolve_update_course(_, _info, input):
    course_id = int(input["id"])
    course = DbOps.get_by_id("courses", course_id)

    if not course:
        msg = f"Course with ID {course_id} not found"
        raise Exception(msg)

    name = input.get("name", course["name"])
    db.execute_command("UPDATE courses SET name = ? WHERE id = ?", (name, course_id))
    return {"id": course_id, "name": name}


@mutation.field("deleteCourse")
def resolve_delete_course(_, _info, id):
    course_id = int(id)
    course = DbOps.get_by_id("courses", course_id)

    if not course:
        msg = f"Course with ID {course_id} not found"
        raise Exception(msg)

    db.execute_command("DELETE FROM assignments WHERE course_id = ?", (course_id,))
    db.execute_command("DELETE FROM courses WHERE id = ?", (course_id,))
    return id


@mutation.field("createAssignment")
def resolve_create_assignment(_, _info, input):
    assignment_id = db.execute_command(
        "INSERT INTO assignments (name, grade, weight, course_id) VALUES (?, ?, ?, ?)",
        (input["name"], input["grade"], input["weight"], int(input["courseId"])),
    )

    return {
        "id": assignment_id,
        "name": input["name"],
        "grade": input["grade"],
        "weight": input["weight"],
    }


@mutation.field("updateAssignment")
def resolve_update_assignment(_, _info, input):
    assignment_id = int(input["id"])
    assignment = DbOps.get_by_id("assignments", assignment_id)

    if not assignment:
        msg = f"Assignment with ID {assignment_id} not found"
        raise Exception(msg)

    name = input.get("name", assignment["name"])
    grade = input.get("grade", assignment["grade"])
    weight = input.get("weight", assignment["weight"])

    db.execute_command(
        "UPDATE assignments SET name = ?, grade = ?, weight = ? WHERE id = ?",
        (name, grade, weight, assignment_id),
    )

    return {"id": assignment_id, "name": name, "grade": grade, "weight": weight}


@mutation.field("deleteAssignment")
def resolve_delete_assignment(_, _info, id):
    assignment_id = int(id)
    assignment = DbOps.get_by_id("assignments", assignment_id)

    if not assignment:
        msg = f"Assignment with ID {assignment_id} not found"
        raise Exception(msg)

    db.execute_command("DELETE FROM assignments WHERE id = ?", (assignment_id,))
    return id


# Create schema and set up server
schema = make_executable_schema(type_defs, query, mutation, user, course, assignment)

app = Starlette(
    debug=True,
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        ),
    ],
)

app.mount("/graphql", GraphQL(schema, debug=True))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "127.0.0.1")

    print(f"Starting GradeWarrior API server at http://{host}:{port}/graphql")
    uvicorn.run(app, host=host, port=port)
