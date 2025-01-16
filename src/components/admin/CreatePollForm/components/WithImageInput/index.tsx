import React, { useState, useEffect } from "react";
import styles from "../index.module.css";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import WithoutImageInput from "../WithoutImageInput";
import type { PollOption } from "../../types";

interface WithImageInputProps {
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: "title" | "description"
  ) => void;
  index: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  placeholder: string;
  option: PollOption;
  type?: string;
  className?: string;
  file?: File | null;
}

const WithImageInput = ({
  option,
  index,
  onChange,
  onFileChange,
  onFileRemove,
  placeholder,
  type = "text",
  className = "",
  file,
  ...rest
}: WithImageInputProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  return (
    <div className={`${styles["with-img-input"]} ${className}`}>
      <div className={styles["text-fields"]}>
        <input
          type={type}
          onChange={(e) => onChange(e, "title")}
          placeholder={placeholder}
          className={styles["input-field"]}
          {...rest}
        />
        <textarea
          placeholder={`Candidate ${index + 1} Description`}
          value={option.description || ""}
          onChange={(e) => onChange(e, "description")}
        />
      </div>
      <div className={styles["file-input-container"]}>
        {file ? (
          <div className={styles["selected-file"]}>
            {preview ? (
              <div className={styles["file-preview"]}>
                <img
                  src={preview}
                  alt="Preview"
                  className={styles["image-preview"]}
                />
                <button
                  onClick={onFileRemove}
                  className={styles["remove-file-btn"]}
                  type="button"
                >
                  <IoMdClose size={16} />
                </button>
              </div>
            ) : (
              <>
                <span className={styles["file-name"]}>{file.name}</span>
              </>
            )}
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
