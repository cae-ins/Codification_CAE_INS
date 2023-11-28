from django.shortcuts import render

from django.http import HttpResponse
import pandas as pd
from io import StringIO
from django.conf import settings
import os
from .mod_predict import predict_sic_code
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
import pickle
from django.http import FileResponse

def predict(request):
    
    # Emplacements où le modèle et le tokenizer ont été sauvegardés
    model_load_path = os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'fine_tuned_model_runpod_distillbert')
    tokenizer_load_path = os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'fine_tuned_tokenizer_runpod_distillbert')
    label_encoder_load_path =  os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'label_encoder_runpod_distill_bert.pkl')

    with open(label_encoder_load_path, "rb") as f:
        label_encoder = pickle.load(f)

    # Charger le modèle DistilBERT
    model = DistilBertForSequenceClassification.from_pretrained(model_load_path)
    # Charger le tokenizer associé
    tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_load_path)

    if request.method == 'POST' and request.FILES['file']:
      
      input_file = request.FILES['file']
      file_content = input_file.read().decode('latin-1')
        
      # Utiliser StringIO pour créer un objet fichier virtuel
      file_object = StringIO(file_content)
        
      # Lire le contenu CSV dans un DataFrame
      f_input = pd.read_csv(file_object, sep=";", encoding="latin-1")

      # Scripts de transformation du fichier csv
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
      

      # Créez le chemin du fichier transformé dans le nouveau dossier
      transformed_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'transformed_data.csv')

      # Enregistrez le DataFrame transformé au format CSV
      f_input.to_csv(transformed_file_path, sep =';', index=False)
    #Renvoyer la page pour telecharger le fichier
    return render(request,'Deploy_Modele_Bert/download_page.html')
    

def index(request):
   #Renvoyer la page pour charger le fichier
   #img_path = os.path.join(settings.MEDIA_ROOT,'images','logo-ins.png') 
   img_path = os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'images','logo-ins.png')
   return render(request,'Deploy_Modele_Bert/page_loading.html', {'img_path': img_path})

def download_transformed_csv(request):
    # Chemin vers le fichier transformé
    transformed_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'transformed_data.csv')

    # Vérifiez si le fichier existe avant de le renvoyer
    return FileResponse(open(transformed_file_path, 'rb'), as_attachment=True)
   
    
