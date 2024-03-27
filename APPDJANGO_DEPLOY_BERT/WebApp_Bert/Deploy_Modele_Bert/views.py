import math
from django.shortcuts import render

from django.http import HttpResponse
import pandas as pd
from io import StringIO
from django.conf import settings
import os
from .mod_predict import predict_sic_code
from .control_file import VerificateurTexte
from .file_checker import verifier_fichier_csv
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
import pickle
from django.http import FileResponse
import zipfile
import io
import tempfile
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
import json

from rest_framework.views import APIView
from rest_framework import status

from django.http import StreamingHttpResponse
import time

def process_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        # Traitez le fichier ici

        # Simulez une progression de traitement (vous devrez ajuster cela en fonction de votre logique de traitement réelle)
        for progress in range(1, 101):
            time.sleep(0.1)  # Simulation de traitement
            # Envoyez un événement SSE avec la progression du traitement
            yield f"data: {progress}%\n\n"

        # Envoyez un événement SSE pour indiquer que le traitement est terminé
        yield "data: complete\n\n"
    else:
        return JsonResponse({'error': 'No file provided'}, status=400)


def event_stream(request, temp_dir):
   def postget(temp_dir):
      #yield '{"statut": "error", "message": "Une erreur est apparue lors de l\'initialisation.", "progress": 0}'
      progress_data = {
            "statut": "in progress",
            "message": "Traitement en cours",
            "progress": 0
      }
      # Convertir le dictionnaire en chaîne JSON
      progress_json = json.dumps(progress_data)
      # Envoyer la chaîne JSON en tant que message SSE
      yield f"data: {progress_json}\n\n"

      try:
         with open(os.path.join(tempfile.gettempdir(), temp_dir, 'data.json'), 'r') as fichier_json:
            data = json.load(fichier_json)
         
         verificateur = VerificateurTexte()
         model_load_path = os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'fine_tuned_model_runpod_distillbert')
         tokenizer_load_path = os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'fine_tuned_tokenizer_runpod_distillbert')
         label_encoder_load_path =  os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'label_encoder_runpod_distill_bert.pkl')

         with open(label_encoder_load_path, "rb") as f:
            label_encoder = pickle.load(f)
            f.close()

         model = DistilBertForSequenceClassification.from_pretrained(model_load_path)
         tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_load_path)
         
         index_item = 1
         print("taille", len(data))
         for item in data:
            print(index_item)
            file_path = item["file_path"]
            file_name = item["name"]
            colonne = item["colonne"]
            niveau = item["niveau"]

            with open(file_path, 'r', encoding='latin-1') as input_file:

               control_file = verifier_fichier_csv(input_file)

               if control_file['status'] == 'error':
                  yield f"data: {json.dumps({'statut': 'error', 'message': control_file['message'], 'progress': index_item * 100 / len(data)})}\n\n"

               else:
                  input_file.seek(0)
                  f_input = pd.read_csv(input_file, sep=";", encoding="latin-1")

                  caracteres_errones = []
                  for index, row in f_input.iterrows():
                     text = str(row['libelle'])
                     if verificateur.verifie_longueur(text) or verificateur.verifie_caractere_unique(text) or \
                     verificateur.verifie_trois_successifs(text) or verificateur.verifie_chiffres_uniquement(text):
                        caracteres_errones.append(text)
                        f_input = f_input.drop(index)
                     else:
                        predictions = predict_sic_code(text, model, tokenizer, label_encoder)
                        clef = []
                        valeur = []
                        dict_pred = {}
                        for i, (sic_code, certainty) in enumerate(predictions, 1):
                              clef.append(sic_code)
                              valeur.append(certainty)
                        for cle, valeur in zip(clef, valeur):
                              dict_pred[cle] = valeur
                        cle_max = max(dict_pred, key=dict_pred.get)
                        f_input.loc[index, 'Code'] = cle_max
                        f_input.loc[index, 'Vraisemblance'] = dict_pred[cle_max]

                     progress = math.floor(((index_item - 1) / len(data)) * 100 + (100 / len(data)) * index / len(f_input))
                     yield f"data: {json.dumps({'statut': 'in progress', 'message': 'Traitement en cours', 'progress': progress})}\n\n"

                  output_dir = os.path.join(tempfile.gettempdir(), temp_dir, 'output')
                  if not os.path.exists(output_dir):
                     os.makedirs(output_dir)
                  print(output_dir)
                  df_errone = pd.DataFrame({"libelle_errone": caracteres_errones})
                  errone_file_path = os.path.join(output_dir, f'errone_data_{file_name}.csv')
                  df_errone.to_csv(errone_file_path, sep=';', index=False)
                  transformed_file_path = os.path.join(output_dir, f'transformed_data_{file_name}.csv')
                  f_input.to_csv(transformed_file_path, sep=';', index=False)

                  print(errone_file_path, "\n", transformed_file_path)

               input_file.close()
            index_item += 1

      except Exception as e:
         yield f"data: {json.dumps({'statut': 'error', 'message': f'Une erreur est survenue: {str(e)}', 'progress': 0})}\n\n"

      yield f"data: {json.dumps({'statut': 'Complete', 'message': 'Traitement terminé avec success', 'progress': 100})}\n\n"

   response = StreamingHttpResponse(postget(temp_dir), content_type="text/event-stream")
   response['Cache-Control'] = 'no-cache'
   return response


