import strToArr from "../strToArr"

test("empty string", () => {
  expect(strToArr("")).toEqual(new Uint8Array(0))
})

test("string", () => {
  expect(strToArr("123")).toEqual(new Uint8Array([49,50,51]))
})

test("matching lengths", () => {
  const strs = [
    "0",
    "01",
    "012",
    "0123",
    "01234",
  ]
  strs.forEach(s => {
    expect(strToArr(s).length).toEqual(s.length)
  })
})