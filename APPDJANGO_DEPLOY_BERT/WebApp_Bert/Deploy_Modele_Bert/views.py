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
import tempfile
import shutil
from django.http import JsonResponse, HttpResponseBadRequest

#Fonction pour la transformation du fichier
def predict(request):
    
    #L'objet contenant les critères de verification
    verificateur = VerificateurTexte()

    # Créer des répertoires temporaires
    temp_dir = tempfile.mkdtemp()
    temp_dir1 = tempfile.mkdtemp()

    # Stocker les valeurs dans la session
    request.session['temp_dir'] = temp_dir
    request.session['temp_dir1'] = temp_dir1
    
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

    if request.method == 'POST' and request.FILES :
      
      input_file = request.FILES.get("file")
      file_content = input_file.read().decode('latin-1')

      file_object = StringIO(file_content)
        
      # Lire le contenu CSV dans un DataFrame
      f_input = pd.read_csv(file_object, sep=";", encoding="latin-1")

      #Verification de la conformité du fichier
      # responsVerif = verification(path='/')



      j=-1
      caracteres_errones = []
      for index, row in f_input.iterrows():
         
         j+=1
         text = str(row['libelle'])
         #Condition de verification des caractères du libellé
         if verificateur.verifie_longueur(text) or verificateur.verifie_caractere_unique(text) or \
         verificateur.verifie_trois_successifs(text) or verificateur.verifie_chiffres_uniquement(text):
            
            caracteres_errones.append(text)
            f_input = f_input.drop(index)

         else:
   
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

      #Exportation du fichier contenant des données érronées sur le serveur
      df_errone = pd.DataFrame({"libelle_errone": caracteres_errones})
      #errone_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'errone_data.csv')
      #df_errone.to_csv(errone_file_path, sep =';', index=False)
      errone_file_path = os.path.join(temp_dir, 'errone_data.csv')
      df_errone.to_csv(errone_file_path, sep=';', index=False)
      
      #Exportation du fichier contenant des données transformées sur le serveur
      #transformed_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'transformed_data.csv')
      #f_input.to_csv(transformed_file_path, sep =';', index=False)
      
      transformed_file_path = os.path.join(temp_dir1, 'transformed_data.csv')
      f_input.to_csv(transformed_file_path, sep=';', index=False)

      #Renvoyer la page pour telecharger le fichier
      return JsonResponse({'retour': 'ok'})
    
   
   
#Fonction qui retourne la page d'accueil   
def index(request):
    
   #Renvoyer la page pour charger le fichier
   #img_path = os.path.join(settings.MEDIA_ROOT,'images','logo-ins.png') 
   img_path = os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'images','logo-ins.png')
   return render(request,'Deploy_Modele_Bert/page_loading.html', {'img_path': img_path})

#Fonction qui retourne la page de téléchargement
def download_page(request):
    return render(request, 'Deploy_Modele_Bert/download_page.html')

#Fonction pour le telechargement du fichier transformé
def download_transformed_csv(request):

    # Récupérer les valeurs depuis la session
    temp_dir = request.session.get('temp_dir')
    temp_dir1 = request.session.get('temp_dir1')
    # Chemins vers les fichiers transformés
    #transformed_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'transformed_data.csv')
    guide_file_path = os.path.join(settings.MEDIA_ROOT, 'guide', 'guide.xlsx')
    transformed_file_path = os.path.join(temp_dir1, 'transformed_data.csv')
    #errone_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'errone_data.csv')
    errone_file_path = os.path.join(temp_dir, 'errone_data.csv')

    # Créez un objet Zip
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        # Ajoutez les fichiers au zip
        zip_file.write(transformed_file_path, arcname='transformed_data.csv')
        zip_file.write(errone_file_path, arcname='errone_data.csv')
        zip_file.write(guide_file_path, arcname='guide.xlsx')


    #Suppression des repertoires temporaires
    shutil.rmtree(temp_dir)
    shutil.rmtree(temp_dir1)

    # Répondez avec le contenu du zip
    response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename=transformed_files.zip'

    return response 
   
    
