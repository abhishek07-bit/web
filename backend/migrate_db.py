from sqlalchemy import text
from app.db.database import engine

def migrate():
    print("Running migration...")
    
    # Add parsed_text
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE resumes ADD COLUMN IF NOT EXISTS parsed_text TEXT;"))
            conn.commit()
            print("Verified/Added parsed_text")
    except Exception as e:
        print(f"Error handling parsed_text: {e}")
        
    # Add analysis
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE resumes ADD COLUMN IF NOT EXISTS analysis JSONB;"))
            conn.commit()
            print("Verified/Added analysis")
    except Exception as e:
        print(f"Error handling analysis: {e}")
        
    # Add vocal_confidence_data
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE feedback_reports ADD COLUMN IF NOT EXISTS vocal_confidence_data JSONB;"))
            conn.commit()
            print("Verified/Added vocal_confidence_data")
    except Exception as e:
        print(f"Error handling vocal_confidence_data: {e}")
            
    print("Done")

if __name__ == "__main__":
    migrate()
