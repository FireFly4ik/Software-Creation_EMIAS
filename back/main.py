from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.scheduler import get_scheduler
from core.exceptions import AppError
from core.config import settings
from exception_handlers import app_error_handler, exception_handler
from handlers.appointment import router as appointment_router
from handlers.auth import router as auth_router
from handlers.doctor import router as doctor_router
from handlers.profile import router as profile_router
from services.jobs.finish_appointments import finish_appointments


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
    expose_headers=["Set-Cookie"],
)

@app.on_event("startup")
async def start_scheduler():
    scheduler = get_scheduler()

    if scheduler.get_job("finish_appointments") is None:
        scheduler.add_job(
            finish_appointments,
            trigger="cron",
            minute=f"*/{settings.CRON_FREQ_MINUTES}",
            id="finish_appointments",
            replace_existing=False,
        )

    scheduler.start()
