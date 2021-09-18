import arrToStr from "../arrToStr"
import strToArr from "../strToArr"

test("empty array", () => {
  expect(arrToStr(new Uint8Array(0))).toEqual("")
})

test("multiple elements", () => {
  expect(arrToStr(new Uint8Array([100,50,600]))).toEqual("d2X")
})

test("string length matches array length", () => {
  const arrs = [
    [0],
    [0,1],
    [0,1,2],
    [0,1,2,3,],
    [0,1,2,3,4,],
  ].map(a => new Uint8Array(a))
  arrs.forEach(a => {
    expect(arrToStr(a).length).toEqual(a.length)
  })
})


test("arrToStr -> strToArr", () => {
  const arrs = [
    [0],
    [0,1],
    [0,1,2],
    [0,1,2,3,],
    [0,1,2,3,4,],

    [100,135,7,190,200,34],
  ].map(a => new Uint8Array(a))
  arrs.forEach(a => {
    expect(strToArr(arrToStr(a))).toEqual(a)
  })
})

test("strToArr -> arrToStr", () => {
  const strs = [
    "0123456789",
    "testing123",
    "abcdefghikjlmnopqrstuvwxyz",
    "Deep v microdosing photo booth cornhole hell of banh mi pour-over fanny pack food truck." //https://hipsum.co/?paras=5&type=hipster-centric&start-with-lorem=1
  ]
  strs.forEach(s => {
    expect(arrToStr(strToArr(s))).toEqual(s)
  })
})