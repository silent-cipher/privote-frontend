"use client";
import { useAuthContext } from "~~/contexts/AuthContext";
import { useScaffoldContractWrite } from "./scaffold-eth";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import {
  encodeAbiParameters,
  encodePacked,
  hexToBigInt,
  parseAbiParameters,
} from "viem";
import {
  PackedGroth16Proof,
  verify,
  artifactUrls,
  InitArgs,
  init,
  ArtifactsOrigin,
  packGroth16Proof,
} from "@anon-aadhaar/core";
import { useAccount, useContractWrite } from "wagmi";
import { useEffect } from "react";
import { anonVerifier } from "~~/contracts/anonVerifier";
import deployedContracts from "~~/contracts/deployedContracts";

const anonAadhaarInitArgs: InitArgs = {
  wasmURL: artifactUrls.v2.wasm,
  zkeyURL: artifactUrls.v2.zkey,
  vkeyURL: artifactUrls.v2.vk,
  artifactsOrigin: ArtifactsOrigin.server,
};

const useUserRegister = () => {
  const { keypair, isRegistered } = useAuthContext();
  const [anonAadhaar] = useAnonAadhaar();
  const { address } = useAccount();

  useEffect(() => {
    init(anonAadhaarInitArgs);
  }, []);

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "Privote",
    functionName: "signUp",
    args: [
      keypair?.pubKey.asContractParam() as { x: bigint; y: bigint },
      "0x",
      "0x",
    ],
  });

  const { writeAsync: verifyAnon } = useContractWrite({
    address: anonVerifier.address,
    abi: anonVerifier.abi,
    functionName: "verifyAnonAadhaarProof",
  });

  const registerUser = async () => {
    console.log(keypair);
    if (!keypair || anonAadhaar.status !== "logged-in") return;

    const pcd = anonAadhaar.anonAadhaarProofs[0]?.pcd;

    const parsedPCD = JSON.parse(pcd || "{}");
    console.log(parsedPCD);

    const {
      ageAbove18,
      gender,
      pincode,
      state,
      signalHash,
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
    console.log(
      hexToBigInt(deployedContracts[11155111].Privote.address as `0x${string}`)
    );

    const encodedSignUpGatekeeper = encodeAbiParameters(
      parseAbiParameters(
        "uint256 nullifierSeed, uint256 nullifier, uint256 timestamp, uint256 signal, uint256[4] revealArray, uint256[8] groth16Proof"
      ),
      [
        BigInt(providedNullifierSeed),
        nullifier,
        timestamp,
        BigInt(deployedContracts[11155111].Privote.address as `0x${string}`),
        revealArray,
        groth16Proof8,
      ]
    );

    console.log(encodedSignUpGatekeeper);

    try {
      // const result = await verifyAnon({
      //   args: [
      //     providedNullifierSeed,
      //     nullifier,
      //     timestamp,
      //     address,
      //     revealArray,
      //     packGroth16Proof(groth16Proof),
      //   ],
      // });
      // console.log(result);
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

  return { registerUser };
};

export default useUserRegister;