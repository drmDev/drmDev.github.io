from flask import Flask
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Fetch environment variables
INSTANCE_CONNECTION_NAME = os.getenv('INSTANCE_CONNECTION_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASS')
DB_NAME = os.getenv('DB_NAME')
DB_HOST = os.getenv('DB_HOST')

# Example usage for connecting to a database (PostgreSQL with SQLAlchemy)
from flask_sqlalchemy import SQLAlchemy

# Database URI (example for PostgreSQL)
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route("/")
def index():
    return "Hello, Flask with .env!"

if __name__ == "__main__":
    app.run(debug=True)
