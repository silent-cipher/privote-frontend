import React from "react";
import styles from "../index.module.css";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { IoMdClose } from "react-icons/io";

interface WithImageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  placeholder: string;
  type?: string;
  className?: string;
  file: File | null;
}

const WithImageInput = ({
  onChange,
  onFileChange,
  onFileRemove,
  placeholder,
  type = "text",
  className = "",
  file,
  ...rest
}: WithImageInputProps) => {
  return (
    <div className={`${styles["with-img-input"]} ${className}`}>
      <input
        type={type}
        onChange={onChange}
        placeholder={placeholder}
        className={styles["input-field"]}
        {...rest}
      />
      <div className={styles["file-input-container"]}>
        {file ? (
          <div className={styles["selected-file"]}>
            <span className={styles["file-name"]}>{file.name}</span>
            <button 
              onClick={onFileRemove}
              className={styles["remove-file-btn"]}
              type="button"
            >
              <IoMdClose size={20} />
            </button>
          </div>
        ) : (
          <label className={styles["file-input-label"]}>
            <input
              type="file"
              onChange={onFileChange}
              accept="image/*"
              className={styles["hidden-file-input"]}
            />
            <MdOutlineAddPhotoAlternate size={24} />
          </label>
        )}
      </div>
    </div>
  );
};

export default WithImageInput;
