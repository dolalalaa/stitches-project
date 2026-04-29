import React, { useState } from 'react';
import axios from 'axios';

const AddFabric = () => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    color: '',
    pattern: '',
    price: '',
    category: 'standard',
    textureUrl: '',
    thumbnailColor: '#ff69b4',
    shopOwnerId: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, fabricImage: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('type', formData.type);
    data.append('color', formData.color);
    data.append('pattern', formData.pattern);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('textureUrl', formData.textureUrl);
    data.append('thumbnailColor', formData.thumbnailColor);
    data.append('shopOwnerId', formData.shopOwnerId);
    if (formData.fabricImage) {
      data.append('fabricImage', formData.fabricImage);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/fabrics/add', data);
      if (response.data.success) {
        alert('Fabric added successfully!');
        // Reset form
        setFormData({
          name: '',
          type: '',
          color: '',
          pattern: '',
          price: '',
          category: 'standard',
          textureUrl: '',
          thumbnailColor: '#ff69b4',
          shopOwnerId: ''
        });
        setImagePreview('');
        document.getElementById('imageInput').value = '';
      }
    } catch (error) {
      alert('Error adding fabric: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ marginBottom: '20px' }}>Add New Fabric</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fabric Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type</label>
            <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option value="">Select Type</option>
              <option value="silk">Silk</option>
              <option value="cotton">Cotton</option>
              <option value="linen">Linen</option>
              <option value="wool">Wool</option>
              <option value="polyester">Polyester</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="e.g., pink, red"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Pattern</label>
            <input
              type="text"
              name="pattern"
              value={formData.pattern}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="e.g., floral, solid"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="e.g., 1200"
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <option value="premium">Premium</option>
            <option value="standard">Standard</option>
            <option value="budget">Budget</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Texture URL</label>
          <input
            type="url"
            name="textureUrl"
            value={formData.textureUrl}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="https://example.com/texture.jpg"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Thumbnail Color</label>
          <input
            type="color"
            name="thumbnailColor"
            value={formData.thumbnailColor}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Shop Owner ID (Optional)</label>
          <input
            type="text"
            name="shopOwnerId"
            value={formData.shopOwnerId}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Your shop name or ID"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fabric Image *</label>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={{ marginTop: '10px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Adding Fabric...' : 'Add Fabric'}
        </button>
      </form>
    </div>
  );
};

export default AddFabric;