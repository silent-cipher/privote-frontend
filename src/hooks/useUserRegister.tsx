"use client";
import { usePollContext } from "~~/contexts/PollContext";
import { useScaffoldContractWrite } from "./scaffold-eth";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import {
  artifactUrls,
  InitArgs,
  init,
  ArtifactsOrigin,
} from "@anon-aadhaar/core";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useSigContext } from "~~/contexts/SigContext";
import { AuthType, PollType } from "~~/types/poll";
import { getMaciContractName } from "~~/utils/maciName";

const anonAadhaarInitArgs: InitArgs = {
  wasmURL: artifactUrls.v2.wasm,
  zkeyURL: artifactUrls.v2.zkey,
  vkeyURL: artifactUrls.v2.vk,
  artifactsOrigin: ArtifactsOrigin.server,
};

const useUserRegister = (authType?: AuthType, pollType?: PollType) => {
  const { isRegistered } = usePollContext();
  const { keypair } = useSigContext();
  const [anonAadhaar] = useAnonAadhaar();
  const { address, isDisconnected } = useAccount();

  useEffect(() => {
    init(anonAadhaarInitArgs);
  }, []);

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: getMaciContractName(authType, pollType),
    functionName: "signUp",
    args: [
      keypair?.pubKey.asContractParam() as { x: bigint; y: bigint },
      "0x",
      "0x",
    ],
  });

  const registerUserForFreeForAll = async () => {
    if (!keypair || isRegistered || isDisconnected) return;

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

  const registerUserForAnonAadhaar = async () => {
    if (
      !keypair ||
      anonAadhaar.status !== "logged-in" ||
      isRegistered ||
      isDisconnected
    )
      return;

    const pcd = anonAadhaar.anonAadhaarProofs[0]?.pcd;

    const parsedPCD = JSON.parse(pcd || "{}");

    const {
      ageAbove18,
      gender,
      pincode,
      state,
      nullifier,
      groth16Proof,
      timestamp,
    } = parsedPCD.proof;
    const providedNullifierSeed = 4534;
    const revealArray: [bigint, bigint, bigint, bigint] = [
      BigInt(ageAbove18),
      BigInt(gender),
      BigInt(pincode),
      BigInt(state),
    ];

    const groth16Proof8: [
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint
    ] = [
      BigInt(groth16Proof.pi_a[0]),
      BigInt(groth16Proof.pi_a[1]),
      BigInt(groth16Proof.pi_b[0][1]),
      BigInt(groth16Proof.pi_b[0][0]),
      BigInt(groth16Proof.pi_b[1][1]),
      BigInt(groth16Proof.pi_b[1][0]),
      BigInt(groth16Proof.pi_c[0]),
      BigInt(groth16Proof.pi_c[1]),
    ];

    const encodedSignUpGatekeeper = encodeAbiParameters(
      parseAbiParameters(
        "uint256 nullifierSeed, uint256 nullifier, uint256 timestamp, uint256 signal, uint256[4] revealArray, uint256[8] groth16Proof"
      ),
      [
        BigInt(providedNullifierSeed),
        nullifier,
        timestamp,
        BigInt(address as `0x${string}`),
        revealArray,
        groth16Proof8,
      ]
    );

    try {
      await writeAsync({
        args: [
          keypair.pubKey.asContractParam() as { x: bigint; y: bigint },
          encodedSignUpGatekeeper,
          "0x",
        ],
      });
    } catch (err) {
      console.log(err);
    }
  };

  const registerUser = async () => {
    if (authType === "free") {
      await registerUserForFreeForAll();
    } else {
      await registerUserForAnonAadhaar();
    }
  };

  return { registerUser, isLoading };
};

export default useUserRegister;
