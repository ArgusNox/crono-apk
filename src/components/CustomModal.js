import React from 'react';
import './CustomModal.css';

const CustomModal = ({ show, handleClose, title, children }) => {
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
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomModal;
