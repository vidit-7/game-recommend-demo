from flask import Flask, request, jsonify, render_template, url_for
from util import get_game_data, generate_and_make_recommendations

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

app = Flask(
    __name__,
    template_folder = BASE_DIR / "client" / "templates",
    static_folder = BASE_DIR / "client" / "static"
    )

@app.route('/')
def home():
    return render_template('game_rec_home.html')

@app.route('/fetch-games-data')
def fetch_games_data():
    game_data = get_game_data()

    response = jsonify({
        'popular_games_data': game_data
        })
    return response

@app.route('/get-recommendations/<int:gameId>')
def get_recommendations(gameId):    
    try:
        games_ret_dict = generate_and_make_recommendations(gameId)
        response = jsonify({
            'success': True,
            'game_recommendations': games_ret_dict
        })
        return response
    except ValueError as err:
        return jsonify({'success': False, 'error_message': err})

# if __name__=='__main__':
#     app.run()