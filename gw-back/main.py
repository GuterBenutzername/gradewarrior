import os

import uvicorn

from app import create_app

# Create the application
app = create_app()

if __name__ == "__main__":
    # Get server configuration from environment variables with defaults
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "127.0.0.1")

    print(f"Starting GradeWarrior API server at http://{host}:{port}/graphql")
    uvicorn.run(app, host=host, port=port)
