#!/usr/bin/env python3

import sqlite3
import os

DATABASE_PATH = "attendance.db"

def migrate_departments_table():
    """Add manager_id column to departments table"""
    
    if not os.path.exists(DATABASE_PATH):
        print(f"❌ Database file {DATABASE_PATH} not found!")
        return False
    
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Check if manager_id column already exists
        cursor.execute("PRAGMA table_info(departments)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'manager_id' in columns:
            print("✅ manager_id column already exists in departments table")
            return True
        
        # Add manager_id column
        print("Adding manager_id column to departments table...")
        cursor.execute("""
            ALTER TABLE departments 
            ADD COLUMN manager_id INTEGER 
            REFERENCES employees(id)
        """)
        
        conn.commit()
        print("✅ Successfully added manager_id column to departments table")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(departments)")
        columns = cursor.fetchall()
        print("\nUpdated departments table structure:")
        for col in columns:
            print(f"  - {col[1]}: {col[2]} {'NOT NULL' if col[3] else 'NULL'} {'PK' if col[5] else ''}")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        if conn:
            conn.rollback()
        return False
    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🔄 Migrating departments table...")
    success = migrate_departments_table()
    
    if success:
        print("\n🎉 Migration completed successfully!")
    else:
        print("\n❌ Migration failed!")