---
title: "Five Python libraries worth learning first"
date: 2026-02-02
author: "CC Technical Team"
category: "Tutorial"
tags: ["python", "tutorial"]
excerpt: "If you know basic Python and want to build real things, these five libraries cover most of what you will reach for."
---

Basic Python gets you loops, functions and files. These five libraries are where it starts to feel like a real toolkit. Each one is a single `pip install` away.

## 1. requests: talk to the web

```python
import requests

r = requests.get("https://api.github.com/repos/KFUPM-COMPUTER-CLUB/website")
print(r.status_code, r.json()["stargazers_count"])
```

Every API, every scraper, every bot starts here. Learn `get`, `post`, `params`, `headers` and `r.json()` and you are set for most of them.

## 2. pandas: tables that behave

```python
import pandas as pd

df = pd.read_csv("attendance.csv")
print(df.groupby("event")["student_id"].nunique().sort_values(ascending=False))
```

Anything shaped like a spreadsheet belongs in a DataFrame. Filtering, grouping and joining take one line each, and reading CSV, Excel or JSON is the same call with a different name.

## 3. matplotlib: see the numbers

```python
import matplotlib.pyplot as plt

counts = df.groupby("event")["student_id"].nunique()
counts.plot(kind="bar")
plt.title("Attendance by event")
plt.tight_layout()
plt.savefig("attendance.png")
```

Not the prettiest charts, but the ones every other plotting library is built on. Once you can read a matplotlib figure you can read all of them.

## 4. FastAPI: ship an API in a file

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/events/{event_id}")
def event(event_id: int):
    return {"id": event_id, "name": "Techathon"}
```

Run it with `uvicorn main:app --reload` and you have a documented API at `/docs`. Type hints become validation for free, which is why so many hackathon backends start this way.

## 5. pytest: know when you broke it

```python
def slugify(title: str) -> str:
    return "-".join(title.lower().split())

def test_slugify():
    assert slugify("KAUST Connect") == "kaust-connect"
```

Put that in a file named `test_anything.py`, run `pytest`, and you have a test suite. It costs a minute now and saves an hour at 2 AM before a demo.

## Where to go next

Pick one project and use all five: pull data with requests, clean it with pandas, chart it with matplotlib, serve it with FastAPI, and test the piece you are least sure about. Bring it to the next workshop and we will look at it together.
