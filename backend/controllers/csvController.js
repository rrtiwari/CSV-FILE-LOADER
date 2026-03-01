const fs = require("fs");
const csv = require("csv-parser");
const CsvData = require("../models/CsvData");

const uploadCsv = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  let batch = [];
  const BATCH_SIZE = 5000;
  let isError = false;

  const stream = fs
    .createReadStream(req.file.path)
    .pipe(csv())
    .on("data", async (data) => {
      batch.push(data);
      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        try {
          await CsvData.insertMany(batch);
          batch = [];
          stream.resume();
        } catch (error) {
          isError = true;
          stream.destroy(error);
        }
      }
    })
    .on("end", async () => {
      if (isError) return;
      try {
        if (batch.length > 0) {
          await CsvData.insertMany(batch);
        }
        fs.unlinkSync(req.file.path);
        res.json({
          message: "File successfully processed and saved to database!",
        });
      } catch (error) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Database save failed on final batch" });
      }
    })
    .on("error", (error) => {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    });
};

const getCsvData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = { $text: { $search: search } };
    }

    const data = await CsvData.find(query).skip(skip).limit(limit);
    const total = await CsvData.countDocuments(query);

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

module.exports = { uploadCsv, getCsvData };
