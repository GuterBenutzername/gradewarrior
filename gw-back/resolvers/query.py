from ariadne import ObjectType

from db.operations import DbOps

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
