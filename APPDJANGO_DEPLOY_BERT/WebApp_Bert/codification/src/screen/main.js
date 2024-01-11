import '../App.css';
import ResponsiveAppBar from '../components/Topbar';
import FileUploader from '../components/FileUploader';
import { useEffect } from 'react';
import { getCSRFToken, get_transform_data_url } from '../utils/requestStore';
import CustomizedSteppers from '../components/Stepper';
import { useState } from 'react';
import { Box, Button, CircularProgress, Container } from '@mui/material';
import { Download } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { API_URL } from '../utils/constants';
import ComponentFooter from '../components/Footer';

function Main() {
  const [progressionEtapes, setProgressionEtapes] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  console.log(`API_URL`, API_URL);

  const get_token = ()=>{
    getCSRFToken()
  }

  const getUrl = () => {
    try{
      const codif_result_dir = Cookies.get('codif_result_dir');
      setDownloadUrl(API_URL+'download_transformed_csv/'+codif_result_dir+'/')
      console.log(downloadUrl);
    }catch (error) {
      console.error('Erreur lors de la récupération du lien : ', error);
      return '#'
    }
  };

  useEffect(() => {
    console.log(Cookies.get('codif_result_dir'));
    if (progressionEtapes === 2) {
      getUrl();
    }
    console.log(`downloadUrl`, downloadUrl);
  }, [progressionEtapes]);

  const handleDownloadClick = () => {
    if (downloadUrl) {
      // Créez un lien de téléchargement programmatically et cliquez dessus
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'nom-du-fichier'; // Vous pouvez définir le nom du fichier ici
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className='main mainContainer'>
      <ResponsiveAppBar/>
      <Container className='child' maxWidth="lg">
        <Box >
        <CustomizedSteppers progressionEtapes={progressionEtapes}/>
          <div id='CID' className='FileUploaderContainer'>
            <div className='FileUploaderContainer_2'>
              <h1 className='dropezone_header'>
                Codification des emplois
              </h1>
              <p className='dropzone_p'>
              Uploader votre fichier et laissez notre algorithme puissant attribuer à chaque emploi la codification CITP. Simplifiez le processus de classification des postes en quelques clics.
              </p>
            </div>
            {(progressionEtapes === 0) ? (
                <FileUploader setProgressionEtapes={setProgressionEtapes} className='FileUploader'/>
            ):(
              (progressionEtapes === 1) ? (
                <div className='button_submit'>
                  <CircularProgress />
                </div>
            ):(
              <div className='button_submit'>
        
                  <Button
                    component="label"
                    onClick={handleDownloadClick}
                    variant="contained"
                    startIcon={<Download />}
                    disabled={!downloadUrl}
                    className='button_submit'
                  >
                    Télecharger fichier
                  </Button>
              </div>
            )
            )}
            
          </div>
        </Box>
      </Container>
      <ComponentFooter/>
    </div>
  );
}

export default Main;