up:
	docker compose up
down:
	docker compose down
restart:
	docker compose down && docker compose up
rebuild:
	docker compose down -v && docker compose up --build
ps:
	docker ps -a
backend:
	docker compose up backend database
frontend:
	docker compose up frontend