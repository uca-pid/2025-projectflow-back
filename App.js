import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { logRequest } from "./utils/logger.js";
import bodyParser from "body-parser";
import { auth } from "./auth.js";
import express from "express";
import cors from "cors";

import taskRoutes from "./routes/task.js";
import userRoutes from "./routes/user.js";

const app = express();

//Define types
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Log requests (optional)
app.use(logRequest);

//Cross origin requests
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  res.json(session);
});

// protect a route example
app.get("/api/protected", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ secretData: "you got access", user: session.user });
});

//Routes
app.use("/task", taskRoutes);
app.use("/user", userRoutes);

//Test
app.get("/", (_, res) => {
  res.send("Hello World!").status(200);
});

export default app;
