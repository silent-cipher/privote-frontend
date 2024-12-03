"use client";
import { useAuthContext } from "~~/contexts/AuthContext";
import { useScaffoldContractWrite } from "./scaffold-eth";

const useUserRegister = () => {
  const { keypair } = useAuthContext();
  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "Privote",
    functionName: "signUp",
    args: [
      keypair?.pubKey.asContractParam() as { x: bigint; y: bigint },
      "0x",
      "0x",
    ],
  });

  const registerUser = async () => {
    console.log(keypair);
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
  };

  return { registerUser };
};

export default useUserRegister;
