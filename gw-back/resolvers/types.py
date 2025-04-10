from ariadne import ObjectType

from db.operations import DbOps

# Define type resolvers
user = ObjectType("User")
course = ObjectType("Course")
assignment = ObjectType("Assignment")


@user.field("courses")
def resolve_user_courses(obj, _info):
    return DbOps.get_by_foreign_key("courses", "user_id", obj["id"])


@course.field("assignments")
def resolve_course_assignments(obj, _info):
    return DbOps.get_by_foreign_key("assignments", "course_id", obj["id"], {"is_theoretical": 0})


@course.field("theoreticalAssignments")
def resolve_course_theoretical_assignments(obj, _info):
    return DbOps.get_by_foreign_key("assignments", "course_id", obj["id"], {"is_theoretical": 1})


@assignment.field("isTheoretical")
def resolve_assignment_is_theoretical(obj, _info):
    # Use the is_theoretical field from the database if it exists,
    # otherwise default to False
    return bool(obj.get("is_theoretical", False))
