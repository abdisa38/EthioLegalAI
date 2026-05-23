const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

const register = async (req, res, next) => {
  try {
    const { name, email, password, languagePreference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: { message: "Name, email, and password are required" } });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: { message: "Email is already registered" } });
    }

    const user = await User.create({
      name,
      email,
      password,
      languagePreference: languagePreference || "en",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        languagePreference: user.languagePreference,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: { message: "Email and password are required" } });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ error: { message: "Invalid credentials" } });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: { message: "Invalid credentials" } });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        languagePreference: user.languagePreference,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res) => {
  res.json({ message: "Logged out" });
};

const profile = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  logout,
  profile,
};
