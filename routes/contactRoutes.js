const express = require("express");
const router = express.Router();
const {
  createContact,
  getContacts,
  updateContactStatus,
  deleteContact,
} = require("../controllers/contactController");
const { protect } = require("../middleware/auth");

// @route  POST /api/contacts
// @access Public — the public site posts visitor enquiries here, so this one
//         route stays unauthenticated.
router.post("/", createContact);

// Everything below reads or mutates stored enquiries, which contain visitor
// contact details, so each requires a signed-in admin.
// @route  GET /api/contacts
// @access Private
router.get("/", protect, getContacts);

// @route  PATCH /api/contacts/:id
// @access Private
router.patch("/:id", protect, updateContactStatus);

// @route  DELETE /api/contacts/:id
// @access Private
router.delete("/:id", protect, deleteContact);

module.exports = router;
