from db import db


class DbOps:
    @staticmethod
    def get_by_id(table, id):
        results = db.execute_query(f"SELECT * FROM {table} WHERE id = ?", (id,))
        return results[0] if results else None

    @staticmethod
    def get_all(table):
        return db.execute_query(f"SELECT * FROM {table}")

    @staticmethod
    def get_by_foreign_key(table, foreign_key, value):
        return db.execute_query(
            f"SELECT * FROM {table} WHERE {foreign_key} = ?",
            (value,),
        )
