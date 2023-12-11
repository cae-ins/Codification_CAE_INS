-----------------------------------------GUIDE DE LANCEMENT DU PROJET EN LOCAL(Windows)-------------------------------------------------

ETAPE 1:

- Cloner le projet depuis le repertoire distant avec la methode traditionnelle sur github.

ETAPE 2:
 
- Lien partagé :
- Mot de passe :

Accedez au repertoire du lien partagé avec le mot de passe ci-dessus. Copier tout le contenu de ce repertoire pour le deposer dans le repertoire \APPDJANGO_DEPLOY_BERT\WebApp_Bert\Deploy_Modele_Bert\static\Deploy_Modele_Bert de votre depot local.


ETAPE 3 :

- Ouvrez votre invite de commande, positionnez-vous dans le repertoire \APPDJANGO_DEPLOY_BERT de votre depot local.
- Ensuite tapez la commande suivante pour activer l'environnement virtuel: env\Scripts\activate.bat
- Toujours dans la meme posture, tapez la commande suivante : cd WebApp_Bert
- Ensuite saisissez la commande suivante pour lancer le serveur Django: python manage.py runserver

ETAPE 4 :

- Une fois que le serveur est lancé, accédez à la plateforme à travers le navigateur avec l'adresse http://127.0.0.1:8000

