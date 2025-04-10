from ariadne import ObjectType

from db import db
from db.operations import DbOps

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
    is_theoretical = bool(input.get("isTheoretical", False))
    assignment_id = db.execute_command(
        "INSERT INTO assignments (name, grade, weight, course_id, is_theoretical) VALUES (?, ?, ?, ?, ?)",
        (input["name"], input["grade"], input["weight"], int(input["courseId"]), is_theoretical),
    )

    return {
        "id": assignment_id,
        "name": input["name"],
        "grade": input["grade"],
        "weight": input["weight"],
        "isTheoretical": is_theoretical,
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
    is_theoretical = input.get("isTheoretical", assignment.get("is_theoretical", False))

    db.execute_command(
        "UPDATE assignments SET name = ?, grade = ?, weight = ?, is_theoretical = ? WHERE id = ?",
        (name, grade, weight, is_theoretical, assignment_id),
    )

    return {
        "id": assignment_id,
        "name": name,
        "grade": grade,
        "weight": weight,
        "isTheoretical": is_theoretical,
    }


@mutation.field("deleteAssignment")
def resolve_delete_assignment(_, _info, id):
    assignment_id = int(id)
    assignment = DbOps.get_by_id("assignments", assignment_id)

    if not assignment:
        msg = f"Assignment with ID {assignment_id} not found"
        raise Exception(msg)

    db.execute_command("DELETE FROM assignments WHERE id = ?", (assignment_id,))
    return id


@mutation.field("syncTheoreticalAssignments")
def resolve_sync_theoretical_assignments(_, _info, from_course_id):
    course_id = int(from_course_id)
    course = DbOps.get_by_id("courses", course_id)

    if not course:
        msg = f"Course with ID {course_id} not found"
        raise Exception(msg)

    # Get real assignments for this course
    real_assignments = db.execute_query(
        "SELECT * FROM assignments WHERE course_id = ? AND is_theoretical = 0",
        (course_id,),
    )

    # Delete existing theoretical assignments
    db.execute_command(
        "DELETE FROM assignments WHERE course_id = ? AND is_theoretical = 1",
        (course_id,),
    )

    # Create new theoretical assignments based on real ones
    theoretical_assignments = []
    for assignment in real_assignments:
        # Create a new theoretical assignment based on the real one
        theoretical_id = db.execute_command(
            "INSERT INTO assignments (name, grade, weight, course_id, is_theoretical) VALUES (?, ?, ?, ?, 1)",
            (assignment["name"], assignment["grade"], assignment["weight"], course_id),
        )

        theoretical_assignment = {
            "id": theoretical_id,
            "name": assignment["name"],
            "grade": assignment["grade"],
            "weight": assignment["weight"],
            "isTheoretical": True,
        }
        theoretical_assignments.append(theoretical_assignment)

    return theoretical_assignments
