const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    symbol: {type: String, required: true},
    likes: {type: [String], default: []},
})

const Stock = mongoose.model('Stock', StockSchema);

exports.Stock = Stock;