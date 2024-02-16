import '../App.css';
import Modal from '@mui/material/Modal';
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

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function Home({ model }) {
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

  const open_popover = Boolean(anchorEl);

  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Title");
  const [modalMessage, setModalMessage] = useState("Aucun message");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const showError = (title, msg) => {
    setModalTitle(title)
    setModalMessage(msg)
    handleClickOpen()
  }

  return (
      <Container className='child' maxWidth="lg">
        <Box >
        <CustomizedSteppers progressionEtapes={progressionEtapes} />
          <div id='CID' className='FileUploaderContainer'>
            <div className='FileUploaderContainer_2'>
              <h1 className='dropezone_header'>
                Codification des {model}
              </h1>
              <p className='dropzone_p'>
              Uploader votre fichier et laissez notre algorithme puissant attribuer à chaque emploi la codification CITP. Simplifiez le processus de classification des postes en quelques clics.
              </p>
            </div>
            {/* <Button onClick={handleOpen}>Open modal</Button> */}
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {modalTitle}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {modalMessage}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>RETOUR</Button>
                {/* <Button onClick={handleClose} autoFocus>Agree</Button> */}
              </DialogActions>
            </Dialog>
            {(progressionEtapes === 0) ? (
              <div>
                {/* { <ChoixModelNiveau/> } */}
                <FileUploader setProgressionEtapes={setProgressionEtapes} showError={showError} className='FileUploader'/>
            
              </div>
                ):(
              (progressionEtapes === 1) ? (
                <div className='circular_back_out button_submit'>
                  <CircularProgress />
                  <div className='back_out'>
                    <Button variant="outlined" color="error" onClick={cancelRequest}>
                      Annuler
                    </Button>
                  </div>  
                </div>
            ):(
              <div className='button_submit'>
                  <IconButton
                    aria-owns={open_popover ? 'mouse-over-popover' : undefined}
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
                      open={open_popover}
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
  );
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "max-content;",
  bgcolor: 'background.paper',
  //border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default Home;