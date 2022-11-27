from random import choice, randrange

from fastapi import FastAPI
from pydantic import BaseModel


class Item(BaseModel):
    vline: list[list[int]]
    hline: list[list[int]]


app = FastAPI()


@app.post("/move")
def move(data: Item):
    print(data)
    while True:
        # thing = choice(["v", "h"])
        x, y = randrange(3), randrange(3)
        if data.vline[x][y] == 0:
            return {"type": "v", "location": [x, y]}
