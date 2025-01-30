import styles from "./index.module.css";
import Image from "next/image";
import WithoutImageInput from "../WithoutImageInput";
import Link from "next/link";
import { PollConfigurationProps } from "../../types";

const PollConfiguration = ({
  setPollConfig,
  pollConfig,
  pubKey,
  handlePubKeyChange,
  generateKeyPair,
  showKeys,
}: PollConfigurationProps) => {
  return (
    <div className={styles["poll-config-wrapper"]}>
      <h1>Poll Configuration</h1>
      <div className={styles["poll-config"]}>
        <div className={styles["config-wrapper"]}>
          <div
            className={styles["config-option"]}
            onClick={() => setPollConfig(1)}
          >
            <div
              className={`${styles.dot} ${
                pollConfig === 1 ? styles.selected : ""
              }`}
            ></div>
            <div className={styles["gen-container"]}>
              <p className={styles.text}>
                We dont trust you 🤨, we have coordinator public key
              </p>
              {pollConfig === 1 && (
                <div className={styles["public-input-container"]}>
                  <WithoutImageInput
                    onChange={handlePubKeyChange}
                    value={pubKey}
                    placeholder="macipk.a26f6f713fdf9ab73e2bf57662977f8f4539552b3ca0fb2a65654472427f601b"
                    className={styles["pub-key-input"]}
                  />
                  <div className={styles["key-gen"]}>
                    You can generate maci key pair from{" "}
                    <Link
                      href="https://maci.pse.dev/docs/core-concepts/maci-keys#generate-maci-keys)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      here
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles["config-wrapper"]}>
          <div
            className={styles["config-option"]}
            onClick={() => setPollConfig(2)}
          >
            <div
              className={`${styles.dot} ${
                pollConfig === 2 ? styles.selected : ""
              }`}
            ></div>
            <div className={styles["gen-container"]}>
              <p className={styles.text}>Generate Public Key</p>
              {pollConfig === 2 && (
                <div className={styles["public-input-container"]}>
                  <button
                    type="button"
                    className={styles["gen-btn"]}
                    onClick={generateKeyPair}
                    disabled={showKeys.show}
                  >
                    {showKeys.show ? "Keys Generated!" : "Generate Key"}
                  </button>
                  {showKeys.show && (
                    <div className={styles["key-details"]}>
                      <div className={styles["key-container"]}>
                        <p>Public Key: {pubKey}</p>
                        <p>Private Key: {showKeys.privKey}</p>
                      </div>
                      <p className={styles["priv-warning"]}>
                        Please store the private key securely. It will not be
                        stored here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollConfiguration;
