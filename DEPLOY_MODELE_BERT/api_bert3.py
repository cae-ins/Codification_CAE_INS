
#API_2
import pandas as pd
from io import StringIO,BytesIO
from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Request, Depends, HTTPException, UploadFile, Form, File
from flask import render_template,send_file
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
    #Acceder à la page d'accueil
    return templates.TemplateResponse("index2.html", {"request": request})



@app.post("/predict", response_class=HTMLResponse)
async def predict(file: UploadFile = File(...)):
    # Lire le fichier csv en Fataframe
    f_input = pd.read_csv(file.file, sep=";" ,encoding='latin-1')
    #content = await file.read()
    #decoded_content = content.decode("utf-8", errors='ignore')
    #f_input = pd.read_excel(BytesIO(decoded_content))

    j=-1
    for text in f_input['libelle'].astype(str):
       j+=1
       # Prédiction avec le modèle et le tokenizer chargés
       predictions = predict_sic_code(text, model, tokenizer, label_encoder)
       clef =[]
       valeur =[]
       dict_pred = {}
       for i, (sic_code, certainty) in enumerate(predictions, 1):
           clef.append(sic_code)
           valeur.append(certainty)
       for cle, valeur in zip(clef, valeur):
           dict_pred[cle] = valeur
       cle_max = max(dict_pred, key=dict_pred.get)
       f_input.loc[j, 'Code'] = cle_max
       f_input.loc[j, 'Vraisemblance'] = dict_pred[cle_max]
    #print(j)
    #print(f"{cle_max}:{dict_pred[cle_max]}")
    #f_input.to_excel('Output_TestApp.xlsx', index=False)

    return send_file(f_input, download_name='Output_TestApp.xlsx', as_attachment=True), 'Transformation reussie'


