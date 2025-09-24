import React, { useState } from 'react';
import { qrCodeAPI } from '../utils/api';
import toast from 'react-hot-toast';

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    text: '',
    size: 200,
    errorCorrectionLevel: 'M'
  });
  const [generatedQR, setGeneratedQR] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      toast.error('Please enter text to generate QR code');
      return;
    }

    setLoading(true);
    
    try {
      const response = await qrCodeAPI.generate(formData);
      setGeneratedQR(response.qrCode);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      console.error('QR generation error:', error);
      // Error toast is handled by the API interceptor
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;
    
    const link = document.createElement('a');
    link.href = generatedQR.pngDataUrl;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded!');
  };

  const resetForm = () => {
    setFormData({
      text: '',
      size: 200,
      errorCorrectionLevel: 'M'
    });
    setGeneratedQR(null);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Generator Form */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: '#374151' }}>
            Generate QR Code
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="text" className="form-label">
                Text/URL to encode *
              </label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Enter text, URL, or any data to encode..."
                disabled={loading}
                rows="4"
              />
              <small style={{ color: '#6b7280' }}>
                Maximum 1000 characters
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="size" className="form-label">
                Size (pixels)
              </label>
              <input
                type="number"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="form-input"
                min="50"
                max="1000"
                disabled={loading}
              />
              <small style={{ color: '#6b7280' }}>
                Between 50px and 1000px
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="errorCorrectionLevel" className="form-label">
                Error Correction Level
              </label>
              <select
                id="errorCorrectionLevel"
                name="errorCorrectionLevel"
                value={formData.errorCorrectionLevel}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                <option value="L">Low (~7%)</option>
                <option value="M">Medium (~15%)</option>
                <option value="Q">Quartile (~25%)</option>
                <option value="H">High (~30%)</option>
              </select>
              <small style={{ color: '#6b7280' }}>
                Higher levels provide better error recovery
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !formData.text.trim()}
                style={{ flex: 1 }}
              >
                {loading ? 'Generating...' : 'Generate QR Code'}
              </button>
              
              {generatedQR && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Generated QR Display */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>
            Generated QR Code
          </h3>
          
          {generatedQR ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                border: '2px dashed #d1d5db', 
                borderRadius: '8px', 
                padding: '2rem',
                marginBottom: '1rem'
              }}>
                <img 
                  src={generatedQR.pngDataUrl} 
                  alt="Generated QR Code"
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                <p><strong>Text:</strong> {generatedQR.text}</p>
                <p><strong>Size:</strong> {generatedQR.size}x{generatedQR.size} pixels</p>
                <p><strong>Error Correction:</strong> {generatedQR.errorCorrectionLevel}</p>
                <p><strong>Created:</strong> {new Date(generatedQR.createdAt).toLocaleString()}</p>
              </div>
              
              <button 
                onClick={downloadQR}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Download PNG
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              color: '#9ca3af'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                <p>Your generated QR code will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
