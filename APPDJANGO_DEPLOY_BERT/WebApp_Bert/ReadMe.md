# GUIDE DE LANCEMENT DE L'APPLICATION DE CODIFICATION EN LOCAL

## Approche d'installation 1 - Création d'Environnement virtuel

### ETAPE 1: Cloner le projet depuis le repertoire distant de la branche New_Design sur github .
```
git clone https://github.com/cae-ins/Codification_CAE_INS
```
### ETAPE 2: Téléchargement du fichier de poids depuis le lien ci-après
 
- Lien partagé : https://gouvci-my.sharepoint.com/:f:/g/personal/cae_stat_plan_gouv_ci/EnUuEiOAcaxCpIWzOdxKVxMB_aNvkUNweq4_IdpYMcb9Bg?e=ZTqlAg

- Mot de passe : ``2hb4SzA4``

Accedez au repertoire du lien partagé avec le mot de passe ci-dessus. 
Copier tout le contenu de ce repertoire pour le deposer dans le repertoire ``\APPDJANGO_DEPLOY_BERT\WebApp_Bert\Deploy_Modele_Bert\static\Deploy_Modele_Bert`` de votre depôt local.

### ETAPE 3 : Lancement de l'application de codification

- Installez le module virtualenv avec la commande : ``pip install virtualenv``
- Installez une nouvelle version de python compatible: v3.11.5 ou plus.
- Ouvrez votre invite de commande, positionnez-vous dans le repertoire ``\APPDJANGO_DEPLOY_BERT\WebApp_Bert`` de votre depot local.
- Ensuite exécutez la commande pour créer l'environnement virtuel: ``virtualenv -p "chemin\vers\l'executable(python.exe)\de votre\nouveau python" env``
- Ensuite tapez la commande suivante pour activer l'environnement virtuel: ``env\Scripts\activate.bat``
- Toujours dans la meme posture, exécutez la commande : ``pip install -r requirements.txt``
- Une fois l'installation des packages terminés, saisissez la commande suivante pour lancer le serveur Django: ``python manage.py runserver``

### ETAPE 4 : C'est parti, vous pouvez tester !!!!

- Une fois que le serveur est lancé, accédez à la plateforme à travers le navigateur avec l'adresse ``http://127.0.0.1:8000``
- NB : Assurez-vous d'avoir acces à internet pour un bon affichage de la page.


## Approche d'installation 2 - Image Docker

### ETAPE 1 : Installation de l'application Docker
Il faut avoir impérativement Docker sur sa machine. Vous pourrez l'installer via le lien suivant : ``https://www.docker.com/products/docker-desktop/``. Il faudra activer la virtualisation sur votre ordinateur avant l'installation de ``Docker Desktop``.

### ETAPE 2 : Installation de l'image Docker de l'application

1. En premier, il faudra démarrer l'application ``Docker Desktop`` sur votre machine.
2. Ouvrez votre invite de commande, positionnez-vous dans le repertoire ``\APPDJANGO_DEPLOY_BERT\WebApp_Bert`` de votre depôt local.
3. Ensuite exécuter la commande suivante pour construire l'image : ``docker-compose build``
4. Ensuite exécuter la commande suivante pour lancer le conteneur : ``docker-compose up``

### ETAPE 3 : C'est parti, vous pouvez tester !!!!

Une fois que le serveur est lancé, accédez à la plateforme à travers le navigateur avec l'adresse ``http://127.0.0.1:8000``
.NB : Assurez-vous d'avoir accès à internet pour un bon affichage de la page.










