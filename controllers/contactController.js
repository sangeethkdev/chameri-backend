const asyncHandler = require("express-async-handler");
const Contact = require("../models/Contact");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Create contact (public site submission) ──────────────────────────────────
// @route  POST /api/contacts
// @access Public
const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400);
    throw new Error("Name, email and message are required");
  }

  if (!EMAIL_RE.test(email.trim())) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }

  const contact = await Contact.create({
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || "",
    subject: subject?.trim() || "",
    message: message.trim(),
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, message: "Enquiry received", data: contact });
});

module.exports = { createContact };
