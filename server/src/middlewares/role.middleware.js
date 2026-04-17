/**
 * allowRoles middleware
 * Grants access only when req.user.role matches one of the allowed roles.
 * No bypass logic — role checks are strict and canonical.
 * 
 * The TRANSPORT_MANAGER/FACULTY special case has been intentionally removed.
 * Faculty with TRANSPORT_MANAGER type are still FACULTY role users and should
 * not access DRIVER endpoints. The driver dashboard is reserved for DRIVER accounts.
 */
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      message: "Access denied: insufficient permissions"
    });
  };
};
