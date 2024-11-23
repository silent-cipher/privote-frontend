import styles from "./index.module.css";
import Image from "next/image";
import { LuPlus } from "react-icons/lu";

interface WithImageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  className?: string;
}

const WithImageInput = ({
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
        className={`${styles["without-img-input"]} ${className}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}
      />{" "}
      <label className={styles.label} htmlFor="file">
        <LuPlus />
        Upload File
      </label>
      <input
        type="file"
        id="file"
        className={styles["with-img-input"]}
        accept="image/*"
      />
    </>
  );
};

export default WithImageInput;
