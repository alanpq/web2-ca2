from flask_session import Session
from flask import Flask, render_template, request
import json
from database import get_db
import random


app = Flask(__name__)

app.config["SECRET_KEY"] = "supersecretkey"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

Session(app)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
  return render_template("index.html")

@app.route('/score/token', methods=['POST'])
def token():
  db = get_db()
  tok = str(random.getrandbits(128));
  db.execute("INSERT INTO tokens VALUES (?)", (tok,))
  db.commit()
  return tok

@app.route('/score/submit', methods=['POST'])
def submit():
  body = request.get_json()
  print(body["token"])
  db = get_db()
  if len(db.execute("SELECT * FROM tokens WHERE token == ?", (body["token"],)).fetchall()) < 1:
    return "Error", 401
  db.execute("DELETE FROM tokens WHERE token == ?", (body["token"],))
  db.execute("INSERT INTO scores (username, score) VALUES (?,?)", (body["username"], body["score"]))
  db.commit()
  return "Success"


@app.route('/scores', methods=['GET'])
def scores():
  db = get_db()
  return json.dumps(list(map(lambda row: {
    "username": row["username"],
    "score": row["score"],
  },db.execute("SELECT * FROM scores ORDER BY score DESC LIMIT 10").fetchall())))