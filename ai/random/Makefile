run:
	uvicorn main:app

dev:
	uvicorn main:app --reload

lint:
	black .
	isort .

post:
	cat test.json | http POST localhost:8000/move

dockerbuild:
	docker build -t doxes/ai/random:latest .

dockerrun:
	docker run doxes/ai/random:latest