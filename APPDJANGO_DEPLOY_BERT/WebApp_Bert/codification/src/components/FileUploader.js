import { Button, styled } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { submitFile } from '../utils/requestStore';
import Cookies from 'js-cookie';
import { Send } from '@mui/icons-material';
import Papa from 'papaparse';
import InteractiveList from './FormulaireSelection';
import { API_URL } from '../utils/constants';
import {v4 as uuidv4} from 'uuid';
import readXlsxFile, { readSheetNames } from 'read-excel-file'

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
                <TableCell key={index} align={index === 0 ? "th": "right"}>
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
    console.log(`selectedFiles`, selectedFiles);

    const authorizedFiles = acceptedFiles.filter((file => (file.type === "text/csv") || (file.type === "application/vnd.ms-excel") || (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")));
    const noAuthorizedFiles = acceptedFiles.filter(file => !((file.type ==="text/csv") || (file.type === "application/vnd.ms-excel") || (file.type ==="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")));

    const updatedFiles = await Promise.all(authorizedFiles.map(async (file) => {
    try {
      const {sheetNames, data} = await getPreviewData(file);
      const id = uuidv4()
      return {
        id: id,
        file,
        name: file.name,
        // colonne : data.columns,
        previewData : data,
        selectedColonne: null,
        niveau_codification: null,
        sheet: sheetNames[0],
        sheetNames,
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
  }, [selectedFiles, showError]);

  const removeFile = (id) => {
    const updatedFiles = selectedFiles.filter(file => file.id !== id);
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
        if (eventData.statut === "Complete") {
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
  }, [setProgress, setProgressionEtapes]);


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
  }, [selectedFiles, setProgressionEtapes, showError, startSSE]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });


  const getPreviewData = (file) => {

    return new Promise((resolve, reject) => {
      if (file.type === "text/csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          preview: 10, // Prévisualiser les 10 premières lignes
          complete: (results) => {
            let data = {}
            data[file.name] = {columns : results.meta.fields, previewData : results.data}
            let sheetNames = [file.name]
            resolve({sheetNames, data}); // Résoudre la promesse avec les données de prévisualisation
          },
          error: (error) => {
            reject(error);
          }
        });
      }
      if ((file.type === "application/vnd.ms-excel") || (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {

        readSheetNames(file).then(async (sheetNames) => {
          let fileData = {};
          let fileSheetNames = sheetNames;
      
          await Promise.all(sheetNames.map(async (sheet, index) => {
              try {
                  const rows = await readXlsxFile(file, { sheet });
                  const filteredRows = rows.filter(row => row.some(value => value !== null));
                  
                  if (filteredRows.length) {
                      const data = filteredRows.slice(0, 11);
                      const columns = filteredRows[0];
                      const previewData = [];
      
                      for (let i = 1; i < data.length; i++) {
                          const rowData = data[i];
                          const obj = {};
                          for (let j = 0; j < columns.length; j++) {
                              obj[columns[j]] = rowData[j];
                          }
                          previewData.push(obj);
                      }
      
                      fileData[sheet] = { columns, previewData };
                  } else {
                      fileSheetNames = fileSheetNames.filter(sh => sh !== sheet);
                  }
              } catch (error) {
                  console.error(`Error processing sheet ${sheet}:`, error);
                  // Gérer les erreurs ici si nécessaire
              }
          }));
      
          resolve({ sheetNames: fileSheetNames, data: fileData });
      })
        .catch((errors) => {
          reject(errors)
        })
        
      }
    });
  };
  


  function handleChangeNiveau(file, niveau) {
    let fileIndex = selectedFiles.indexOf(file);
    let remplacementList = selectedFiles;
    remplacementList[fileIndex].niveau_codification = niveau;

    setSelectedFiles(remplacementList);
  }

  function handelChangeSheet(file, sheet) {
    let fileIndex = selectedFiles.indexOf(file);
    let remplacementList = selectedFiles;
    remplacementList[fileIndex].sheet = sheet;

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
                <Box sx={{ flexGrow: 1, maxWidth: '100%' }}>
                  <Grid container>
                    <Grid item xs={20} md={15}>
                      <Demo>
                        <List dense={dense}>
                            {selectedFiles.map((file, index) => (
                              <InteractiveList key={file.name + index} label={file.name} file={file} setSelectedFiles={setSelectedFiles} onDelete={()=>{removeFile(file.id)}} preView={()=>{preView(<DenseTable colonnes={file.previewData.hasOwnProperty(file.sheet)?file.previewData[file.sheet].columns:[]} rows={file.previewData.hasOwnProperty(file.sheet)?file.previewData[file.sheet].previewData:[]}/>, file)}} handleChangeCol={(colonne)=>{handleChangeCol(file, colonne)}} handleChangeNiveau={(niveau)=>{handleChangeNiveau(file, niveau)}} handelChangeSheet={(colonne)=>{handelChangeSheet(file, colonne)}} sheetDefault={(file.file.type === ''?file.name:'')}/>
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
