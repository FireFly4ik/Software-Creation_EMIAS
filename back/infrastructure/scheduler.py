from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler(
    timezone="UTC",
    job_defaults={"coalesce": False, "max_instances": 1},
)

def get_scheduler():
    return scheduler