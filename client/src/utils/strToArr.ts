/**
 * Given a string, convert it to a Uint8Array
 * @param str string
 * @returns   Uint8Array
 */
export default function strToArr(str: string) {
  return Uint8Array.from([...str].map(ch => ch.charCodeAt(0)))
}