def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

class UploadFiles(APIView):
   def oldpost(self, request, format=None):
      data_details = request.data.get('data_details')
      data = []

      if data_details:
         details = json.loads(data_details)
         for detail in details:
               print(detail)
               file_index = detail.get("index")
               uploaded_file = request.FILES.get(file_index)
               if uploaded_file:
                  detail["file"] = uploaded_file
                  data.append(detail)
               else:
                  return JsonResponse({
                     "statut" : 'error',
                     "message" : "Fichier manquant pour l'index {}".format(detail.get("name")),
                  } , status=status.HTTP_400_BAD_REQUEST)

      # Créer des répertoires temporaires
      temp_dir = tempfile.mkdtemp(prefix="codif_")
      print(temp_dir)

      for item in data:
         codif(item["niveau"], item["colonne"], temp_dir, item.get("file"))

      
      return JsonResponse({
         "temp_dir" : temp_dir.split("\\")[-1],
         "statut" : 'succes',
         "message" : "Traitement effectuer avec succes"
      }, status=status.HTTP_201_CREATED)
   
   def post(self, request, format=None):
        data_details = request.data.get('data_details')
        data = []

        
        # Créer un répertoire temporaire
        temp_dir = tempfile.mkdtemp(prefix="codif_")
        print(temp_dir)
        if data_details:
            details = json.loads(data_details)
            for detail in details:
                file_index = detail.get("index")
                uploaded_file = request.FILES.get(file_index)
                if uploaded_file:
                    #detail["file"] = uploaded_file
                    file_name = uploaded_file.name
                    file_path = os.path.join(temp_dir, file_name)
                    detail["file_path"] = file_path
                    data.append(detail)
                    
                    with open(file_path, 'wb') as destination:
                       for chunk in uploaded_file.chunks():
                           destination.write(chunk)
                else:
                    return JsonResponse({
                        "statut": 'error',
                        "message": "Fichier manquant pour l'index {}".format(detail.get("name")),
                    }, status=status.HTTP_400_BAD_REQUEST)
        
        detail_file_path = os.path.join(temp_dir, f"data.json")
        with open(detail_file_path, 'w') as detail_file:
            json.dump(data, detail_file)


        return JsonResponse({
            "temp_dir": temp_dir.split("\\")[-1],  # Nom du dossier temporaire
            "statut": 'succes',
            "message": "Fichiers uploader avec succès"
        }, status=status.HTTP_201_CREATED)

   def get(self, request, temp_dir):
        def postget(temp_dir):
            #yield '{"statut": "error", "message": "Une erreur est apparue lors de l\'initialisation.", "progress": 0}'
            progress_data = {
                "statut": "in progress",
                "message": "Traitement en cours",
                "progress": 0
            }
            # Convertir le dictionnaire en chaîne JSON
            progress_json = json.dumps(progress_data)
            # Envoyer la chaîne JSON en tant que message SSE
            yield f"data: {progress_json}\n\n"

            try:
                with open(os.path.join(tempfile.gettempdir(), temp_dir, 'data.json'), 'r') as fichier_json:
                    data = json.load(fichier_json)
                
                index = 1
                for item in data:
                    file_path = item["file_path"]
                    file_name = item["name"]
                    colonne = item["colonne"]
                    niveau = item["niveau"]

                    with open(file_path, 'r', encoding='latin-1') as fichier_csv:
                        file = fichier_csv

                        verificateur = VerificateurTexte()
                        model_load_path = os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'fine_tuned_model_runpod_distillbert')
                        tokenizer_load_path = os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'fine_tuned_tokenizer_runpod_distillbert')
                        label_encoder_load_path =  os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'label_encoder_runpod_distill_bert.pkl')

                        with open(label_encoder_load_path, "rb") as f:
                            label_encoder = pickle.load(f)

                        model = DistilBertForSequenceClassification.from_pretrained(model_load_path)
                        tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_load_path)

                        input_file = file
                        control_file = verifier_fichier_csv(input_file)

                        if control_file['status'] == 'error':
                            yield f"data: {json.dumps({'statut': 'error', 'message': control_file['message'], 'progress': index * 100 / len(data)})}\n\n"

                        else:
                            input_file.seek(0)
                            #file_content = input_file.read().decode('latin-1')
                            #file_object = StringIO(file_content)
                            f_input = pd.read_csv(input_file, sep=";", encoding="latin-1")

                            caracteres_errones = []
                            for index, row in f_input.iterrows():
                                text = str(row['libelle'])
                                if verificateur.verifie_longueur(text) or verificateur.verifie_caractere_unique(text) or \
                                verificateur.verifie_trois_successifs(text) or verificateur.verifie_chiffres_uniquement(text):
                                    caracteres_errones.append(text)
                                    f_input = f_input.drop(index)
                                else:
                                    predictions = predict_sic_code(text, model, tokenizer, label_encoder)
                                    clef = []
                                    valeur = []
                                    dict_pred = {}
                                    for i, (sic_code, certainty) in enumerate(predictions, 1):
                                        clef.append(sic_code)
                                        valeur.append(certainty)
                                    for cle, valeur in zip(clef, valeur):
                                        dict_pred[cle] = valeur
                                    cle_max = max(dict_pred, key=dict_pred.get)
                                    f_input.loc[index, 'Code'] = cle_max
                                    f_input.loc[index, 'Vraisemblance'] = dict_pred[cle_max]

                                progress = round((index + 1) * 100 / len(f_input))
                                
                                yield f"data: {json.dumps({'statut': 'in progress', 'message': 'Traitement en cours', 'progress': progress})}\n\n"

                            output_dir = os.path.join(tempfile.gettempdir(), temp_dir, 'output')
                            if not os.path.exists(output_dir):
                              os.makedirs(output_dir)
                            df_errone = pd.DataFrame({"libelle_errone": caracteres_errones})
                            errone_file_path = os.path.join(tempfile.gettempdir(), temp_dir, 'output', f'errone_data_{file_name}.csv')
                            df_errone.to_csv(errone_file_path, sep=';', index=False)
                            transformed_file_path = os.path.join(tempfile.gettempdir(), temp_dir, 'output', f'transformed_data_{file_name}.csv')
                            f_input.to_csv(transformed_file_path, sep=';', index=False)

                            yield f"data: {json.dumps({'statut': 'Complete', 'message': 'Traitement terminé avec success', 'progress': 100})}\n\n"

                    index += 1

            except Exception as e:
                yield f"data: {json.dumps({'statut': 'error', 'message': f'Une erreur est survenue: {str(e)}', 'progress': 0})}\n\n"

        def generate(temp_dir):
            for i in range(1, 101):
                yield f'{{"statut": "error", "message": "Une erreur est apparue {i}.", "progress": 0}}'
                time.sleep(1)

        response = StreamingHttpResponse(postget(temp_dir), content_type="text/event-stream")
        response['Cache-Control'] = 'no-cache'
        return response
   
