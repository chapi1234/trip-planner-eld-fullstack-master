const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Provide a clearer error so developers know to set JWT_SECRET
    throw new Error('JWT_SECRET is not set in environment. Set JWT_SECRET in your .env file');
  }
  return jwt.sign({ id: user._id }, secret, {
    expiresIn: "7d",
  });
};

exports.signup = asyncHandler(async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, first_name, last_name });

  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" });

  res.json({ message: "ok", user: { id: user._id, email: user.email, first_name: user.first_name, last_name: user.last_name, current_cycle_used: user.current_cycle_used } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" });

  res.json({ message: "ok", user: { id: user._id, email: user.email, first_name: user.first_name, last_name: user.last_name, current_cycle_used: user.current_cycle_used } });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "logged out" });
});

exports.me = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  res.json({ user: { id: req.user._id, email: req.user.email, first_name: req.user.first_name, last_name: req.user.last_name, current_cycle_used: req.user.current_cycle_used } });
});

exports.csrf = asyncHandler(async (req, res) => {
  // Frontend expects a csrf endpoint; we return a simple token placeholder.
  res.json({ csrf_token: "nocheck" });
});

exports.updateMe = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

  const { first_name, last_name, email, current_cycle_used } = req.body;

  if (first_name !== undefined) req.user.first_name = first_name;
  if (last_name !== undefined) req.user.last_name = last_name;
  if (email !== undefined) req.user.email = email;
  if (current_cycle_used !== undefined) req.user.current_cycle_used = current_cycle_used;

  await req.user.save();

  res.json({ user: { id: req.user._id, email: req.user.email, first_name: req.user.first_name, last_name: req.user.last_name, current_cycle_used: req.user.current_cycle_used } });
});
