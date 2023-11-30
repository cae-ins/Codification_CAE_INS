class VerificateurTexte:
    @staticmethod
    def verifie_longueur(texte):
        return len(texte) < 5

    @staticmethod
    def verifie_caractere_unique(texte):
        return len(texte) == 1

    @staticmethod
    def verifie_trois_successifs(texte):
        # Retirer les espaces du texte
        texte_sans_espaces = texte.replace(" ", "")
    
        for i in range(len(texte_sans_espaces) - 2):
            if texte_sans_espaces[i] == texte_sans_espaces[i + 1] == texte_sans_espaces[i + 2]:
                return True
        return False

    @staticmethod
    def verifie_chiffres_uniquement(texte):
        return texte.isdigit()
