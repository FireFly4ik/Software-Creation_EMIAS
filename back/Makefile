.DEFAULT_GOAL := run

run:
	uvicorn main:app

migrate:
	alembic revision --autogenerate -m 'hi'

update:
	alembic upgrade head

break:
	taskkill //F //IM python.exe //IM python3.exe //T


# запустить контейнеры
up:
	docker compose up

# остановить контейнеры
stop:
	docker compose stop

# полностью остановить и удалить контейнеры
down:
	docker compose down

# перезапуск с пересборкой если изменился код или зависимости
rebuild:
	docker compose up --build