import React from 'react';
import { FaExclamationTriangle, FaTimes, FaCheck } from 'react-icons/fa';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción",
  message = "¿Estás seguro de que quieres continuar?",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  type = "warning", // warning, danger, info
  loading = false
}) => {
  if (!isOpen) return null;

  const getIconByType = () => {
    switch (type) {
      case 'danger':
        return <FaExclamationTriangle className="modal-icon danger" />;
      case 'info':
        return <FaCheck className="modal-icon info" />;
      default:
        return <FaExclamationTriangle className="modal-icon warning" />;
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={onClose} onKeyDown={handleKeyPress} tabIndex={0}>
      <div className={`confirm-modal-content ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="confirm-modal-title">
            {getIconByType()}
            <h3>{title}</h3>
          </div>
          <button className="confirm-modal-close" onClick={onClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>

        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>

        <div className="confirm-modal-footer">
          <button 
            className="confirm-modal-btn secondary" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-btn primary ${type}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 