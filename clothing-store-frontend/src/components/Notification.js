import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

const Notification = ({ message, type, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClose();
    }
  };

  // When component mounts, focus on close button for accessibility
  useEffect(() => {
    if (closeButtonRef.current) {
      // Focus only on desktop devices
      if (window.innerWidth > 768) {
        closeButtonRef.current.focus();
      }
    }
  }, []);

  if (!visible) return null;

  return (
    <div className={`notification ${type}`} role="alert" aria-live="assertive">
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button 
          ref={closeButtonRef}
          className="notification-close" 
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          aria-label="Close notification"
          title="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification; 