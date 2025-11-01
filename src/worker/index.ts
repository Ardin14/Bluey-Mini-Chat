import { Hono } from "hono";

// Avoid requiring a project-specific `Env` type here; use the default generic.
const app = new Hono();

export default app;
