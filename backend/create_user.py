import argparse
from getpass import getpass

import app.models  # noqa: F401 — registers models with Base
from app.core.db import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User


def main():
    parser = argparse.ArgumentParser(description="Create an okDriver platform user")
    parser.add_argument("username")
    parser.add_argument("role", choices=["admin", "operator"])
    args = parser.parse_args()

    password = getpass("Password (minimum 12 characters): ")
    if len(password) < 12:
        parser.error("Password must be at least 12 characters")
    if password != getpass("Confirm password: "):
        parser.error("Passwords do not match")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == args.username).first():
            parser.error("Username already exists")
        db.add(User(username=args.username, password_hash=hash_password(password), role=args.role))
        db.commit()
        print(f"Created {args.role} user '{args.username}'")
    finally:
        db.close()


if __name__ == "__main__":
    main()