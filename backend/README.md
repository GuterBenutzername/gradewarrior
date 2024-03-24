# backend

The backend of gw handles storing assignments, courses, users, and other info, calculating insights (premium), and auto-updating grades (premium).

- gw-backend, handling the storing of the aforementioned data, provides a REST API to authenticate and interface with the primary database of assignments, courses, users, etc.

- gw-analyzer, handling insights, is a daemon that periodically analyzes grades and stores all results into the "insights" table.

- gw-updater, handling grade auto-updating, is a web-scraper run periodically to scrape grades from multiple school districts' grade books.

The database is provided by the compose.yaml at the environment variable `DATABASE_URL`.