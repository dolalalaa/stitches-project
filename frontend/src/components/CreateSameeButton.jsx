import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateSameeButton = () => {
  const navigate = useNavigate();

  const handleCreateSamee = () => {
    // Get measurements from localStorage
    const chest = localStorage.getItem("chest");
    const waist = localStorage.getItem("waist");
    const armLength = localStorage.getItem("length");
    
    // Get fabric from localStorage
    const fabricStr = localStorage.getItem("selectedFabric");
    const fabric = fabricStr ? JSON.parse(fabricStr) : null;
    
    // Determine size
    const size = (chest && Number(chest) > 40) ? "large" : "small";
    
    // Navigate to customize page
    navigate("/customize", {
      state: {
        fabric: fabric,
        measurement: {
          chest: chest,
          waist: waist,
          armLength: armLength,
          size: size
        }
      }
    });
  };

  return (
    <button className="mf-btn-samee" onClick={handleCreateSamee}>
      👗 Create Samee
    </button>
  );
};

export default CreateSameeButton;