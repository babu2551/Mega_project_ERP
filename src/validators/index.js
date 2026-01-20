import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";
import { validate } from "../middlewares/validator-middleware.js";
import { query, body, param } from "express-validator";

const router = Router();

// Example: validate query params if needed
router.get(
    "/",
    [
        query("status").optional().isString().withMessage("status must be a string"),
        validate
    ],
    healthCheck
);

export default router;