#Fonction pour la transformation du fichier
@csrf_exempt
def predict(request):
 
      try:  
            #L'objet contenant les critères de verification
            verificateur = VerificateurTexte()

            # Créer des répertoires temporaires
            temp_dir = tempfile.mkdtemp(prefix="codif_")

            # Stocker les valeurs dans la session
            request.session['temp_dir'] = temp_dir
            
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

               control_file = verifier_fichier_csv(input_file)

               if(control_file['status'] == 'error'):
                    
                  return JsonResponse({
                  #"temp_dir" : temp_dir.split("\\")[-1],
                  "statut" : 'error',
                  "message" : control_file['message']
               })

               else:
                  input_file.seek(0)

                  file_content = input_file.read().decode('latin-1')
                  
                  # Utiliser StringIO pour créer un objet fichier virtuel
                  file_object = StringIO(file_content)
                  
                  # Lire le contenu CSV dans un DataFrame
                  f_input = pd.read_csv(file_object, sep=";", encoding="latin-1")

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
                  
                  transformed_file_path = os.path.join(temp_dir, 'transformed_data.csv')
                  f_input.to_csv(transformed_file_path, sep=';', index=False)

                  #Renvoyer la page pour telecharger le fichier
                  return JsonResponse({
                     "temp_dir" : temp_dir.split("\\")[-1],
                     "statut" : 'succes',
                     "message" : "Traitement effectuer avec succes"
                  })
            
      except Exception as e:
          
            print("Erreur dans le fichier:", e)
            
   
