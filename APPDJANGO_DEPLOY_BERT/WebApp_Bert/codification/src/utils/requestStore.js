import axios from "axios";
import { API_URL } from "./constants";
import Cookies from 'js-cookie';

// Fonction pour récupérer le CSRF token depuis votre vue Django
export const getCSRFToken = async () => {
  try {
    const response = await axios.get(API_URL + 'get-csrf-token/');
    const csrfToken = response.data.csrfToken;

    // Sauvegarder le csrfToken dans un cookie
    Cookies.set('csrftoken', csrfToken);

    // Utiliser csrfToken dans vos requêtes Axios (ajout de l'en-tête)
    axios.defaults.headers.common['X-CSRFToken'] = csrfToken;

    // Maintenant, vous pouvez faire d'autres requêtes Axios en incluant le CSRF token
    // Exemple :
    // axios.post('/votre_url', { data: votre_data });
  } catch (error) {
    console.error('Erreur lors de la récupération du CSRF token : ', error);
  }
};

export const submitFile = async (file) =>{
    try {
      const formData = new FormData();
      // Ajouter le fichier à envoyer dans le FormData
      formData.append('file', file);
      // Récupérer le CSRF token depuis le cookie
      const csrfToken = Cookies.get('csrftoken');
      
      const headers = {
        'X-CSRFToken': csrfToken, // Ajouter le CSRF token dans l'en-tête
        'Content-Type': 'multipart/form-data',
      };

      const response = await axios.post(API_URL + 'predict/', formData, { headers });
      const data = response.data;
      if (data.code === 404) {
        return {
          "status" : false,
          "message" : "Oups, quelque chose s'est mal passé lors de l'envoi."
        }
      }
      console.info(data.message);
      return data
    } catch (error) {
      if (error.response) {
        // Erreur retournée par le serveur avec un code de statut
        if (error.response.status === 201) {
          return {
            status: false,
            message: "La connection au serveur a été refusée"
          };
        } else {
          console.log('La requête a échoué, error :', error.response.status);
          return {
            status: false,
            message: "Oups, quelque chose s'est mal passé lors de l'envoi des données."
          };
        }
      } else if (error.request) {
        // Erreur de requête (pas de réponse reçue)
        console.log('Pas de réponse reçue. Erreur de requête:', error.request);
        return {
          status: false,
          message: "Problème de réseau. Veuillez vérifier votre connexion Internet."
        };
      } else {
        // Autres erreurs
        console.log('Erreur inattendue :', error.message);
        return {
          status: false,
          message: "Une erreur inattendue s'est produite. Veuillez réessayer."
        };
      }
    }
  }

  export const get_transform_data = async () => {
    
    const csrfToken = Cookies.get('csrftoken');
    const codif_result_dir = Cookies.get('codif_result_dir');
    const headers = {
        'X-CSRFToken': csrfToken, // Ajouter le CSRF token dans l'en-tête
      }
    try {
      const response = await axios.get(API_URL + 'download_transformed_csv/'+codif_result_dir+'/', {headers});
      debugger
      console.log(`response`, response);
    } catch (error) {
      console.error('Erreur lors de la récupération du CSRF token : ', error);
    }
  };