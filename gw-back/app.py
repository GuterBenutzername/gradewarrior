from pathlib import Path

from ariadne import gql
from ariadne.asgi import GraphQL
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from resolvers import create_schema


def load_schema_from_file(schema_path="../schema.graphql"):
    """Load GraphQL schema from a file."""
    with Path(schema_path).open("r") as schema_file:
        return gql(schema_file.read())


def create_app():
    """Create and configure the Starlette application."""
    # Load GraphQL schema
    type_defs = load_schema_from_file()
    schema = create_schema(type_defs)

    # Create Starlette app with CORS middleware
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

    # Mount GraphQL endpoint
    app.mount("/graphql", GraphQL(schema, debug=True))

    return app
