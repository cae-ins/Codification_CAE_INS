class VerificateurTexte:
    @staticmethod
    def verifie_longueur(texte):
        return len(texte) < 5

    @staticmethod
    def verifie_caractere_unique(texte):
        return len(texte) == 1

    @staticmethod
    def verifie_trois_successifs(texte):
        for i in range(len(texte) - 2):
            if texte[i] == texte[i + 1] == texte[i + 2]:
                return True
        return False

    @staticmethod
    def verifie_chiffres_uniquement(texte):
        return texte.isdigit()
