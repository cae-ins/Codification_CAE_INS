import pandas as pd

from django.http import JsonResponse

def verifier_fichier_csv(file_path):
    # Vérifier si le fichier est d'extension CSV
    if not file_path.endswith('.csv'):

        return JsonResponse({'error': 'Erreur : Le fichier n\'est pas un fichier CSV.'})
    
    # Charger le fichier CSV dans un DataFrame
    try:
        df = pd.read_csv(file_path)
    except pd.errors.EmptyDataError:

        return JsonResponse({'error': 'Erreur : Le fichier CSV est vide.'})

    # Vérifier le nombre de colonnes
    if len(df.columns) != 1:

        return JsonResponse({'error': 'Erreur : Le fichier CSV doit avoir exactement une colonne.'})

    # Vérifier si le nom de la colonne est "libelle"
    if df.columns[0].lower() != 'libelle':
        return JsonResponse({'error': 'Erreur : Le nom de la colonne doit être \'libelle\'.'})

    # Si toutes les vérifications passent, le fichier peut être traité
    return JsonResponse({'success': 'ok'})


