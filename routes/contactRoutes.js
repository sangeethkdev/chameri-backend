const express = require("express");
const router = express.Router();
const { createContact } = require("../controllers/contactController");

// @route  POST /api/contacts
// @access Public
router.post("/", createContact);

module.exports = router;
