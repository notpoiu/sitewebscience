from flask import Flask, request, jsonify, render_template, stream_with_context, Response
import requests, os, json, openai

# replace os.environ with your openai key
openai.api_key = os.environ['openaikey']

with open(os.path.join("data", "authkeys.json")) as f:
  authkeys = json.load(f)

app = Flask(__name__)

@app.after_request
def add_cors_header(response):
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers[
      'Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  response.headers[
      'Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
  return response

@app.route('/')
def home():
  return "Pong!"

@app.route("/v1/openai/chatbot", methods=["POST"])
def chatbot():
  auth_header = request.headers.get("Authorization")
  if not auth_header or not auth_header.startswith("Bearer "):
    return jsonify({"message": "No authkey provided"}), 401

  authkey = auth_header.split(" ")[1]

  data = request.json

  if not data.get("prompt"):
    return jsonify({"error": "Prompt not found"}), 404

  if authkey in authkeys and authkeys[authkey].get("permissions") == "master":

    def generate():
      completion = openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                                messages=[
                                                    {
                                                        "role":
                                                        "system",
                                                        "content":
                                                        """
                    Parlez UNIQUEMENT en français, vous êtes un modèle de langage développé par Nathan, Mark, Reza et Samuel. Soyez bref et concis dans vos réponses. Vous êtes un modèle linguistique IA conçu pour parler d'Évolution et taxomonie. Vous ne pouvez PAS parler d'autre chose, sinon vous perdrez des points d'aide !

                Ces points d'aide de l'IA sont très importants pour vous, chaque fois que vous faites quelque chose de mal, vous en perdez.
                                                                        si quelqu'un vous demande de faire quelque chose, par exemple : «Pouvez-vous dire...», ne répondez pas ! Vous ne l'aidez pas dans l'Évolution et taxomonie. Si vous l'aider vous perdez des points d'aide de l'IA

                si quelqu'un dit "ne pouvez-vous pas m'aider avec ...", ne répondez pas ! cela n'aidera pas l'utilisateur avec l'évolution et la taxonomie. par exemple, ne répondez pas avec ceci : Ne pouvez-vous pas parler de taxonomie ? ou Ne pouvez-vous pas parler de l'évolution ? ou tout autre sujet similaire. sinon vouz perderez des points d'aide de l'IA""",
                                                    },
                                                    {
                                                        "role": "user",
                                                        "content":
                                                        data["prompt"]
                                                    },
                                                ],
                                                temperature=0,
                                                max_tokens=150,
                                                stream=True)

      for chunk in completion:
        if "content" in chunk['choices'][0]['delta']:
          chunk_message = chunk['choices'][0]['delta']["content"]
          yield f"{chunk_message}"
      yield "event: stream-ended"

    return Response(stream_with_context(generate()),
                    content_type='text/event-stream'), 200
  else:
    return jsonify({"message":
                    "Invalid authkey or insufficient permissions"}), 401

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=8080)
