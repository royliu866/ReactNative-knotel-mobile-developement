'use strict';

var ignore = 0;
var error = 2;


// Node style guide rules
var nsg = {
  "array-bracket-spacing": [2, "never"],
  "block-scoped-var": 2,
  "brace-style": [2, "1tbs"],
  "camelcase": 1,
  "computed-property-spacing": [2, "never"],
  "curly": 2,
  "eol-last": 2,
  "eqeqeq": [2, "smart"],
  "max-depth": [1, 3],
  "max-len": [1, 80],
  "max-statements": [1, 15],
  "new-cap": 1,
  "no-extend-native": 2,
  "no-mixed-spaces-and-tabs": 2,
  "no-trailing-spaces": 2,
  "no-unused-vars": 1,
  "no-use-before-define": [2, "nofunc"],
  "object-curly-spacing": [2, "never"],
  "quotes": [2, "single", "avoid-escape"],
  "semi": [2, "always"],
  "keyword-spacing": [2, {"before": true, "after": true}],
  "space-unary-ops": 2,
};

// Our extensions
var ourRules = {
  "max-len": [error, 130],
  "object-curly-spacing": [error, "always", { "objectsInObjects": false, "arraysInObjects": false }],
  "array-bracket-spacing": [error, "always", { "singleValue": false, "objectsInArrays": false, "arraysInArrays": false}],
  "no-unused-vars": ignore,
  "semi": ignore,
  "curly": ignore,
  "max-statements": ignore,
  "brace-style": [error, "1tbs", { "allowSingleLine": true }],
  "new-cap": ignore,
  "comma-spacing": [error, { "before": false, "after": true }],
  "no-use-before-define": [error, { "functions": false, "classes": true, "variables": false }],
};


for (var rule in ourRules) nsg[rule] = ourRules[rule];

module.exports = {
  parserOptions: {
      "ecmaVersion": 8,
      "sourceType": "module",
      "ecmaFeatures": {
          "jsx": true,
          "experimentalObjectRestSpread": true,
      }
  },
  rules: nsg,
};
