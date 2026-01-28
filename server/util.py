import json
from scipy import sparse
from sklearn.metrics.pairwise import cosine_similarity

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
GAME_INFO_JSON_DIR = BASE_DIR / "server" / "model" / "latest_popular_games_data_complete.json"
GAME_MATRIX_NPZ_DIR = BASE_DIR / "server" / "model" / "final_game_matrix_normalized.npz"


_popular_games_data_complete = None
_popular_games_data_client = dict()
_game_details = None
_games_tag_names_list = None
_final_game_matrix = None

def load_artifacts():
    print('--util file loading artifacts--')

    global _popular_games_data_complete
    global _popular_games_data_client
    global _final_game_matrix
    global _game_details
    global _games_tag_names_list

    with open(GAME_INFO_JSON_DIR, 'r') as f:
        _popular_games_data_complete = json.load(f)
    
    _final_game_matrix = sparse.load_npz(GAME_MATRIX_NPZ_DIR)
    # print(_final_game_matrix.shape[0])

    _games_tag_names_list = _popular_games_data_complete['tag_names']
    _game_details = _popular_games_data_complete['game_details']

    for rowId, gameInfo in _game_details.items():
        _popular_games_data_client[rowId] = [gameInfo['appid'], gameInfo['name']]

    print('--util file artifacts loaded--')

load_artifacts()

def get_game_data():
    return _popular_games_data_client

def generate_and_make_recommendations(gameIndex: int):
    game_matching_list = list()
    matching_games_dicts = list()
    similarity_martix_for_game = None

    if 0 <= gameIndex < _final_game_matrix.shape[0]:
        similarity_martix_for_game = cosine_similarity(_final_game_matrix[gameIndex], _final_game_matrix)
    else:
        raise ValueError("Invalid index")

    game_matching_list = list(enumerate(similarity_martix_for_game[0]))
    game_matching_list.sort(key=lambda x: x[1], reverse=True)

    for game in game_matching_list[:49]:
        k = str(game[0]) # matching game index
        matching_games_dicts.append({
            'indexid': k,
            'name': _game_details[k]['name'],
            'appid': _game_details[k]['appid'],
            'thumbnail_img_url': _game_details[k]['thumbnail_img_url'],
            'popularity': _game_details[k]['popularity'],
            'rating': _game_details[k]['rating'],
            'tags': find_matching_tags(gameIndex, k)
        })

    ret_list_of_game_dict = list()
    top_similar = matching_games_dicts[1:11]
    top_similar.sort(key=lambda x: (-(0.75*x['rating'] + 0.25*x['popularity']), -x['popularity']))
    mid_similar = matching_games_dicts[11:]
    mid_similar.sort(key=lambda x: (-(0.7*x['popularity'] + 0.3*x['rating']), -x['rating']))
    ret_list_of_game_dict = [matching_games_dicts[0]] + top_similar + mid_similar

    return ret_list_of_game_dict

def find_matching_tags(gameIdX: int, gameIdY: int):
    gameIdX = str(gameIdX)
    gameIdY = str(gameIdY)
    gameX_tag_values = _game_details[gameIdX]['tag_values']
    gameY_tag_values = _game_details[gameIdY]['tag_values']
    most_similar_tags = list()

    for i, tag in enumerate(_games_tag_names_list):
        if gameX_tag_values[i] != 0 and gameY_tag_values[i] != 0:
            candidate_tag = [gameX_tag_values[i] * gameY_tag_values[i], tag]
            most_similar_tags.append(candidate_tag)

    most_similar_tags.sort(key = lambda x: x[0], reverse=True)
    ret_lim = 20 if gameIdX == gameIdY else 12
    return most_similar_tags[:min(ret_lim, len(most_similar_tags))]

# if __name__=='__main__':
#     print(load_artifacts())