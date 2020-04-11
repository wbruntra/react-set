from flask import Flask, request
from flask_restful import Resource, Api
import sqlite3
import json
import os

app = Flask(__name__)
api = Api(app)

db_filename = os.path.join(os.getcwd(), "db", "main.db")


def get_all(sql, params = []):
    with sqlite3.connect(db_filename) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_one(sql, params=[]):
    with sqlite3.connect(db_filename) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sql, params)
        row = cursor.fetchone()
        if not row:
            return {}
        return dict(row)

def insert(sql, params):
    with sqlite3.connect(db_filename) as conn:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        return True


class User(Resource):
    def get(self, uid):
        sql = "SELECT * FROM user_info WHERE uid = ?"
        row = get_one(sql, [uid])
        if not row:
            return {}, 404
        row["info"] = json.loads(row["info"])
        return row

    def post(self, uid=None):
        json_data = request.get_json(force=True)
        uid = json_data["uid"]
        existing_user = get_one('SELECT * FROM user_info WHERE uid = ?', [uid])
        if existing_user:
            return { "err" : "user exists" }
        sql = "INSERT INTO user_info(uid, email, info) VALUES (?, ?, ?)"
        params = [
            uid,
            json_data["info"].get("email", ""),
            json.dumps(json_data["info"]),
        ]
        insert(sql, params)
        return {"msg": "user saved"}


class Games(Resource):
    def get(self):
        sql = "SELECT * FROM game_info"
        games = get_all(sql)
        return games


class Game(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        param_names = [
            "total_time",
            "player_won",
            "difficulty_level",
            "winning_score",
            "uid",
        ]
        sql = "INSERT INTO game_info(total_time, player_won, difficulty_level, winning_score, player_uid) VALUES (?, ?, ?, ?, ?)"
        params = [json_data[name] for name in param_names]
        with sqlite3.connect(db_filename) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute(sql, params)

        return {"msg": "game saved"}


class Stats(Resource):
    def get(self, uid):
        sql = """
            SELECT Count(*)        AS games_played, 
                   Sum(player_won) AS games_won, 
                   difficulty_level 
            FROM   game_info 
            WHERE  player_uid = ? 
            GROUP  BY difficulty_level"""
        stats = get_all(sql, [uid])
        return stats


api.add_resource(Games, "/api/games")
api.add_resource(Game, "/api/game")
api.add_resource(Stats, "/api/user/stats/<string:uid>")
api.add_resource(User, "/api/user", "/api/user/<string:uid>")

if __name__ == "__main__":
    app.run(debug=True)
