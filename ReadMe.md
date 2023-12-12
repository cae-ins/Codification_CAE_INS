# GUIDE DE LANCEMENT DE L'APPLICATION DE CODIFICATION EN LOCAL

## ETAPE 1: Cloner le projet depuis le repertoire distant de la branche New_Design sur github .
```
git clone https://github.com/cae-ins/Codification_CAE_INS
```

## ETAPE 2: Téléchargement du fichier de poids depuis le lien ci-après
 
- Lien partagé : https://gouvci-my.sharepoint.com/:f:/g/personal/cae_stat_plan_gouv_ci/EnUuEiOAcaxCpIWzOdxKVxMB_aNvkUNweq4_IdpYMcb9Bg?e=ZTqlAg

- Mot de passe : ``2hb4SzA4``

Accedez au repertoire du lien partagé avec le mot de passe ci-dessus. 
Copier tout le contenu de ce repertoire pour le deposer dans le repertoire ``\APPDJANGO_DEPLOY_BERT\WebApp_Bert\Deploy_Modele_Bert\static\Deploy_Modele_Bert`` de votre depôt local.


## ETAPE 3 : Lancement de l'application de codification

- Ouvrez votre invite de commande, positionnez-vous dans le repertoire ``\APPDJANGO_DEPLOY_BERT`` de votre depot local.
- Ensuite tapez la commande suivante pour activer l'environnement virtuel: ``env\Scripts\activate.bat``
- Toujours dans la meme posture, tapez la commande suivante : ``cd WebApp_Bert``
- Ensuite saisissez la commande suivante pour lancer le serveur Django: ``python manage.py runserver``

## ETAPE 4 : C'est parti, vous pouvez tester !!!!

- Une fois que le serveur est lancé, accédez à la plateforme à travers le navigateur avec l'adresse ``http://127.0.0.1:8000``
- NB : Assurez-vous d'avoir acces à internet pour un bon affichage de la page.

