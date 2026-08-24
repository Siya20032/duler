const jwt = require("jsonwebtoken");
const { User } = require("../models");
const config = require("../config");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return res.status(401).json({ detail: "Invalid or expired authentication token" });
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: [config.jwtAlgorithm] });
    const user = await User.findOne({ where: { id: payload.sub, isActive: true } });
    if (!user) return res.status(401).json({ detail: "User not found or inactive" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ detail: "Invalid or expired authentication token" });
  }
}
module.exports = requireAuth;
