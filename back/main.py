from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.exceptions import AppError
from exception_handlers import app_error_handler, exception_handler
from handlers.appointment import router as appointment_router
from handlers.auth import router as auth_router
from handlers.doctor import router as doctor_router
from handlers.profile import router as profile_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(doctor_router)
app.include_router(profile_router)
app.include_router(appointment_router)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tetrasyllabical-unestablishable-betsey.ngrok-free.dev",
        "http://localhost:3000",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],  # ВАЖНО!
)