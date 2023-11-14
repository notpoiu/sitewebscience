from flask import Flask, request, jsonify, render_template, stream_with_context, Response
import os, json, openai,g4f
from g4f.Provider import GPTalk

# g4f is GPT 4 Free, it reverse engenieers llm playground sites like https://sdk.vercel.ai
# it is better to use the g4f library as it is free. Check out the repo here: https://github.com/xtekky/gpt4free

# replace os.environ with your openai key
#openai.api_key = os.environ['openaikey'] #OPENAI METHOD, more recommended

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
                                                        "role":"system",
                                                        "content":"""Friendly Assistant""",
                                                    },
                                                    {
                                                        "role": "user","content":data["prompt"]
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

@app.route("/v1/experiments/chatbot", methods=["POST"])
def experimental():
  data = request.json

  if not data.get("prompt"):
    return jsonify({"error": "Prompt not found"}), 404

  if not data.get("systemprompt"):
    data["systemprompt"] = "You are a friendly assistant"

  def generate():
    completion = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        provider=g4f.Provider.GPTalk,
        messages=[
            {
                "role": "system",
                "content": data.get("systemprompt"),
            },
            {
                "role": "user",
                "content": data["prompt"]
            },
        ],
        stream=True,
    )

    for chunk in completion:
      yield f"{chunk}"
    yield "event: stream-ended"

  return Response(stream_with_context(generate()),
                  content_type='text/event-stream'), 200


if __name__ == '__main__':
  app.run(host='0.0.0.0', port=8080)
