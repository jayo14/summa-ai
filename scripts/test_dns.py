import socket
import sys

def test_supabase_auth_ip():
    try:
        ip = socket.gethostbyname('yeibwagfmkimutlcwcdo.supabase.co')
        print(f"Supabase Auth IP resolved: {ip}")
    except Exception as e:
        print(f"Auth DNS resolution error: {e}")

if __name__ == "__main__":
    test_supabase_auth_ip()
