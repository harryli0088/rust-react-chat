/**
 * Convert a Uint8Array into a string, one byte at a time.
 * I tried using TextEncoder and TextDecoder, but they produced different results
 * @param arr Uint8Array
 * @returns   string encoding of the array
 */
export default function arrToStr(arr: Uint8Array) {
  return String.fromCharCode(...arr)
}