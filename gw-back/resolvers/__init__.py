from ariadne import make_executable_schema

from resolvers.mutation import mutation
from resolvers.query import query
from resolvers.types import assignment, course, user


def create_schema(type_defs):
    return make_executable_schema(type_defs, query, mutation, user, course, assignment)
