import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../index.module.css";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import WithoutImageInput from "../WithoutImageInput";
import type { PollOption } from "../../types";

interface WithImageInputProps {
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: "title" | "description" | "link"
  ) => void;
  index: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  placeholder: string;
  option: PollOption;
  type?: string;
  className?: string;
  file?: File | null;
  required?: boolean;
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
  required = false,
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
      <div className={styles["file-input-container"]}>
        <div className={styles["file-container"]}>
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
              <Image
                src={"/img-square.svg"}
                alt="Preview"
                width={92}
                height={92}
              />
            </label>
          )}
        </div>
      </div>
      <div className={styles["text-fields"]}>
        <input
          type={type}
          onChange={(e) => onChange(e, "title")}
          placeholder={placeholder}
          className={styles["input-field"]}
          required={required}
          {...rest}
        />
        <textarea
          placeholder={`Description...`}
          value={option.description || ""}
          onChange={(e) => onChange(e, "description")}
          rows={3}
        />
        <input
          type={"text"}
          onChange={(e) => onChange(e, "link")}
          placeholder={`Link...`}
          className={styles["input-field"]}
        />
      </div>
    </div>
  );
};

export default WithImageInput;
