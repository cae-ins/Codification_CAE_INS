# Utilisez une image officielle Python en tant qu'image de base
FROM python:3.11.5

# Définir le répertoire de travail dans le conteneur
WORKDIR /appdjango_bert

# Copier les fichiers de requirements.txt dans le conteneur
COPY requirements.txt .

# Installer les dépendances du projet
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste des fichiers dans le conteneur
COPY . .

# Exposer le port sur lequel l'application Django sera en cours d'exécution
EXPOSE 8000

# Commande pour démarrer l'application Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
