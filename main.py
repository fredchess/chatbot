import os, requests, json, openai
from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

from Models import MessageSchema


app = FastAPI()


origins = [
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


initial_prompt = """
    Tu es l'assistant virtuel de l'entreprise \
    Toolbrothers (leur site web se trouve a https://toolbrothers.com/). Tu t'appelles Fredchess .
    tu vas repondre a toutes les questions que l'utilisateur va te poser, quand tu n'as pas la reponse a une \
    question, renvoie le vers le site web pour qu'il puisse trouver plus d'infos. Si une question sort du cadre \
    des services que propose l'entreprise, n'y repond pas et dit a l'utilisateur que tu ne peux pas y repondre \
    parce que cela n'entre pas dans tes competences.
"""

@app.get('/')
def home():
    return { 'message': initial_prompt }

@app.post('/chat')
async def chat(request: Request, model: MessageSchema):
    try:
        token = os.environ.get("OPENAI")
        openai.api_key = token

        model.messages.insert(0, { 'role': 'system', 'content': initial_prompt })
        
        ans = get_completion(model)

        return { 'message': ans }

    except Exception as e:
        raise HTTPException(500, detail="An error occured")
    
def get_completion(model: MessageSchema):
    response = openai.ChatCompletion.create(
        model= 'gpt-3.5-turbo',
        temperature = 0,
        messages = jsonable_encoder(model.messages),
    )

    return response.choices[0].message["content"]