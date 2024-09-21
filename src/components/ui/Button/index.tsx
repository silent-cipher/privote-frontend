import styles from "./index.module.css";

export default function Button({
  type,
  children,
  action,
  className,
}: Readonly<{
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  action: () => void;
  className?: string;
}>) {
  return (
    <button
      className={`${styles.button} ${className}`}
      type={type}
      onClick={action}
    >
      {children}
    </button>
  );
}
