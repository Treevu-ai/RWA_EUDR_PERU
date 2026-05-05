export const resolveContext = (req) => {
  const orgId = req.header("x-org-id");
  const actorId = req.header("x-actor-id") ?? null;

  if (!orgId) {
    const error = new Error("x-org-id header is required");
    error.statusCode = 400;
    throw error;
  }

  return { orgId, actorId };
};
