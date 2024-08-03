import React from 'react';
import './CustomModal.css';

const ConfirmModal = ({ show, handleClose, handleConfirm, title, message }) => {
  return (
    <>
      {show && (
        <div className="modal-overlay">
          <div className="modal-wrapper">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button className="modal-close" onClick={handleClose}>&times;</button>
            </div>
            <div className="modal-body">
              {message}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleConfirm}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmModal;
