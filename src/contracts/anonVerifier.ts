export const anonVerifier = {
  address: "0x6bE8Cec7a06BA19c39ef328e8c8940cEfeF7E281",
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_verifier",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_pubkeyHash",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "storedPublicKeyHash",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "verifier",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "nullifierSeed",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "nullifier",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "signal",
          type: "uint256",
        },
        {
          internalType: "uint256[4]",
          name: "revealArray",
          type: "uint256[4]",
        },
        {
          internalType: "uint256[8]",
          name: "groth16Proof",
          type: "uint256[8]",
        },
      ],
      name: "verifyAnonAadhaarProof",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
