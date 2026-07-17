/**
 * @file rbac.middleware.js
 * @description Role-Based Access Control (RBAC) middleware for HealthBot.
 *              Provides a factory function that generates Express middleware
 *              to restrict route access based on user roles (e.g., CITIZEN, ASHA_WORKER).
 *              Must be used AFTER the auth middleware so that req.user is populated.
 *
 * @example
 *   const rbac = require("./rbac.middleware");
 *   router.get("/admin-only", authMiddleware, rbac(["ASHA_WORKER"]), handler);
 */

const User = require("../models/user");

/**
 * Factory function that returns an Express middleware restricting
 * access to users whose role is in the `allowedRoles` array.
 *
 * @param {string[]} allowedRoles - Array of roles permitted to access the route.
 * @returns {Function} Express middleware (req, res, next).
 */
const rbac = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            // req.user is set by auth.middleware.js (contains decoded JWT payload)
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: "Authentication required before role check."
                });
            }

            // Fetch the full user document to get the role
            const user = await User.findById(req.user.id).select("role").lean();

            if (!user) {
                return res.status(401).json({ message: "User not found." });
            }

            const userRole = user.role || "CITIZEN";

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    message: `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${userRole}.`
                });
            }

            // Attach the role to req.user for downstream handlers
            req.user.role = userRole;
            next();
        } catch (err) {
            console.error("RBAC middleware error:", err.message);
            return res.status(500).json({ message: "Internal server error during authorization." });
        }
    };
};

module.exports = rbac;
