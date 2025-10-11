#!/usr/bin/env python3

from app import app, db, Admin, Department, Employee
from werkzeug.security import generate_password_hash
import os

def init_database():
    """Initialize the database with updated schema"""
    
    print("🔄 Initializing database...")
    
    with app.app_context():
        # Drop all tables and recreate them with the new schema
        print("Dropping existing tables...")
        db.drop_all()
        
        print("Creating tables with updated schema...")
        db.create_all()
        
        # Create admin user
        admin = Admin(
            username='admin',
            password_hash=generate_password_hash('admin123'),
            email='admin@example.com',
            full_name='System Administrator',
            is_active=True
        )
        db.session.add(admin)
        
        # Create default department
        general_dept = Department(
            name='General',
            description='General department for unassigned employees',
            is_active=True
        )
        db.session.add(general_dept)
        
        try:
            db.session.commit()
            print("✅ Database initialized successfully!")
            
            # Verify tables were created
            print("\nDatabase tables created:")
            with db.engine.connect() as connection:
                result = connection.execute(db.text("SELECT name FROM sqlite_master WHERE type='table';"))
                tables = [row[0] for row in result]
                for table in tables:
                    print(f"  - {table}")
                
                # Show department table structure
                print("\nDepartment table structure:")
                result = connection.execute(db.text("PRAGMA table_info(departments);"))
                columns = result.fetchall()
                for col in columns:
                    print(f"  - {col[1]}: {col[2]} {'NOT NULL' if col[3] else 'NULL'} {'PK' if col[5] else ''}")
                
            return True
            
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    # Check if database file exists
    db_file = "attendance.db"
    if os.path.exists(db_file):
        response = input(f"Database file '{db_file}' already exists. Recreate it? (y/N): ")
        if response.lower() != 'y':
            print("Operation cancelled.")
            exit(0)
    
    success = init_database()
    
    if success:
        print("\n🎉 Database setup completed!")
        print("\nDefault credentials:")
        print("  Username: admin")
        print("  Password: admin123")
    else:
        print("\n❌ Database setup failed!")