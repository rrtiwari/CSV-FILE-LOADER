const express = require("express");
const multer = require("multer");
const {
  uploadCsv,
  getCsvData,
  clearCsvData,
} = require("../controllers/csvController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadCsv);
router.get("/data", getCsvData);
router.delete("/clear", clearCsvData);

module.exports = router;
