import { Buffer } from "buffer";
import { getRandomValues as expoGetRandomValues } from "expo-crypto";

// React Native/Hermes does not provide Buffer; Solana and other deps need it.
const BufferPolyfill = Buffer;
if (typeof globalThis !== "undefined") {
  (globalThis as unknown as { Buffer: typeof Buffer }).Buffer = BufferPolyfill;
}
if (typeof global !== "undefined") {
  (global as unknown as { Buffer: typeof Buffer }).Buffer = BufferPolyfill;
}

class Crypto {
  getRandomValues = expoGetRandomValues;
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

if (typeof crypto === "undefined") {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    enumerable: true,
    get: () => webCrypto,
  });
}
