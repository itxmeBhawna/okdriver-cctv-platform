from typing import Literal

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=128)


class UserIdentity(BaseModel):
    username: str
    role: Literal["admin", "operator"]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserIdentity