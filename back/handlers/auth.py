from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi import Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.exceptions import VerificationError
from dependencies import (
    get_auth_service,
    get_current_user,
    get_refresh_token,
)
from schemas.auth import TokenUserSchema
from schemas.user import UserVerifySchema
from services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=True)

# curl -X 'POST' \
#   'http://127.0.0.1:8000/auth/telegram' \
#   -H 'accept: application/json' \
#   -H 'Authorization: Bearer user=%7B%22id%22%3A2125561637%2C%22first_name%22%3A%22%D0%B8%D0%BB%D1%8C%D1%8F%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22iliatwopizza%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F3O58ycHjjqUlJO0yng4M407Ms8M1uzEbIJa7xPuOqtc.svg%22%7D&chat_instance=1185751439770883049&chat_type=sender&auth_date=1771257095&signature=72xhJ0lT3tvGBVNh9fK0BSVo_yYN6Bq0_kwOn5DXjuS1FmRbkOJT7ZfQcHjaESdVc6fa7Py0ZFz4-UO6hXvJDg&hash=17451a743730537f5a18b64adc49847e7b060d49674374579ab834a727802eab' \
#   -d ''


@router.post("/telegram")
async def login(
        response: Response,
        credentials: Annotated[HTTPAuthorizationCredentials, Security(security)],
        auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    scheme = (credentials.scheme or "").lower()
    if scheme not in ("tma", "bearer"):
        raise HTTPException(status_code=401, detail="Invalid scheme")

    init_data = credentials.credentials
    access_token, refresh_token = await auth_service.login_via_telegram(init_data)

    response.set_cookie(
        key="user_access_token",
        value=access_token,
        httponly=False,
        secure=True,
        samesite="none",
        path="/",
        max_age=900
    )
    response.set_cookie(
        key="user_refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=24109200
    )

    return {"msg": "ok"}
@router.post(
    "/verify",
    description="шлем поля пол возраст итд, получаем роль юзера и новый access с этой ролью",
)
async def verify_account(
    response: Response,
    user_verify_data: UserVerifySchema,
    user_data: Annotated[TokenUserSchema, Depends(get_current_user)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    try:
        access_token = await auth_service.verify(
            user_id=user_data.id, user_verify_data=user_verify_data
        )
    except VerificationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

    response.set_cookie(
        key="user_access_token",
        value=access_token,
        httponly=False,
        secure=True,
        samesite="none",
        path="/",
        max_age=900
    )
    return {"msg": "ok"}


@router.post("/refresh", description="если access протухший/отсутствует то идем сюда")
async def refresh_tokens(
    response: Response,
    refresh_token: Annotated[str, Depends(get_refresh_token)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    access_token, new_refresh_token = await auth_service.refresh_tokens(refresh_token)
    response.set_cookie(
        key="user_refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=24109200
    )
    response.set_cookie(
        key="user_access_token",
        value=access_token,
        httponly=False,
        secure=True,
        samesite="none",
        path="/",
        max_age=900
    )
    return {"msg": "ok"}
