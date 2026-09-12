const asyncHandler = require("express-async-handler");
const { isValidPhoneNumber } = require("libphonenumber-js");
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

  // Mirrors the frontend's react-phone-number-input check (same underlying
  // libphonenumber rules) so a request sent straight to this API — bypassing
  // the browser form — can't slip an invalid or malformed phone number past
  // the same validation the UI already enforces.
  if (!phone?.trim() || !isValidPhoneNumber(phone.trim())) {
    res.status(400);
    throw new Error("Please provide a valid phone number");
  }

  const contact = await Contact.create({
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    subject: subject?.trim() || "",
    message: message.trim(),
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, message: "Enquiry received", data: contact });
});

// ─── List enquiries (admin) ───────────────────────────────────────────────────
// @route  GET /api/contacts
// @access Private (Admin only)
// Supports ?status=new|read|replied|archived, ?search=<name/email/phone>, and
// page/limit paging. Newest first, since the dashboard is read top-down.
const getContacts = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const filter = {};
  if (status && status !== "all") filter.status = status;

  if (search?.trim()) {
    // Escaped so a user typing "a+b" or "(" gets a literal search instead of
    // a regex error.
    const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, "i");
    filter.$or = [{ name: re }, { email: re }, { phone: re }, { message: re }];
  }

  const [items, total, newCount] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Contact.countDocuments(filter),
    Contact.countDocuments({ status: "new" }),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) || 1, newCount },
  });
});

// ─── Update enquiry status (admin) ────────────────────────────────────────────
// @route  PATCH /api/contacts/:id
// @access Private (Admin only)
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowed = ["new", "read", "replied", "archived"];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(", ")}`);
  }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!contact) {
    res.status(404);
    throw new Error("Enquiry not found");
  }

  res.json({ success: true, data: contact });
});

// ─── Delete enquiry (admin) ───────────────────────────────────────────────────
// @route  DELETE /api/contacts/:id
// @access Private (Admin only)
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error("Enquiry not found");
  }

  res.json({ success: true, message: "Enquiry deleted" });
});

module.exports = { createContact, getContacts, updateContactStatus, deleteContact };
