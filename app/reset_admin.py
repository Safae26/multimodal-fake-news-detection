import sqlite3
import bcrypt
import os

db_path = os.path.join(os.path.dirname(__file__), "multimodal_fake_news_detection_system.db")
print("Connecting to DB:", db_path)

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Hash admin123
    password_bytes = b"admin123"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt).decode("utf-8")
    
    # Check users
    cursor.execute("SELECT id, username, email, is_admin, is_verified FROM users")
    rows = cursor.fetchall()
    print("Existing users in DB:", rows)
    
    # Reset/Ensure admin user exists
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    admin_row = cursor.fetchone()
    if admin_row:
        cursor.execute("UPDATE users SET password = ?, is_verified = 1, is_admin = 1 WHERE username = 'admin'", (hashed,))
        print("Updated 'admin' password to 'admin123' and verified = 1")
    else:
        cursor.execute(
            "INSERT INTO users (username, first_name, last_name, email, password, is_admin, is_verified) VALUES (?, ?, ?, ?, ?, 1, 1)",
            ("admin", "Platform", "Administrator", "admin@fakenewshunter.org", hashed)
        )
        print("Created 'admin' user with password 'admin123'")
        
    conn.commit()
    conn.close()
else:
    print("DB file does not exist at:", db_path)
