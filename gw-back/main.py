from ariadne import ObjectType, gql, make_executable_schema
from ariadne.asgi import GraphQL
from typing import Dict, List, Any, Optional, Protocol
import os
from abc import ABC, abstractmethod
import sqlite3
import psycopg2
import psycopg2.extras

# Database abstraction layer
class DatabaseProvider(ABC):
    @abstractmethod
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        pass
    
    @abstractmethod
    def execute_command(self, command: str, params: tuple = ()) -> int:
        pass
    
    @abstractmethod
    def init_db(self) -> None:
        pass
    
    @abstractmethod
    def get_placeholder(self) -> str:
        """Get the parameter placeholder style for this database"""
        pass

class SQLiteProvider(DatabaseProvider):
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
    
    def execute_command(self, command: str, params: tuple = ()) -> int:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(command, params)
        last_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return last_id
    
    def get_placeholder(self) -> str:
        return "?"
    
    def init_db(self) -> None:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create tables if they don't exist
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            user_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            grade REAL NOT NULL,
            weight REAL NOT NULL,
            course_id INTEGER,
            FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
        )
        ''')
        
        conn.commit()
        conn.close()

class PostgresProvider(DatabaseProvider):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
    
    def get_connection(self):
        conn = psycopg2.connect(self.connection_string)
        return conn
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        # Replace ? placeholders with %s for PostgreSQL
        query = query.replace("?", "%s")
        
        conn = self.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(query, params)
        results = cursor.fetchall()
        conn.close()
        return [dict(row) for row in results]
    
    def execute_command(self, command: str, params: tuple = ()) -> int:
        # Replace ? placeholders with %s for PostgreSQL
        command = command.replace("?", "%s")
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # For INSERT commands, add RETURNING id to get the last inserted ID
        if "INSERT" in command.upper() and "RETURNING" not in command.upper():
            command = command + " RETURNING id"
            cursor.execute(command, params)
            last_id = cursor.fetchone()[0]
        else:
            cursor.execute(command, params)
            last_id = 0
            
        conn.commit()
        conn.close()
        return last_id
    
    def get_placeholder(self) -> str:
        return "%s"
    
    def init_db(self) -> None:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create tables if they don't exist
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            user_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS assignments (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            grade REAL NOT NULL,
            weight REAL NOT NULL,
            course_id INTEGER,
            FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
        )
        ''')
        
        conn.commit()
        conn.close()

# Create a database provider based on configuration
def create_db_provider() -> DatabaseProvider:
    """
    Create a database provider based on environment variables:
    
    DB_TYPE: The type of database to use ('sqlite' or 'postgres')
    
    For SQLite:
    - DB_PATH: Path to the SQLite database file
    
    For PostgreSQL:
    - DB_HOST: The database server hostname
    - DB_PORT: The database server port
    - DB_NAME: The database name
    - DB_USER: The database username
    - DB_PASSWORD: The database password
    """
    # Get database configuration from environment variables
    db_type = os.environ.get('DB_TYPE', 'sqlite')
    
    if db_type == 'sqlite':
        db_path = os.environ.get('DB_PATH', 'gradewarrior.db')
        return SQLiteProvider(db_path)
    elif db_type == 'postgres':
        # Build connection string from environment variables
        host = os.environ.get('DB_HOST', 'localhost')
        port = os.environ.get('DB_PORT', '5432')
        name = os.environ.get('DB_NAME', 'gradewarrior')
        user = os.environ.get('DB_USER', 'postgres')
        password = os.environ.get('DB_PASSWORD', '')
        
        connection_string = f"host={host} port={port} dbname={name} user={user} password={password}"
        return PostgresProvider(connection_string)
    
    raise ValueError(f"Unsupported database type: {db_type}")

# Utility function to format query placeholders according to db provider
def format_query_with_placeholders(query, db_provider):
    """Convert generic queries to use the correct placeholders for the current db provider"""
    placeholder = db_provider.get_placeholder()
    # If using PostgreSQL style (%s), we need to replace SQLite style (?)
    if placeholder == "%s":
        return query.replace("?", "%s")
    return query

# Create the database provider
db = create_db_provider()

# Initialize the database
db.init_db()

# Read schema from file
with open('../schema.graphql', 'r') as schema_file:
    schema = schema_file.read()

type_defs = gql(schema)

# Helper functions for database operations
def get_user(id: int) -> Optional[Dict]:
    results = db.execute_query("SELECT * FROM users WHERE id = ?", (id,))
    return results[0] if results else None

def get_users() -> List[Dict]:
    return db.execute_query("SELECT * FROM users")

def get_courses_by_user(user_id: int) -> List[Dict]:
    return db.execute_query("SELECT * FROM courses WHERE user_id = ?", (user_id,))

def get_course(id: int) -> Optional[Dict]:
    results = db.execute_query("SELECT * FROM courses WHERE id = ?", (id,))
    return results[0] if results else None

def get_courses() -> List[Dict]:
    return db.execute_query("SELECT * FROM courses")

def get_assignments_by_course(course_id: int) -> List[Dict]:
    return db.execute_query("SELECT * FROM assignments WHERE course_id = ?", (course_id,))

def get_assignment(id: int) -> Optional[Dict]:
    results = db.execute_query("SELECT * FROM assignments WHERE id = ?", (id,))
    return results[0] if results else None

