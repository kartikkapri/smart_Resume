from fastapi import HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import hashlib, secrets, time, json, os

# File-based user store (simple, no DB needed)
USERS_FILE = "users.json"

def _load_users() -> dict:
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE) as f:
            return json.load(f)
    return {}

def _save_users(users: dict):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f)

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def _make_token(email: str) -> str:
    return hashlib.sha256(f"{email}{secrets.token_hex(16)}{time.time()}".encode()).hexdigest()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

def register_user(req: RegisterRequest) -> dict:
    users = _load_users()
    if req.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    token = _make_token(req.email)
    users[req.email] = {
        "name": req.name,
        "password": _hash_password(req.password),
        "token": token,
        "history": []
    }
    _save_users(users)
    return {"token": token, "name": req.name, "email": req.email}

def login_user(req: LoginRequest) -> dict:
    users = _load_users()
    user = users.get(req.email)
    if not user or user["password"] != _hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = _make_token(req.email)
    users[req.email]["token"] = token
    _save_users(users)
    return {"token": token, "name": user["name"], "email": req.email}

def get_current_user(request: Request) -> Optional[dict]:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    users = _load_users()
    for email, user in users.items():
        if user.get("token") == token:
            return {"email": email, "name": user["name"]}
    return None

def save_user_analysis(email: str, analysis: dict):
    users = _load_users()
    if email in users:
        users[email].setdefault("history", [])
        users[email]["history"] = [analysis] + users[email]["history"][:19]
        _save_users(users)

def get_user_history(email: str) -> list:
    users = _load_users()
    return users.get(email, {}).get("history", [])
