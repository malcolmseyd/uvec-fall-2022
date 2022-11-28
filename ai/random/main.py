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
        if randrange(2) == 1:
            x, y = randrange(len(data.vline)), randrange(len(data.vline[0]))
            if data.vline[x][y] == 0:
                return {"type": "v", "location": [x, y], "eval": randrange(9)}
        else:
            x, y = randrange(len(data.hline)), randrange(len(data.hline[0]))
            if data.hline[x][y] == 0:
                return {"type": "h", "location": [x, y], "eval": randrange(9)}
