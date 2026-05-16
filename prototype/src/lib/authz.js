const ROLE_PRIORITY = {
  viewer: 1,
  operator: 2,
  admin: 3
};

export const resolveRole = (req) => {
  const role = (req.header("x-role") ?? "viewer").toLowerCase();
  if (!ROLE_PRIORITY[role]) return "viewer";
  return role;
};

export const requireRole = (minimumRole) => {
  return (req, _res, next) => {
    const current = resolveRole(req);
    if (ROLE_PRIORITY[current] < ROLE_PRIORITY[minimumRole]) {
      const error = new Error(`role ${minimumRole} required`);
      error.statusCode = 403;
      return next(error);
    }
    return next();
  };
};