def get_assignments() -> List[Dict]:
    return db.execute_query("SELECT * FROM assignments")

# Define Query resolvers
query = ObjectType("Query")

@query.field("user")
def resolve_user(_, info, id):
    return get_user(int(id))

@query.field("users")
def resolve_users(_, info):
    return get_users()

@query.field("course")
def resolve_course(_, info, id):
    return get_course(int(id))

@query.field("courses")
def resolve_courses(_, info):
    return get_courses()

@query.field("assignment")
def resolve_assignment(_, info, id):
    return get_assignment(int(id))

@query.field("assignments")
def resolve_assignments(_, info):
    return get_assignments()

# Define type resolvers
user = ObjectType("User")
course = ObjectType("Course")
assignment = ObjectType("Assignment")

@user.field("courses")
def resolve_user_courses(obj, info):
    return get_courses_by_user(obj["id"])

@course.field("assignments")
def resolve_course_assignments(obj, info):
    return get_assignments_by_course(obj["id"])

# Define Mutation resolvers
mutation = ObjectType("Mutation")

@mutation.field("createUser")
def resolve_create_user(_, info, input):
    user_id = db.execute_command(
        "INSERT INTO users (name) VALUES (?)", 
        (input["name"],)
    )
    
    return {"id": user_id, "name": input["name"]}

@mutation.field("updateUser")
def resolve_update_user(_, info, input):
    user_id = int(input["id"])
    user = get_user(user_id)
    
    if not user:
        raise Exception(f"User with ID {user_id} not found")
    
    name = input.get("name", user["name"])
    
    db.execute_command(
        "UPDATE users SET name = ? WHERE id = ?", 
        (name, user_id)
    )
    
    return {"id": user_id, "name": name}

@mutation.field("deleteUser")
def resolve_delete_user(_, info, id):
    user_id = int(id)
    user = get_user(user_id)
    
    if not user:
        raise Exception(f"User with ID {user_id} not found")
    
    db.execute_command("DELETE FROM users WHERE id = ?", (user_id,))
    
    return id

@mutation.field("createCourse")
def resolve_create_course(_, info, input):
    course_id = db.execute_command(
        "INSERT INTO courses (name) VALUES (?)", 
        (input["name"],)
    )
    
    return {"id": course_id, "name": input["name"]}

@mutation.field("updateCourse")
def resolve_update_course(_, info, input):
    course_id = int(input["id"])
    course = get_course(course_id)
    
    if not course:
        raise Exception(f"Course with ID {course_id} not found")
    
    name = input.get("name", course["name"])
    
    db.execute_command(
        "UPDATE courses SET name = ? WHERE id = ?", 
        (name, course_id)
    )
    
    return {"id": course_id, "name": name}

@mutation.field("deleteCourse")
def resolve_delete_course(_, info, id):
    course_id = int(id)
    course = get_course(course_id)
    
    if not course:
        raise Exception(f"Course with ID {course_id} not found")
    
    db.execute_command("DELETE FROM courses WHERE id = ?", (course_id,))
    
    return id

@mutation.field("createAssignment")
def resolve_create_assignment(_, info, input):
    assignment_id = db.execute_command(
        "INSERT INTO assignments (name, grade, weight, course_id) VALUES (?, ?, ?, ?)",
        (input["name"], input["grade"], input["weight"], int(input["courseId"]))
    )
    
    return {
        "id": assignment_id,
        "name": input["name"],
        "grade": input["grade"],
        "weight": input["weight"]
    }

@mutation.field("updateAssignment")
def resolve_update_assignment(_, info, input):
    assignment_id = int(input["id"])
    assignment = get_assignment(assignment_id)
    
    if not assignment:
        raise Exception(f"Assignment with ID {assignment_id} not found")
    
    name = input.get("name", assignment["name"])
    grade = input.get("grade", assignment["grade"])
    weight = input.get("weight", assignment["weight"])
    
    db.execute_command(
        "UPDATE assignments SET name = ?, grade = ?, weight = ? WHERE id = ?",
        (name, grade, weight, assignment_id)
    )
    
    return {
        "id": assignment_id,
        "name": name,
        "grade": grade,
        "weight": weight
    }

@mutation.field("deleteAssignment")
def resolve_delete_assignment(_, info, id):
    assignment_id = int(id)
    assignment = get_assignment(assignment_id)
    
    if not assignment:
        raise Exception(f"Assignment with ID {assignment_id} not found")
    
    db.execute_command("DELETE FROM assignments WHERE id = ?", (assignment_id,))
    
    return id

@mutation.field("addAssignmentToCourse")
def resolve_add_assignment_to_course(_, info, courseId, assignmentId):
    course_id = int(courseId)
    assignment_id = int(assignmentId)
    
    course = get_course(course_id)
    assignment = get_assignment(assignment_id)
    
    if not course:
        raise Exception(f"Course with ID {course_id} not found")
    
    if not assignment:
        raise Exception(f"Assignment with ID {assignment_id} not found")
    
    db.execute_command(
        "UPDATE assignments SET course_id = ? WHERE id = ?",
        (course_id, assignment_id)
    )
    
    return course

schema = make_executable_schema(type_defs, query, mutation, user, course, assignment)

app = GraphQL(schema, debug=True)