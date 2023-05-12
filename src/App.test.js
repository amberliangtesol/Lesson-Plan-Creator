// function add(a, b) {
//   if (typeof a === "string") {
//     window.alert("a is string");
//   }
//   return a + b;
// }

// describe("add function", () => {
//   test("adds 1 + 2 to equal 3", () => {
//     expect(add(1, 2)).toBe(3);
//   });
// });

// describe("add num function", () => {
//   test("adds 10 + 2 to equal 12", () => {
//     expect(add(10, 2)).toBe(12);
//   });
// });

function add(a, b) {
  if (typeof a === "string") {
    window.alert("a is string");
  }
  return a + b;
}

describe("add function", () => {
  let alertSpy;

  beforeEach(() => {
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test("adds 1 + 2 to equal 3", () => {
    expect(add(1, 2)).toBe(3);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  test("alerts when 'a' is a string", () => {
    expect(add("Hello", 2)).toBeNaN();
    expect(alertSpy).toHaveBeenCalledWith("a is string");
  });
});
