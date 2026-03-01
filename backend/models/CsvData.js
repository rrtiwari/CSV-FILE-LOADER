const mongoose = require('mongoose');

const csvDataSchema = new mongoose.Schema({}, { 
  strict: false, 
  timestamps: true 
});

csvDataSchema.index({ "$**": "text" });

module.exports = mongoose.model('CsvData', csvDataSchema);