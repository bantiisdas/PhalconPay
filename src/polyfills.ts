import { Buffer } from "buffer";
import { getRandomValues as expoGetRandomValues } from "expo-crypto";

global.Buffer = global.Buffer || Buffer;

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
