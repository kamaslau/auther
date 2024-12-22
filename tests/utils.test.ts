import { periods } from '../src/utils.js'

test("7DaysPerWeek", () => {
  expect(periods._week / periods._day).toBe(7);
});
