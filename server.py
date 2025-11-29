from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from words import words
import uvicorn
import random
import string
import jsonify

app = FastAPI()

# rodar na rede local -> utilizar o ipv4 da máquina que subiu o servidor + porta definida pelo front
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

rooms = dict()

# gerar código de sala pela junção de caracteres ascii aleatórios
def generate_room_code():
    code = list()
    for i in range(4):
        code.append(random.choice(string.ascii_uppercase))
    return "".join(code)

# função para comparar letra por letra o palpite e a palavra secreta
def check_word(guess, secret):
    result = []
    for i in range(len(secret)):
        if guess[i] == secret[i]:
            result.append("CORRETA")
        elif guess[i] in secret:
            result.append("PRESENTE")
        else:
            result.append("NÃO TEM")
    return result

# função para criar sala e adicionar ao dicionário 
# é chamada pelo endpoint no fetch do front
@app.post("/create-room")
def create_room():
    code = generate_room_code()
    rooms[code] = {
        "players": {},
        "secret_word": random.choice(words)
    }
    return {"room": code}

# função que instancia o websocket e realiza toda a lógica do back
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    room = None
    player_id = None
    try:
        while True:
            data = await ws.receive_json()
            if (data["type"] == "join"):
                room_code = data["room"]
                player_id = data["player_id"]
                if (room_code not in rooms):
                    return jsonify({"error":"Sala não encontrada"}), 404
                room = rooms[room_code]
                # se já conectado, substitui a conexão antiga
                if (player_id in room["players"]):
                    try:
                        await room["players"][player_id].close()
                    except:
                        pass
                room["players"][player_id] = ws
                # inicia com dois jogadores conectados
                if (len(room["players"]) == 2):
                    for p in room["players"].values():
                        await p.send_json({
                            "type": "start",
                            "word_length": len(room["secret_word"])
                        })
            # verificar palpite
            elif (data["type"] == "guess"):
                guess = data["guess"].upper()
                secret = room["secret_word"]
                result = check_word(guess, secret)
                # retorna um json com o resultado do palpite de cada player
                for p in room["players"].values():
                    await p.send_json({
                        "type": "guess",
                        "player": player_id,
                        "guess": guess,
                        "result": result
                    })
                # retorna o resultado para cada player em caso de vitória
                if (guess == secret):
                    for p in room["players"].values():
                        await p.send_json({
                            "type": "win",
                            "winner": player_id,
                            "word": secret
                        })
    except:
        if (room and player_id in room["players"]):
            del room["players"][player_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
