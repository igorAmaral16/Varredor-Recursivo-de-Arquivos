const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const searchRoutes = require("./routes/search.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", searchRoutes);

app.use((err, _req, res, _next) => {
    console.error("[error]", err);
    res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