#Fonction qui retourne la page d'accueil
def index(request):

   #Renvoyer la page pour charger le fichier
   #img_path = os.path.join(settings.MEDIA_ROOT,'images','logo-ins.png')
   #img_path = os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'images','logo-ins.png')
   return render(request,'index.html')

def get_models_details(request):
   with open(os.path.join(settings.STATICFILES_DIRS[0], 'Deploy_Modele_Bert', 'config.json'), 'r') as fichier_json:
      data = json.load(fichier_json)
   
   print(data)

   return JsonResponse({
      "data" : data
   })

#Fonction qui retourne la page de téléchargement
def download_page(request):
    return render(request, 'Deploy_Modele_Bert/download_page.html')

#Fonction pour le telechargement du fichier transformé
def download_transformed_csv(request, temp_dir):
    print(os.path.join(tempfile.gettempdir(), temp_dir))
    temp_dir = os.path.join(tempfile.gettempdir(), temp_dir, 'output')
    print(temp_dir)
    # Récupérer les valeurs depuis la session
    # Chemins vers les fichiers transformés
    #transformed_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'transformed_data.csv')
    guide_file_path = os.path.join(settings.MEDIA_ROOT, 'guide', 'guide.xlsx')
    #transformed_file_path = os.path.join(temp_dir, 'transformed_data.csv')
    #errone_file_path = os.path.join(settings.MEDIA_ROOT, 'transformed_files', 'errone_data.csv')
    #errone_file_path = os.path.join(temp_dir, 'errone_data.csv')

    # Récupérer la liste des fichiers dans le dossier temporaire
    file_names = os.listdir(temp_dir)

    # Créez un objet Zip
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        # Ajoutez les fichiers au zip
                # Ajoutez tous les fichiers au zip
        for file_name in file_names:
            file_path = os.path.join(temp_dir, file_name)
            zip_file.write(file_path, arcname=file_name)
        zip_file.write(guide_file_path, arcname='guide.xlsx')


    #Suppression des repertoires temporaires
    #shutil.rmtree(temp_dir)

    # Répondez avec le contenu du zip
    response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename=transformed_files.zip'

    return response