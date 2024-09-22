import styles from "./index.module.css";
import Image from "next/image";

interface WithoutImageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  className?: string;
}

const WithoutImageInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  ...rest
}: WithoutImageInputProps) => {
  return (
    <input
      className={`${styles["without-img-input"]} ${className}`}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...rest}
    />
  );
};

export default WithoutImageInput;
