include .env
export

# Detect OS
UNAME_S := $(shell uname -s)

server:
ifeq ($(UNAME_S), Linux)
	@sudo systemctl start postgresql.service
endif
	$(VENV)/python src/manage.py makemigrations;
	$(VENV)/python src/manage.py migrate;
	$(VENV)/python src/manage.py runserver;

test:
	$(VENV)/coverage run --source='.' src/manage.py test;
	$(VENV)/coverage html

lint:
	$(VENV)/isort .;
	$(VENV)/black .;
	$(VENV)/flake8

update-database:
	$(VENV)/python src/manage.py makemigrations;
	$(VENV)/python src/manage.py migrate;

migrate:
	docker compose exec django python manage.py makemigrations; 
	docker compose exec django python manage.py migrate;
