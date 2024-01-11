import '../App.css';
import ResponsiveAppBar from '../components/Topbar';
import FileUploader from '../components/FileUploader';
import { useEffect } from 'react';
import { getCSRFToken } from '../utils/requestStore';
import CustomizedSteppers from '../components/Stepper';
import { useState } from 'react';

function Main() {
  const [progressionEtapes, setProgressionEtapes] = useState(0);

  const get_token = ()=>{
    
    getCSRFToken()
  }

  useEffect(()=>{
    get_token()
  }, [])

  return (
    <div className='main'>
      <ResponsiveAppBar/>
      <CustomizedSteppers progressionEtapes={progressionEtapes}/>
      <div className='FileUploaderContainer'>
        <div>
          <h4>
            Codification des emplois
          </h4>
          <p>
          Uploader votre fichier et laissez notre algorithme puissant attribuer à chaque emploi la codification CITP. Simplifiez le processus de classification des postes en quelques clics.
          </p>
        </div>
        <FileUploader setProgressionEtapes={setProgressionEtapes} className='FileUploader'/>
      </div>
    </div>
  );
}

export default Main;