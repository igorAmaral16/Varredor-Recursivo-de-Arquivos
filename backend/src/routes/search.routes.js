const express = require("express");
const { search, copy } = require("../controllers/search.controller");

const router = express.Router();

router.post("/search", search);
router.post("/copy", copy);

module.exports = router;
