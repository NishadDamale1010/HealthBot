/**
 * @file factCheck.middleware.js
 * @description Express middleware that intercepts incoming chat messages and
 *              runs them through the PIB Misinformation Firewall.
 *
 *              If misinformation is detected, the result is attached to
 *              `req.factCheckResult` so downstream handlers (e.g., the chat
 *              controller) can include a warning/correction in the response.
 *
 *              This middleware does NOT block the request — it enriches it.
 *
 * @usage
 *   const factCheckMiddleware = require("../features/misinformation/factCheck.middleware");
 *   router.post("/message", factCheckMiddleware, chatController.handleMessage);
 */

const { checkForMisinformation } = require("./factCheck");

/**
 * Middleware that checks the user's message for health misinformation.
 * Attaches `req.factCheckResult` with the check outcome.
 *
 * Looks for the message in common request body fields:
 *   - req.body.message
 *   - req.body.query
 *   - req.body.text
 *
 * @param {object} req  - Express request object.
 * @param {object} res  - Express response object.
 * @param {Function} next - Express next function.
 */
const factCheckMiddleware = (req, res, next) => {
    try {
        // Extract the user's message from the request body
        const userMessage = req.body?.message || req.body?.query || req.body?.text || "";

        if (userMessage) {
            const result = checkForMisinformation(userMessage);
            req.factCheckResult = result;

            // Log detection for monitoring (non-blocking)
            if (result.isMisinformation) {
                console.log(
                    `⚠️ [Misinformation Detected] mythId=${result.mythId} | ` +
                    `query="${userMessage.substring(0, 80)}..."`
                );
            }
        } else {
            // No message to check — set default result
            req.factCheckResult = { isMisinformation: false };
        }

        next();
    } catch (err) {
        // Never block the request due to a fact-check failure
        console.error("FactCheck middleware error:", err.message);
        req.factCheckResult = { isMisinformation: false, error: "Fact-check unavailable" };
        next();
    }
};

module.exports = factCheckMiddleware;
