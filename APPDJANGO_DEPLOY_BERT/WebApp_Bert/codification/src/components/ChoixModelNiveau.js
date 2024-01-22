import React, { useState } from 'react';

const data = {
  "MODEL 1": {
    "name": "codification emploi",
    "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit maxime eveniet perspiciatis numquam nulla atque illum distinctio aperiam. Architecto unde sunt quia mollitia perferendis dolor odit, assumenda iste obcaecati et.",
    "niveaux": {
      "1": "Grands groupes",
      "2": "Sous-groupes principaux",
      "3": "Groupes mineurs",
      "4": "Groupes d'unités",
      "5": "Niveau de compétence"
    }
  },
  "MODEL 2": {
    "name": "codification emploi",
    "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit maxime eveniet perspiciatis numquam nulla atque illum distinctio aperiam. Architecto unde sunt quia mollitia perferendis dolor odit, assumenda iste obcaecati et.",
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

      <br />

      <label>Choisissez un niveau:</label>
      <select value={selectedNiveau} onChange={handleNiveauChange}>
        {Object.keys(data[selectedModel].niveaux).map(niveau => (
          <option key={niveau} value={niveau}>{data[selectedModel].niveaux[niveau]}</option>
        ))}
      </select>

      <br />

      <div>
        <h3>{data[selectedModel].name}</h3>
        <p>{data[selectedModel].description}</p>
        <p>Niveau sélectionné: {data[selectedModel].niveaux[selectedNiveau]}</p>
      </div>
    </div>
  );
};

export default ChoixModelNiveau;
