import { Button, Chip, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { get_transform_data, submitFile } from '../utils/requestStore';
import Cookies from 'js-cookie';
import { Send } from '@mui/icons-material';

const FileUploader = ({setProgressionEtapes}) => {
    
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const updatedFiles = acceptedFiles.map(file => ({
        file,
        name: file.name,
      }));
        setSelectedFiles([...selectedFiles, ...updatedFiles]);
    }, [selectedFiles]);

  const removeFile = (fileName) => {
    const updatedFiles = selectedFiles.filter(file => file.name !== fileName);
    setSelectedFiles(updatedFiles);
  };

  const submitFiles = () =>{
    setProgressionEtapes(1)
    submitFile(selectedFiles[0].file)
    .then((data)=>{
        if(data.statut === "succes" && data.temp_dir){
            Cookies.set('codif_result_dir', data.temp_dir);
            setProgressionEtapes(2)
        }
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.csv', // Accepter uniquement les fichiers CSV
  });

  return (
    <div className='FileUploaderContainer_field'>
        <div {...getRootProps()} className='FileUploader' style={dropzoneStyles}>
            <input {...getInputProps()} />
            {
                isDragActive ?
                <p>Glissez et déposez les fichiers CSV ici...</p> :
                <p>Sélectionnez ou glissez-déposez un fichier CSV ici.</p>
            }
        </div>
        {selectedFiles.length > 0 && (
            <div>
                <h4>Fichiers sélectionnés :</h4>
                <div>
                <Stack spacing={2} direction='row' flexWrap="wrap">
                    {selectedFiles.map((file, index) => (
                        <Chip label={file.name} variant="outlined" onDelete={()=>{
                            removeFile(file.name)
                        }} />
                    ))}
                </Stack>
                </div>
            </div>
        )}
        <div className='button_submit'>
        <Button disabled={selectedFiles.length === 0} variant="contained" onClick={submitFiles}  startIcon={<Send />}>Codifier</Button>
        </div>
    </div>
  );
};

const dropzoneStyles = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  marginTop: '20px',
};

export default FileUploader;
