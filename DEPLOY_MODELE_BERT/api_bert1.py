
#API_2
from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Request, Depends, HTTPException
from flask import render_template
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
from mod_predict import predict_sic_code
import pickle

app = FastAPI()

templates = Jinja2Templates(directory="")

# Emplacements où le modèle et le tokenizer ont été sauvegardés
model_load_path = "fine_tuned_model_runpod_distillbert"
tokenizer_load_path = "fine_tuned_tokenizer_runpod_distillbert"
label_encoder_load_path = "label_encoder_runpod_distill_bert.pkl"

with open(label_encoder_load_path, "rb") as f:
   label_encoder = pickle.load(f)

# Charger le modèle DistilBERT
model = DistilBertForSequenceClassification.from_pretrained(model_load_path)
# Charger le tokenizer associé
tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_load_path)

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index2.html", {"request": request,})

@app.post("/predict", response_class=HTMLResponse)
async def predict(request: Request):
    form_data = await request.form()
    text = form_data["text"]
    
    # Prédiction avec le modèle et le tokenizer chargés
    predictions = predict_sic_code(text, model, tokenizer, label_encoder)

    # Afficher les résultats dans une page web
    html_content = f"""
    <html>
        <head>
            <title>Prédiction de SIC code</title>
        </head>
        <body>
            <h1>Résultats de la prédiction</h1>
            <p>Texte : {text}</p>
            <p>Top 5 des codes SIC prédits :</p>
            <ul>
    """

    for i, (sic_code, certainty) in enumerate(predictions, 1):
        html_content += f"<li>SIC code: {sic_code}, Certainty: {certainty:.4f}</li>"

    html_content += """
            </ul>
        </body>
    </html>
    """

    return HTMLResponse(content=html_content)


