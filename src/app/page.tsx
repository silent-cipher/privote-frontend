"use client";
import Image from "next/image";
import Button from "~~/components/ui/Button";
import styles from "~~/styles/page.module.css";
import { useAuthContext } from "~~/contexts/AuthContext";
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export default function Home() {
  const { keypair, isRegistered, generateKeypair } = useAuthContext();
  const [AnonAadhaar] = useAnonAadhaar();

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "MACIWrapper",
    functionName: "signUp",
    args: [
      keypair?.pubKey.asContractParam() as { x: bigint; y: bigint },
      "0x",
      "0x",
    ],
  });

  async function register() {
    if (!keypair) return;

    try {
      await writeAsync({
        args: [
          keypair.pubKey.asContractParam() as { x: bigint; y: bigint },
          "0x",
          "0x",
        ],
      });
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div className={styles["main-page"]}>
      <div className={styles.status}>
        Pivote: the all new way to create polls
      </div>
      <h1 className={styles.heading}>Revolutionizing the Future of Voting</h1>
      <p className={styles.description}>
        Register now to create polls, participate in elections, and make your
        voice heard in the decision-making process.
      </p>
      <Button action={register}>Register</Button>
      {/* {AnonAadhaar.status === "logged-out" && (
        <LogInWithAnonAadhaar nullifierSeed={1234} />
      )}
      {AnonAadhaar.status === "logging-in" && <p>Logging in....</p>} */}
    </div>
  );
}
