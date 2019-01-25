from flask import Flask, redirect

app = Flask(__name__)

@app.route('/index.html')
def index():
    return redirect('/')
