// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import crypto from "crypto"
const { TextDecoder, TextEncoder } = require('util')

//https://stackoverflow.com/questions/52612122/how-to-use-jest-to-test-functions-using-crypto-or-window-mscrypto
Object.defineProperty(global.self, "crypto", {
  value: crypto.webcrypto,
})

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder