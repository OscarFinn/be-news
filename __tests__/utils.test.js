const {
  convertTimestampToDate, 
  createLookupObject
} = require("../db/seeds/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createLookupObject", () => {
  test("does not mutate original data", () => {
    const data = [{key: 'Jerry', value: 1}]
     createLookupObject(data, 'key', 'value')
     expect(data).toEqual([{key: 'Jerry', value: 1}])
  });
  test("A single element array returns the correct lookup table", () => {
      const data = [{key: 'Jerry', value: 1}]
     const result = createLookupObject(data, 'key', 'value')
     expect(result).toEqual({Jerry:1})
  })
  test("an array of data objects returns the correct lookup table", () => {
    const data = [
      {key: 'Jerry', value: 1}, 
      {key: 'Jorry', value: 2}, 
      {key: 'Jirry', value:3}, 
      {key: 'Jarry', value:4}];
    const result = createLookupObject(data, 'key', 'value')
    expect(result).toEqual({
      Jerry:1,
      Jorry:2,
      Jirry:3,
      Jarry:4
    })
  })
})
