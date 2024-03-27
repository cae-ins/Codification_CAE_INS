import React, { useState } from 'react';

const data = {
  "MODEL 1": {
    "name": "codification emploi",
    "description": "Uploader votre fichier et laissez notre algorithme puissant attribuer à chaque emploi la codification CITP. Simplifiez le processus de classification des postes en quelques clics.",
    "niveaux": {
      "1": "Grands groupes",
      "2": "Sous-groupes principaux",
      "3": "Groupes mineurs",
      "4": "Groupes d'unités",
      "5": "Niveau de compétence"
    }
  },
  "MODEL 2": {
    "name": "codification metier",
    "description": "Uploader votre fichier et laissez notre algorithme puissant attribuer à chaque metier la codification CITP. Simplifiez le processus de classification des postes en quelques clics.",
    "niveaux": {
      "1": "Grands groupes",
      "2": "Sous-groupes principaux",
      "3": "Groupes mineurs",
      "4": "Groupes d'unités",
      "5": "Niveau de compétence"
    }
  }
};

const ChoixModelNiveau = () => {
  const [selectedModel, setSelectedModel] = useState(Object.keys(data)[0]);
  const [selectedNiveau, setSelectedNiveau] = useState(Object.keys(data[selectedModel].niveaux)[0]);

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
    // Réinitialiser le niveau lorsque le modèle change
    setSelectedNiveau(Object.keys(data[event.target.value].niveaux)[0]);
  };

  const handleNiveauChange = (event) => {
    setSelectedNiveau(event.target.value);
  };

  return (
    <div>
      <label>Choisissez un modèle:</label>
      <select value={selectedModel} onChange={handleModelChange}>
        {Object.keys(data).map(model => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>

      <label>Choisissez un niveau:</label>
      <select value={selectedNiveau} onChange={handleNiveauChange}>
        {Object.keys(data[selectedModel].niveaux).map(niveau => (
          <option key={niveau} value={niveau}>{data[selectedModel].niveaux[niveau]}</option>
        ))}
      </select>

      <div id='CID' className='FileUploaderContainer'>
            <div className='FileUploaderContainer_2'>
              <h1 className='dropezone_header'>
              {data[selectedModel].name} / {data[selectedModel].niveaux[selectedNiveau]}
              </h1>
              <p className='dropzone_p'>
              {data[selectedModel].description}
              </p>
            </div>
      </div>
    </div>
  );
};

export default ChoixModelNiveau;
