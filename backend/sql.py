import os

import pandas as pd
import sqlalchemy


def get_all_items_from_db():
    db_url = os.environ["DATABASE_URL"]
    engine = sqlalchemy.create_engine(db_url)
    connection = engine.connect()
    query = "SELECT * FROM test_table"
    df = pd.read_sql_query(query, connection)
    connection.close()
    return df.to_dict( orient="records")

def get_engine():
    db_url = os.environ["DATABASE_URL"]
    engine = sqlalchemy.create_engine(db_url)
    return engine

def create_single_item(name):
    db_url = os.environ["DATABASE_URL"]
    engine = sqlalchemy.create_engine(db_url)
    with engine.connect() as connection:
        create_item = "INSERT INTO test_table (name) VALUES ('" + name + "') RETURNING id"
        result = connection.execute(sqlalchemy.text(create_item))
        row = result.first()
        connection.commit()
        return row[0]

        
