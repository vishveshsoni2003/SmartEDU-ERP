import { ZodError } from "zod";

/**
 * Higher order middleware to strictly validate incoming request payloads against a Zod schema.
 * Prevents payload bloat, NoSQL injections via objects, and invalid data types.
 */
export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Strip out any properties that aren't defined in the schema to prevent NoSQL injection via extra fields
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join("."),
                    message: err.message
                }));
                return res.status(400).json({ message: "Data Validation Failed", errors });
            }
            next(error);
        }
    };
};
