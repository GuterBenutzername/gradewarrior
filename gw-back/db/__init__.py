from db.factory import create_db_provider

# Database object and initialization
db = create_db_provider()
db.init_db()
