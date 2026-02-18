from models.refresh_token import RefreshToken
from repositories.abstract_token import AbstractTokenRepository
from schemas.refresh_token import (
    RefreshTokenFilter,
    RefreshTokenCreateSchema,
    RefreshTokenUpdateSchema,
)


class RefreshTokenRepository(AbstractTokenRepository[RefreshToken]):
    model = RefreshToken
    FilterCls = RefreshTokenFilter
    CreateSchema = RefreshTokenCreateSchema
    UpdateSchema = RefreshTokenUpdateSchema
