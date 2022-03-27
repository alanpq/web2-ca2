from flask_session import Session
from flask import Flask, redirect, render_template, request, session, url_for

app = Flask(__name__)

app.config["SECRET_KEY"] = "supersecretkey"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

Session(app)

@app.route('/')
def index():
  return render_template("index.html")