import axios from "axios";

export async function uploadToPinata(jsonData: any) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

  const { data } = await axios.post(
    url,
    {
      // assuming client sends `nftMeta` json
      pinataContent: jsonData,
    },
    {
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
      },
    }
  );

  return data.IpfsHash;
}

export async function uploadImageToPinata(file: File) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${pinataJWT}`,
    },
  });

  return data.IpfsHash;
}

export async function getDataFromPinata(hash: string) {
  const url = `${
    process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"
  }/ipfs/${hash}`;

  console.log(url);
  const response = await fetch(url);
  const data = await response.json();

  console.log("data", data);
  return data;
}
