import { Button, styled } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { submitFile } from '../utils/requestStore';
import Cookies from 'js-cookie';
import { Send } from '@mui/icons-material';
import Papa from 'papaparse';
import InteractiveList from './FormulaireSelection';
import { API_URL } from '../utils/constants';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


function DenseTable({ colonnes, rows }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {colonnes.map((col, index) => (
              <TableCell key={index}>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {colonnes.map((col, index) => (
                <TableCell key={index} align={index == 0 ? "th": "right"}>
                  {row[col]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const Demo = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const FileUploader = ({setProgressionEtapes, showError, showPreview, setProgress}) => {

  const [dense, setDense] = React.useState(false);
    
  const [selectedFiles, setSelectedFiles] = useState([]);


  const onDrop = useCallback(async (acceptedFiles) => {
    const authorizedFiles = acceptedFiles.filter((file => (file.type === "text/csv") || (file.type === "application/vnd.ms-excel") || (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")));
    const noAuthorizedFiles = acceptedFiles.filter(file => !((file.type === "text/csv") || (file.type === "application/vnd.ms-excel") || (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")));

    const updatedFiles = await Promise.all(authorizedFiles.map(async (file) => {
    try {
      const colonne = await getColonneDetail(file);
      const previewData = await getPreviewData(file);
      return {
        file,
        name: file.name,
        colonne,
        previewData,
        selectedColonne: null,
        niveau_codification: null
      };
    } catch (error) {
        showError("Erreur", "Erreur lors de l'obtention des colonnes du fichier :" + error)
        console.error("Erreur lors de l'obtention des colonnes du fichier :", error);
        return null;
      }
    }));
  
    const filteredFiles = updatedFiles.filter(file => file !== null);

    
    if (noAuthorizedFiles.length > 0){
      showError("Erreur", "Les fichiers suivant ne sont pas des fichiers csv ou excel : "  + noAuthorizedFiles.map(file => file.name).join(", "));
    }
    console.error("Ces fichiers ne sont pas des csv : ", noAuthorizedFiles)
    setSelectedFiles([...selectedFiles, ...filteredFiles]);
    
    console.log(`auth`, selectedFiles);
  }, []);

  const removeFile = (fileName) => {
    const updatedFiles = selectedFiles.filter(file => file.name !== fileName);
    setSelectedFiles(updatedFiles);
  };

  const preView = (element, file) => {
    console.log("Previsualisation du fichier : ", file.name);
    showPreview(element, file.name)
  }
  const handleChangeCol = (file, colonne) =>{
    let fileIndex = selectedFiles.indexOf(file)
    let remplacementList = selectedFiles
    remplacementList[fileIndex].selectedColonne = colonne

    setSelectedFiles(remplacementList);
    console.log(selectedFiles);
  }

  const startSSE = useCallback((temp_dir) => {
    console.log(`test`);
    const eventSource = new EventSource(API_URL+'stream-traitement/'+temp_dir+'/');
    eventSource.onmessage = (event) => {
        const eventData = JSON.parse(event.data);
        //console.log(`eventData`, eventData);
        if (eventData.statut == "Complete") {
            setProgress(parseInt(eventData.progress));
            eventSource.close();
            setProgressionEtapes(2)
        } else {
            setProgress(parseInt(eventData.progress));
        }
    };

    return () => {
         setProgress(7)
    };
  }, []);


  const submitFiles = useCallback(() => {
    setProgressionEtapes(1)
    submitFile(selectedFiles)
    .then((data)=>{
      if(data.statut === "succes" && data.temp_dir){
        Cookies.set('codif_result_dir', data.temp_dir);
        //setProgressionEtapes(2)
        console.log(data);
        startSSE(data.temp_dir)
      }else{
        if (data.statut === "error") {
          showError(data.statut, data.message)
          setProgressionEtapes(0)
        }else{
          showError("Erreur", data.message)
          setProgressionEtapes(0)
        }
      }
    })
    .catch((errors) => {
      console.log(errors);
      setProgressionEtapes(0)
    })
  }, [selectedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const getColonneDetail = (file) => {
    return new Promise((resolve, reject) => {
      if (file) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log(`results.data`, results.data);
            resolve(results.meta.fields);
          },
          error: (error) => {
            reject(error);
          }
        });
      } else {
        reject(new Error("Le fichier n'est pas valide."));
      }
    });
  };

  const getPreviewData = (file) => {
    return new Promise((resolve, reject) => {
      if (file) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          preview: 10, // Prévisualiser les 10 premières lignes
          complete: (results) => {
            console.log(`results.data`, results.data);
            resolve(results.data); // Résoudre la promesse avec les données de prévisualisation
          },
          error: (error) => {
            reject(error);
          }
        });
      } else {
        reject(new Error("Le fichier n'est pas valide."));
      }
    });
  };
  


  function handleChangeNiveau(file, niveau) {
    let fileIndex = selectedFiles.indexOf(file);
    let remplacementList = selectedFiles;
    remplacementList[fileIndex].niveau_codification = niveau;

    setSelectedFiles(remplacementList);
  }



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
                {/* <h4>Fichiers sélectionnés :</h4>
                {/* <h4>Fichiers sélectionnés :</h4>
                <div>
                  <Stack spacing={2} direction='row' flexWrap="wrap">
                      {selectedFiles.map((file, index) => (
                          <Chip label={file.name} variant="outlined" onDelete={()=>{
                              removeFile(file.name)
                          }} />
                      ))}
                  </Stack>
                  <Stack spacing={2} direction='row' flexWrap="wrap">
                      {selectedFiles.map((file, index) => (
                          <Chip label={file.name} variant="outlined" onDelete={()=>{
                              removeFile(file.name)
                          }} />
                      ))}
                  </Stack>
                </div>
                <div>
                  
                </div> */}
                
    <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
      <Grid container>
        <Grid item xs={20} md={15}>
          <Demo>
            <List dense={dense}>
                

                {selectedFiles.map((file, index) => (
                  <InteractiveList key={file.name + index} label={file.name} file={file} setSelectedFiles={setSelectedFiles} onDelete={()=>{removeFile(file.name)}} preView={()=>{preView(<DenseTable colonnes={file.colonne} rows={file.previewData}/>, file)}} handleChangeCol={(colonne)=>{handleChangeCol(file, colonne)}} handleChangeNiveau={(niveau)=>{handleChangeNiveau(file, niveau)}}/>
                ))}
              
            </List>
          </Demo>
        </Grid>
      </Grid>
    </Box>
                
    <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
      <Grid container>
        <Grid item xs={20} md={15}>
          <Demo>
            <List dense={dense}>
                

                {selectedFiles.map((file, index) => (
                  <InteractiveList key={file.name + index} label={file.name} file={file} setSelectedFiles={setSelectedFiles} onDelete={()=>{removeFile(file.name)}} preView={()=>{preView(<DenseTable colonnes={file.colonne} rows={file.previewData}/>, file)}} handleChangeCol={(colonne)=>{handleChangeCol(file, colonne)}} handleChangeNiveau={(niveau)=>{handleChangeNiveau(file, niveau)}}/>
                ))}
              
            </List>
          </Demo>
        </Grid>
      </Grid>
    </Box>

                
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
