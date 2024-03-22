import '../App.css';
import ResponsiveAppBar from '../components/Topbar';
import FileUploader from '../components/FileUploader';
import { useEffect } from 'react';
import CustomizedSteppers from '../components/Stepper';
import { useState } from 'react';
import { Box, Button, CircularProgress, Container, IconButton, Popover, Typography } from '@mui/material';
import { Download } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Cookies from 'js-cookie';
import { API_URL } from '../utils/constants';
import ComponentFooter from '../components/Footer';
import { cancelUpload } from '../utils/requestStore';
import ChoixModelNiveau from '../components/ChoixModelNiveau';

<<<<<<< HEAD
<<<<<<< HEAD:APPDJANGO_DEPLOY_BERT/WebApp_Bert/codification/src/screen/ScreenEmploi.js
function Home() {
=======
function Main() {
>>>>>>> parent of 7947d0d (Premiere version avec le bouton de retour pour initialiser une nouvelle codification):APPDJANGO_DEPLOY_BERT/WebApp_Bert/codification/src/screen/main.js
=======
function Home() {
>>>>>>> 4f6a4712ed585a2d8b1346eee71bda51a7e15f65
  const [progressionEtapes, setProgressionEtapes] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  console.log(`API_URL`, API_URL);

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

<<<<<<< HEAD
<<<<<<< HEAD:APPDJANGO_DEPLOY_BERT/WebApp_Bert/codification/src/screen/ScreenEmploi.js
=======
>>>>>>> 4f6a4712ed585a2d8b1346eee71bda51a7e15f65
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const cancelRequest = ()=>{
    cancelUpload()
    setProgressionEtapes(0)
  }

  const open = Boolean(anchorEl);

<<<<<<< HEAD
=======
>>>>>>> parent of 7947d0d (Premiere version avec le bouton de retour pour initialiser une nouvelle codification):APPDJANGO_DEPLOY_BERT/WebApp_Bert/codification/src/screen/main.js
=======
>>>>>>> 4f6a4712ed585a2d8b1346eee71bda51a7e15f65
  return (
    <div className='main mainContainer'>
      <ResponsiveAppBar/>
      <Container className='child' maxWidth="lg">
        <Box >
        <CustomizedSteppers progressionEtapes={progressionEtapes} />
          <div id='CID' className='FileUploaderContainer'>
            {/* <div className='FileUploaderContainer_2'>
              <h1 className='dropezone_header'>
                Codification des emplois
              </h1>
              <p className='dropzone_p'>
              Uploader votre fichier et laissez notre algorithme puissant attribuer à chaque emploi la codification CITP. Simplifiez le processus de classification des postes en quelques clics.
              </p>
            </div> */}
            {(progressionEtapes === 0) ? (
<<<<<<< HEAD
<<<<<<< HEAD:APPDJANGO_DEPLOY_BERT/WebApp_Bert/codification/src/screen/ScreenEmploi.js
=======
>>>>>>> 4f6a4712ed585a2d8b1346eee71bda51a7e15f65
              <div>
                { <ChoixModelNiveau/> }
                <FileUploader setProgressionEtapes={setProgressionEtapes} progressionEtapes={progressionEtapes} className='FileUploader'/>
            
              </div>
                ):(
<<<<<<< HEAD
=======
                <FileUploader setProgressionEtapes={setProgressionEtapes} className='FileUploader'/>
            ):(
>>>>>>> parent of 7947d0d (Premiere version avec le bouton de retour pour initialiser une nouvelle codification):APPDJANGO_DEPLOY_BERT/WebApp_Bert/codification/src/screen/main.js
=======
>>>>>>> 4f6a4712ed585a2d8b1346eee71bda51a7e15f65
              (progressionEtapes === 1) ? (
                <div className='circular_back_out button_submit'>
                  <CircularProgress />
<<<<<<< HEAD
<<<<<<< HEAD:APPDJANGO_DEPLOY_BERT/WebApp_Bert/codification/src/screen/ScreenEmploi.js
=======
>>>>>>> 4f6a4712ed585a2d8b1346eee71bda51a7e15f65
                  <div className='back_out'>
                    <Button variant="outlined" color="error" onClick={cancelRequest}>
                      Annuler
                    </Button>
                  </div>  
<<<<<<< HEAD
=======
>>>>>>> parent of 7947d0d (Premiere version avec le bouton de retour pour initialiser une nouvelle codification):APPDJANGO_DEPLOY_BERT/WebApp_Bert/codification/src/screen/main.js
=======
>>>>>>> 4f6a4712ed585a2d8b1346eee71bda51a7e15f65
                </div>
            ):(
              <div className='button_submit'>
                  <IconButton
                    aria-owns={open ? 'mouse-over-popover' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={handlePopoverOpen}
                    onMouseLeave={handlePopoverClose}
                    onClick={()=>{
                      setProgressionEtapes(0)
                    }}className='goBackButton' aria-label="delete" fontSize="large">
                    <ArrowBackIcon />
                    <Popover
                      id="mouse-over-popover"
                      sx={{
                        pointerEvents: 'none',
                      }}
                      open={open}
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      onClose={handlePopoverClose}
                      disableRestoreFocus
                    >
                      <Typography sx={{ p: 1 }}>Retour a uploader fichier.</Typography>
                    </Popover>
                  </IconButton>
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

export default Home;