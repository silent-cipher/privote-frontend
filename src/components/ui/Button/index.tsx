import styles from "./index.module.css";

export default function Button({
  children,
  action,
  className,
}: Readonly<{
  children: React.ReactNode;
  action: () => void;
  className?: string;
}>) {
  return (
    <button className={`${styles.button} ${className}`} onClick={action}>
      {children}
    </button>
  );
}
