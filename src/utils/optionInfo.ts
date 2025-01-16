import { ethers } from "ethers";
import { toUtf8Bytes, hexlify, toUtf8String } from "ethers";

interface OptionInfo {
  cid: `0x${string}`;
  description?: string;
  // Add more fields here in the future
}

export function encodeOptionInfo(info: OptionInfo): string {
  // Create an object with version for future compatibility
  const data = {
    version: 1,
    cid: info.cid,
    description: info.description || "",
  };

  // Convert to JSON and then to bytes
  const jsonString = JSON.stringify(data);
  const bytes = toUtf8Bytes(jsonString);
  return hexlify(bytes);
}

export function decodeOptionInfo(hexString: string): OptionInfo {
  try {
    // Convert hex string to UTF-8 string
    const jsonString = toUtf8String(hexString);
    const data = JSON.parse(jsonString);

    // Handle different versions in the future
    if (data.version === 1) {
      return {
        cid: data.cid as `0x${string}`,
        description: data.description,
      };
    }

    // Fallback for unknown versions
    return {
      cid: data.cid as `0x${string}`,
    };
  } catch (e) {
    // Fallback for legacy format (just CID)
    return {
      cid: hexString as `0x${string}`,
    };
  }
}
