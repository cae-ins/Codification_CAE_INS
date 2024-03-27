import pandas as pd
from io import StringIO

from django.http import JsonResponse

def verifier_fichier_csv(file):

    # Vérifier si le fichier est d'extension CSV
    if not file.name.endswith('.csv'):

        return {
            'status':'error' ,
            'message': 'Le fichier n\'est pas un fichier CSV.'
        }
    
    # Lire le fichier comme un DataFrame
    try:

        # file_content = file.read().decode('latin-1')
               
        # # Utiliser StringIO pour créer un objet fichier virtuel
        # file_object = StringIO(file_content)
               
        # Lire le contenu CSV dans un DataFrame
        df = pd.read_csv(file, sep=";", encoding="latin-1")
        #df = pd.read_csv()

    except pd.errors.EmptyDataError:

        return {
            'status':'error' ,
            'message': 'Le fichier CSV est vide.'
            }

    # Vérifier le nombre de colonnes
    if len(df.columns) != 1:

        return {
            'status':'error' ,
            'message': 'Le fichier CSV doit avoir exactement une colonne.'
            }

    # Vérifier si le nom de la colonne est "libelle"
    if df.columns[0].lower() != 'libelle':
        return {
            'status':'error',
            'message': 'Le nom de la colonne doit être \'libelle\'.'
            }

    # Si toutes les vérifications passent, le fichier peut être traité
    return {
        'status': 'succes',
        'message':'ok'
        }


