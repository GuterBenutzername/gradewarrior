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
    return DbOps.get_by_foreign_key("assignments", "course_id", obj["id"])
