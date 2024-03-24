from fastapi import FastAPI
from sql import get_all_items_from_db,create_single_item

app = FastAPI()


@app.get("/")
def read_root():
    return get_all_items_from_db()

@app.get("/create/{name}")
def create(name: str):
    create_single_item(name)
    return 