import hashlib
import hmac
import secrets
import string
from datetime import datetime, timezone, timedelta
from urllib.parse import parse_qsl

from jose import jwt, JWTError
from passlib.context import CryptContext

from core.config import get_auth_data, settings
from core.exceptions import TokenError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_token_hash(token: str) -> str:
    return hmac.new(
        key=settings.SECRET_KEY.encode(),
        msg=token.encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()


def _create_token(data: dict, name: str, exp: timedelta | None = None) -> str:
    to_encode = data.copy()

    if exp:
        expire = datetime.now(timezone.utc) + exp
        to_encode.update({"exp": expire})

    to_encode.update({"name": name})

    auth_data = get_auth_data()

    return jwt.encode(
        to_encode,
        auth_data["secret_key"],
        algorithm=auth_data["algorithm"],
    )


def create_access_token(data: dict) -> str:
    return _create_token(
        data=data, name="access", exp=timedelta(minutes=settings.ACCESS_EXPIRES_MINUTES)
    )


def _create_random_token(length: int = 64) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def create_refresh_token(length: int = 64) -> str:
    return _create_random_token(length=length)


def decode_token(token: str, expected_name: str) -> dict:

    try:
        auth_data = get_auth_data()
        payload = jwt.decode(
            token,
            auth_data["secret_key"],
            algorithms=auth_data["algorithm"],
        )
    except JWTError:
        raise TokenError("Token decode failed")

    user_id = payload.get("sub")
    if not user_id:
        raise TokenError("Token missing sub")

    token_name = payload.get("name")
    if token_name != expected_name:
        raise TokenError("Token type mismatch")

    return payload


def verify_telegram_webapp(init_data_raw: str) -> dict:
    bot_token = settings.BOT_TOKEN

    parsed_data = dict(parse_qsl(init_data_raw, strict_parsing=True))

    hash_provided = parsed_data.pop("hash", None)
    if not hash_provided:
        raise ValueError("Missing hash in init data")

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))

    secret_key = hmac.new(
        b"WebAppData",
        bot_token.encode(),
        hashlib.sha256,
    ).digest()

    computed_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(computed_hash, hash_provided):
        raise ValueError("Invalid Telegram signature")

    return parsed_data
