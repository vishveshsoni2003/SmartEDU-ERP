import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded: { userId, role, institutionId }
    req.user.id = decoded.userId; // normalize: req.user.id works everywhere
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid" });
  }
};

/**
 * TENANT ISOLATION MIDDLEWARE
 * Ensures the logged-in user can only read/write data for their institution.
 * SUPER_ADMIN bypasses this.
 */
export const isolateTenant = (req, res, next) => {
  if (req.user && req.user.role === "SUPER_ADMIN") {
    return next();
  }

  // Force attach institutionId to body/query so controllers can just use req.body.institutionId
  // without trusting the client input
  if (req.user.institutionId) {
    if (req.body && typeof req.body === 'object') {
      req.body.institutionId = req.user.institutionId;
    }
    if (req.query && typeof req.query === 'object') {
      req.query.institutionId = req.user.institutionId;
    }
  }

  next();
};
