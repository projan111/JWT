import JWT from "jsonwebtoken";
const secret_key = process.env.SECRET_KEY;

// Middleware to verify the token
export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  JWT.verify(token, secret_key, (err, decoded) => {
    if (err)
      return res.status(500).json({ message: "Failed to authenticate token" });

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Requires admin role" });
  }
  next();
};
