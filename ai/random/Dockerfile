FROM python:3.10-slim

WORKDIR /bad

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY main.py .

CMD [ "uvicorn", "main:app" ]
