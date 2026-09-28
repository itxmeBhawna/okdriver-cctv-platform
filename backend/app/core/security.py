from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models.user import User

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
	return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
	return password_hash.verify(password, hashed_password)


def create_access_token(subject: str) -> str:
	now = datetime.now(timezone.utc)
	payload = {
		"sub": subject,
		"iat": now,
		"exp": now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_MINUTES),
	}
	return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(
	token: str = Depends(oauth2_scheme),
	db: Session = Depends(get_db),
) -> User:
	credentials_error = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Invalid or expired credentials",
		headers={"WWW-Authenticate": "Bearer"},
	)
	try:
		payload = jwt.decode(
			token,
			settings.JWT_SECRET,
			algorithms=[settings.JWT_ALGORITHM],
			options={"require": ["exp"]},
		)
		username = payload.get("sub")
		if not isinstance(username, str) or not username:
			raise credentials_error
	except jwt.InvalidTokenError as exc:
		raise credentials_error from exc

	user = db.query(User).filter(User.username == username).first()
	if not user or not user.is_active:
		raise credentials_error
	return user


def get_current_operator(user: User = Depends(get_current_user)) -> User:
	if user.role not in ("admin", "operator"):
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Insufficient permissions",
		)
	return user


def get_current_admin(user: User = Depends(get_current_user)) -> User:
	if user.role != "admin":
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Insufficient permissions",
		)
	return user
