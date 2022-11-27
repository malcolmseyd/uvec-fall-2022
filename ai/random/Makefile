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
	docker build -t bad/ai/random:latest .

dockerrun:
	docker run -p 8000:8000 bad/ai/random:latest
