from django.shortcuts import render

from django.http import HttpResponse
import pandas as pd
from io import StringIO
from django.conf import settings
import os
from .mod_predict import predict_sic_code
from .control_file import VerificateurTexte
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
import pickle
from django.http import FileResponse
import zipfile
import io

def predict(request):
    
    #L'objet contenant les critères de verification
    verificateur = VerificateurTexte()
    
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
      caracteres_errones = []
      for text in f_input['libelle'].astype(str):
         
         
         #Condition de verification
         if verificateur.verifie_longueur(text) or verificateur.verifie_caractere_unique(text) or \
         verificateur.verifie_trois_successifs(text) or verificateur.verifie_chiffres_uniquement(text):
            
            caracteres_errones.append(text)

         else:

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
      
      #Exportation du fichier contenant des données érroné
      df_errone = pd.DataFrame({"libelle_errone": caracteres_errones})
      errone_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'errone_data.csv')
      df_errone.to_csv(errone_file_path, sep =';', index=False)
      
      # Créez le chemin du fichier transformé dans le nouveau dossier
      transformed_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'transformed_data.csv')
      # Enregistrez le DataFrame transformé au format CSV
      f_input.to_csv(transformed_file_path, sep =';', index=False)
    #Renvoyer la page pour telecharger le fichier
    return render(request,'Deploy_Modele_Bert/download_page.html')

def index(request):
   #Renvoyer la page pour charger le fichier
   return render(request,'Deploy_Modele_Bert/page_loading.html')

def download_transformed_csv(request):
   # Chemins vers les fichiers transformés
    transformed_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'transformed_data.csv')
    errone_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'errone_data.csv')

    # Créez un objet Zip
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        # Ajoutez les fichiers au zip
        zip_file.write(transformed_file_path, arcname='transformed_data.csv')
        zip_file.write(errone_file_path, arcname='errone_data.csv')

    # Répondez avec le contenu du zip
    response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename=transformed_files.zip'

    return response 
   
    
