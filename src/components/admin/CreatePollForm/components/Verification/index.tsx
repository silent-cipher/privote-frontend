import styles from "./index.module.css";
import Image from "next/image";
import { VerificationProps } from "../../types";
import { AuthType } from "~~/types/poll";

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
            authType === AuthType.FREE ? styles.selected : ""
          }`}
          value={AuthType.FREE}
          onClick={handleVeriMethodChange}
        >
          None
        </button>
        <button
          type="button"
          className={`${styles["veri-box"]} ${
            authType === AuthType.ANON ? styles.selected : ""
          }`}
          value={AuthType.ANON}
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
