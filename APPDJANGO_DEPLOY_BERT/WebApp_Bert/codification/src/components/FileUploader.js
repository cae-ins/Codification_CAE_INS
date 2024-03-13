import { Button, Chip, Stack } from '@mui/material';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { get_transform_data, submitFile } from '../utils/requestStore';
import Cookies from 'js-cookie';
import { Preview, Send } from '@mui/icons-material';
import Papa from 'papaparse';
import InteractiveList from './FormulaireSelection';


import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import { ListItemSecondaryAction } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

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

const FileUploader = ({setProgressionEtapes, showError, showPreview}) => {

  
  const [dense, setDense] = React.useState(false);
    
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const csvFiles = acceptedFiles.filter(file => file.type === "text/csv");
    const noCsvFiles = acceptedFiles.filter(file => file.type !== "text/csv");

    const updatedFiles = await Promise.all(csvFiles.map(async (file) => {
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
    if (noCsvFiles.length > 0){
      showError("Erreur", "Les fichiers suivant ne sont pas des fichiers csv : "  + noCsvFiles.map(file => file.name).join(", "));
    }
    console.error("Ces fichiers ne sont pas des csv : ", noCsvFiles)
    setSelectedFiles([...selectedFiles, ...filteredFiles]);
  }, [selectedFiles]);

  const removeFile = (fileName) => {
    const updatedFiles = selectedFiles.filter(file => file.name !== fileName);
    setSelectedFiles(updatedFiles);
  };

  const preView = (element, file) => {
    console.log("Previsualisation du fichier : ", file.name);
    showPreview(element, file.name)
  }

  const submitFiles = () =>{
    setProgressionEtapes(1)
    submitFile(selectedFiles[0].file)
    .then((data)=>{
      console.log(data);
      if(data.statut === "succes" && data.temp_dir){
        Cookies.set('codif_result_dir', data.temp_dir);
        setProgressionEtapes(2)
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
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'text/csv', // Accepter uniquement les fichiers CSV
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
  

  const handleChangeCol = (file, colonne) =>{
    let fileIndex = selectedFiles.indexOf(file)
    let remplacementList = selectedFiles
    remplacementList[fileIndex].selectedColonne = colonne

    setSelectedFiles(remplacementList);
    console.log(selectedFiles);
  }

  const handleChangeNiveau = (file, niveau) =>{
    let fileIndex = selectedFiles.indexOf(file)
    let remplacementList = selectedFiles
    remplacementList[fileIndex].niveau_codification = niveau

    setSelectedFiles(remplacementList);
  }

  const generate = (element) => {
    return selectedFiles.map((value) =>
      React.cloneElement(element, {
        key: value,
      }),
    );
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
                <div>
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
