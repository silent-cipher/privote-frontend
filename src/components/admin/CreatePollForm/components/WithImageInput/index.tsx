import styles from "../index.module.css";
import { LuPlus } from "react-icons/lu";

interface WithImageInputProps {
  index: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  className?: string;
}

const WithImageInput = ({
  index,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  ...rest
}: WithImageInputProps) => {
  return (
    <>
      {" "}
      <input
        className={`${styles["img-input"]} ${className}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}
      />{" "}
      <label className={styles.label} htmlFor={`file-${index}`}>
        <LuPlus />
        Upload File
      </label>
      <input
        type="file"
        id={`file-${index}`}
        className={styles["with-img-input"]}
        accept="image/*"
        onChange={rest.onFileChange}
      />
    </>
  );
};

export default WithImageInput;
