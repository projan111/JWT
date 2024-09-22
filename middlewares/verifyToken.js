import JWT from "jsonwebtoken";

// Middleware to verify the token
export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];

  if (!token) return res.status(403).json({ message: "No token provided" });

  JWT.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(500).json({ message: "Failed to authenticate token" });

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res
      .status(403)
      .json({ status: "Access Denied!!!", message: "Requires admin role" });
  }
  next();
};
