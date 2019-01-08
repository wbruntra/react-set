import React from 'react';

const Modal = ({ children, visible: popupVisible }) => {
  return (
    <div className="modal popup-message" style={{ display: popupVisible ? 'block' : 'none' }}>
      <div className="modal-content">{children}</div>
    </div>
  );
};

export default Modal;
