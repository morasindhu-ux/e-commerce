const { body } = require("express-validator");

const stockValidation = [
  body("symbol")
    .notEmpty()
    .withMessage("Symbol required"),

  body("companyName")
    .notEmpty()
    .withMessage("Company name required"),

  body("currentPrice")
    .isNumeric()
    .withMessage("Current price must be numeric"),
];

module.exports = stockValidation;