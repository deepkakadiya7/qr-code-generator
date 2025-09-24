import React, { useState, useEffect } from 'react';
import { qrCodeAPI } from '../utils/api';
import toast from 'react-hot-toast';

const History = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const fetchHistory = async (page) => {
    setLoading(true);
    try {
      const response = await qrCodeAPI.getHistory(page, 12);
      setQrCodes(response.qrCodes);
      setPagination(response.pagination);
    } catch (error) {
      console.error('History fetch error:', error);
      // Error toast is handled by the API interceptor
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (qrCode) => {
    const link = document.createElement('a');
    link.href = qrCode.pngDataUrl;
    link.download = `qr-code-${qrCode._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded!');
  };

  const deleteQR = async (qrCodeId) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) {
      return;
    }

    try {
      await qrCodeAPI.delete(qrCodeId);
      setQrCodes(qrCodes.filter(qr => qr._id !== qrCodeId));
      toast.success('QR Code deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      // Error toast is handled by the API interceptor
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="loading">Loading your QR code history...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ color: '#374151', margin: 0 }}>
            Your QR Code History
          </h2>
          {pagination && (
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {pagination.totalCount} total QR codes
            </span>
          )}
        </div>

        {qrCodes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3>No QR Codes Yet</h3>
            <p>You haven't generated any QR codes yet. Create your first one!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {qrCodes.map((qrCode) => (
                <div 
                  key={qrCode._id} 
                  className="card"
                  style={{ padding: '1rem', marginBottom: '1rem' }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <img 
                      src={qrCode.pngDataUrl} 
                      alt="QR Code"
                      style={{ 
                        width: '120px',
                        height: '120px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: '#374151',
                      fontWeight: '500',
                      marginBottom: '0.25rem',
                      wordBreak: 'break-word'
                    }}>
                      {truncateText(qrCode.text)}
                    </p>
                    
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280',
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem'
                    }}>
                      <span>Size: {qrCode.size}px</span>
                      <span>ECC: {qrCode.errorCorrectionLevel}</span>
                    </div>
                    
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280'
                    }}>
                      {formatDate(qrCode.createdAt)}
                    </p>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem' 
                  }}>
                    <button 
                      onClick={() => downloadQR(qrCode)}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => deleteQR(qrCode._id)}
                      className="btn btn-danger"
                      style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '2rem'
              }}>
                <button 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  Previous
                </button>
                
                <span style={{ 
                  padding: '0.5rem 1rem',
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
