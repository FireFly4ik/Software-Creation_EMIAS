import json
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from core.config import settings
from core.exceptions import (
    ExternalServiceError,
    TokenNotFoundError,
    TokenRevokedError,
    TokenExpiredError,
    UserNotFoundError,
)
from core.security import (
    create_access_token,
    create_refresh_token,
    get_token_hash,
    verify_telegram_webapp,
)
from models.refresh_token import RefreshToken
from models.user import User, UserRoleEnum
from repositories.refresh_token import RefreshTokenRepository
from repositories.user import UserRepository
from schemas.user import (
    UserCreateSchema,
    UserVerifySchema,
    IDFilter,
    UserVerifyWithRoleSchema,
    UserChangeRoleSchema,
)


@dataclass
class AuthService:
    user_repository: UserRepository
    refresh_repository: RefreshTokenRepository

    async def login_via_telegram(self, init_data_raw: str) -> tuple[str, str]:

        try:
            data = verify_telegram_webapp(init_data_raw)
        except Exception as e:
            raise ExternalServiceError(
                "Telegram verification failed",
                extra={"orig": str(e)},
            )

        user_data = json.loads(data["user"])

        user = await self.user_repository.find_user_by_id(user_data["id"])

        if not user:

            new_user_payload = UserCreateSchema(
                id=user_data["id"], username=user_data["username"]
            )

            user = await self.user_repository.create_user(new_user_payload)

        token_payload = self._build_token_payload(user)

        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token()
        refresh_token_hashed = get_token_hash(refresh_token)

        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_EXPIRES_DAYS
        )

        await self.refresh_repository.create_and_revoke_all_for_user(
            new_token=refresh_token_hashed,
            user_id=user.id,
            expires_at=expires_at,
        )

        return access_token, refresh_token

    async def verify(self, user_id: int, user_verify_data: UserVerifySchema) -> str:

        updated_user = await self.user_repository.update(
            IDFilter(id=user_id),
            UserVerifyWithRoleSchema(
                **user_verify_data.model_dump(), role=UserRoleEnum.USER
            ),
        )
        token_payload = self._build_token_payload(updated_user)

        access_token = create_access_token(token_payload)

        return access_token

    async def change_role_to_admin(self, user_id):
        user = await self.user_repository.update(
            IDFilter(id=user_id), UserChangeRoleSchema(role="admin")
        )
        token_payload = self._build_token_payload(user)
        access_token = create_access_token(token_payload)
        return access_token

    async def change_role_to_user(self, user_id):
        user = await self.user_repository.update(
            IDFilter(id=user_id), UserChangeRoleSchema(role="user")
        )
        token_payload = self._build_token_payload(user)
        access_token = create_access_token(token_payload)
        return access_token

    async def get_user_by_id(self, user_id: int) -> User | None:
        return await self.user_repository.find_user_by_id(user_id)

    async def refresh_tokens(self, token: str) -> tuple[str, str]:
        token_record: RefreshToken | None = await self.refresh_repository.get_by_token(
            get_token_hash(token)
        )

        if not token_record:
            raise TokenNotFoundError()

        if token_record.revoked_at is not None:
            await self.refresh_repository.revoke_all_for_user(token_record.user_id)
            raise TokenRevokedError()

        if token_record.expires_at < datetime.now(timezone.utc):
            raise TokenExpiredError()

        user_id = token_record.user_id

        user = await self.user_repository.find_user_by_id(user_id)
        if not user:
            raise UserNotFoundError()

        token_payload = self._build_token_payload(user)

        access_token = create_access_token(token_payload)
        new_refresh_token = create_refresh_token()

        await self.refresh_repository.rotate_token(
            old_token=get_token_hash(token),
            new_token=get_token_hash(new_refresh_token),
            user_id=user_id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        )

        return access_token, new_refresh_token

    @staticmethod
    def _build_token_payload(user: User) -> dict:
        return {
            "sub": str(user.id),
            "role": user.role,
            "username": user.username,
        }
