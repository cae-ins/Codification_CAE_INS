import pandas as pd
from fastapi import FastAPI, Request, Depends, HTTPException, UploadFile, Form, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
from mod_predict import predict_sic_code
import pickle
from flask import render_template,send_file

import os
import shutil
from tempfile import TemporaryDirectory
from fastapi.responses import FileResponse

#------------------------------------------------------------------------------------------

#class CsvFile(BaseModel):
    #file: UploadFile

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


#------------------------------------------------------------------------------------------------

@app.post("/uploadcsv/")
async def upload_csv(file: UploadFile = File(...)):

    # Utilisez un répertoire temporaire pour stocker le fichier
    with TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, file.filename)
    
    # Sauvegardez le fichier téléchargé temporairement
        #with open(file_path, "wb") as buffer:
            #shutil.copyfileobj(file.file, buffer)
    
    f_input = pd.read_csv(file.file,sep=";",encoding="latin-1")
    #long = len(f_input)
    #df = pd.read_csv(csv_file.file)
    #df_head = df.head(5)

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

       # Sauvegardez le DataFrame traité dans un nouveau fichier CSV
       processed_file_path = os.path.join(temp_dir, "transformation_bert.csv")
       f_input.to_csv(processed_file_path, index=False)
       
    # Téléchargez le fichier traité sur l'ordinateur de l'utilisateur
    return FileResponse(processed_file_path, filename="transformation_bert.csv")