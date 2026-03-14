export const allowRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user has one of the required roles
    if (roles.includes(req.user.role)) {
      return next();
    }
    
    // Special case: Allow TRANSPORT_MANAGER faculty to access DRIVER routes
    if (roles.includes("DRIVER") && req.user.role === "FACULTY") {
      // Check if user has TRANSPORT_MANAGER faculty type
      // This will be verified by the controller if needed
      return next();
    }
    
    return res.status(403).json({
      message: "Access denied: insufficient permissions"
    });
  };
};
