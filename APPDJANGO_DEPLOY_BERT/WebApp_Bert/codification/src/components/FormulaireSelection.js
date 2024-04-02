import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import { ListItemSecondaryAction } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Visibility } from '@mui/icons-material';

const InteractiveList = ({file, label, onDelete, preView, handleChangeCol, handleChangeNiveau, handelChangeSheet, sheetDefault=''}) => {
  const [col, setCol] = React.useState('');
  const [sheet, setSheet] = React.useState(sheetDefault);
  const [niveauCodif, setNiveauCodif] = React.useState('');

  const niveau = [
    "Grands groupes",
    "Sous-groupes principaux",
    "Groupes mineurs",
    "Groupes d'unité",
    "Niveau de compétence"
]

  const handleChange = (event) => {
    setCol(event.target.value);
    handleChangeCol(event.target.value)
  };

  const handleChangeSheet = (event) => {
    setSheet(event.target.value);
    handelChangeSheet(event.target.value)
  };

  const handleChangeNiveauCodification = (event) => {
    setNiveauCodif(event.target.value);
    handleChangeNiveau(event.target.value)
  };

  return (
    <ListItem key={label}>
        <ListItemAvatar>
          <Avatar>
              <FolderIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={label}/>
        <ListItemSecondaryAction>
          <div>
          <FormControl sx={{ m: 1, minWidth: 120, maxWidth: 150 }} size="small">
            <InputLabel id={label}>Niveau</InputLabel>
            <Select
                labelId="niveau-codification"
                id="niveau-codification"
                value={niveauCodif}
                label="Colonne"
                onChange={handleChangeNiveauCodification}
            >
                <MenuItem value="">
                <em>None</em>
                </MenuItem>
                
                {niveau.map((colValue, index) => (
                    <MenuItem key={colValue + index} value={colValue}>{colValue}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120, maxWidth: 150  }} size="small">
            <InputLabel id={label}>Feuille</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={sheet}
                label="Feuille"
                onChange={handleChangeSheet}
            >
                {/* <MenuItem value="">
                <em>None</em>
                </MenuItem> */}
                {file.sheetNames.map((colValue, index) => (
                    <MenuItem key={colValue + index} value={colValue}>{colValue}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120, maxWidth: 150  }} size="small">
            <InputLabel id={label}>Colonne</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={col}
                label="Colonne"
                onChange={handleChange}
            >
                <MenuItem value="">
                <em>None</em>
                </MenuItem>
                {file.previewData.hasOwnProperty(sheet) &&
                  file.previewData[sheet].columns.map((colValue, index) => (
                      <MenuItem key={`${colValue}-${index}`} value={colValue}>
                          {colValue}
                      </MenuItem>
                  ))
                }
            </Select>
          </FormControl>
          <IconButton edge="end" aria-label="delete" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
          <IconButton edge="end" aria-label="delete" onClick={preView}>
            <Visibility/>
          </IconButton>
          </div>
        </ListItemSecondaryAction>
    </ListItem>
  );
}

export default InteractiveList