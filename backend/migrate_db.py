from sqlalchemy import text
from app.db.database import engine

def migrate():
    print("Running migration...")
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE resumes ADD COLUMN parsed_text TEXT;"))
            print("Added parsed_text")
        except Exception as e:
            print(f"Error adding parsed_text: {e}")
            
        try:
            conn.execute(text("ALTER TABLE resumes ADD COLUMN analysis JSONB;"))
            print("Added analysis")
        except Exception as e:
            print(f"Error adding analysis: {e}")
            
    print("Done")

if __name__ == "__main__":
    migrate()
