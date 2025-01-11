import styles from "./index.module.css";
import Image from "next/image";
import { VerificationProps } from "../../types";

const Verification = ({
  handleVeriMethodChange,
  authType,
}: VerificationProps) => {
  return (
    <div className={styles.verification}>
      <h1>Verification</h1>
      <div className={styles["veri-row"]}>
        <button
          type="button"
          className={`${styles["veri-box"]} ${
            authType === "none" ? styles.selected : ""
          }`}
          value={"none"}
          onClick={handleVeriMethodChange}
        >
          None
        </button>
        <button
          type="button"
          className={`${styles["veri-box"]} ${
            authType === "anon" ? styles.selected : ""
          }`}
          value={"anon"}
          onClick={handleVeriMethodChange}
        >
          <Image width={31} height={31} alt="icon" src={"/anon-icon.svg"} />
          Anon - aadhaar
        </button>
      </div>
    </div>
  );
};

export default Verification;
