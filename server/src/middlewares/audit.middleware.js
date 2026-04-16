import AuditLog from "../models/AuditLog.js";

export const logAudit = (resourceName, actionName) => {
    return async (req, res, next) => {
        // Intercept the response using on-finished or just logging after next
        // But since we want to capture successful actions usually:
        res.on("finish", async () => {
            // Only log successful modifications (POST, PUT, DELETE, PATCH)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    await AuditLog.create({
                        institutionId: req.user ? req.user.institutionId : null,
                        userId: req.user ? req.user.userId : null,
                        action: actionName || req.method,
                        resource: resourceName || req.baseUrl,
                        method: req.method,
                        ipAddress: req.ip,
                        details: {
                            params: req.params,
                            query: req.query,
                            bodyLength: (JSON.stringify(req.body) || '{}').length,
                        } // We don't save full body to avoid PII leak
                    });
                } catch (error) {
                    console.error("Audit Logging Failed:", error);
                }
            }
        });

        next();
    };
};
