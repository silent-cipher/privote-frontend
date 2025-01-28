import React, { useEffect, useRef } from "react";
import styles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  showCloseButton?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth,
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={modalRef} style={{ maxWidth }}>
        {(showCloseButton || title) && (
          <div className={styles.modalHeader}>
            {title && <h2>{title}</h2>}
            {showCloseButton && (
              <button className={styles.closeButton} onClick={onClose}>
                <FaTimes />
              </button>
            )}
          </div>
        )}
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
