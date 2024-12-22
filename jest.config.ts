/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // https://github.com/kulshekhar/ts-jest/issues/1057
  "moduleNameMapper": {
    "@src/(.*)": "<rootDir>/src/$1",
    "^(..?/.+).js?$": "$1"
  },
};