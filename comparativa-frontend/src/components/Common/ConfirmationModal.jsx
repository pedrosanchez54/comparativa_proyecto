import React from 'react';
import { createPortal } from 'react-dom';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirmar acción",
  message = "¿Estás seguro de que quieres continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return createPortal(
    <div className="confirmation-modal-backdrop" onClick={handleBackdropClick}>
      <div className="confirmation-modal">
        <div className="confirmation-modal-header">
          <div className={`confirmation-modal-icon ${type}`}>
            <FaExclamationTriangle />
          </div>
          <button 
            className="confirmation-modal-close"
            onClick={onCancel}
            title="Cerrar"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="confirmation-modal-content">
          <h3 className="confirmation-modal-title">{title}</h3>
          <p className="confirmation-modal-message">{message}</p>
        </div>
        
        <div className="confirmation-modal-actions">
          <button 
            className="confirmation-modal-button cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirmation-modal-button confirm ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal; 