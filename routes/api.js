'use strict';
const Stock = require("../models").Stock;
const fetch = require("node-fetch")

const createStock = async (stock, like, ip) => {
  const newStock = new Stock({
    symbol: stock,
    likes: like ? [ip] : [],
  })

  return (await newStock.save());
}

const findStock = async(stock) => {
  return await StockModel.findOne({symbol: stock}).exec()
}

const saveScock = async (stock, like,ip) => {
  const foundStock = await findStock(stock);
  if (!foundStock) {
    return await createStock(stock, like, ip)
  } else {
    if (like && foundStock.likes.indexOf(ip) === -1) {
      foundStock.likes.push(ip);
    }

    return await foundStock.save();
  }
}

const getStock = async (stock) => {
  const res = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
  const {symbol, latestPrice} = await res.json();
  return {symbol, latestPrice}
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const {stock, like} = req.query;

      if (Array.isArray(stock)) {
        console.log("stocks", stock)
        const {symbol, latestPrice} = await getStock(stock[0])
        const {symbol: symbol2, latestPrice:latestPrice2} = await getStock(stock[1])

        const firstStock = await saveStock(stock[0], like, req.ip)
        const secondStock = await saveStock(stock[1], like, req.ip)

        let stockData = []
        if (!symbol) {
          stockData.push({
            rel_likes: firstStock.likes.length - secondStock.likes.length,
          })
        } else {
          stockData.push({
            stock: symbol, price: latestPrice, rel_likes: secondStock.likes.length - firstStock.likes.length,
          })
        }

        if (!symbol2) {
          stockData.push({rel_likes: firstStock.likes.length - secondStock.likes.length,})
        } else {
          stockData.push({stock, symbol2, price: latestPrice2, rel_likes: secondStock.likes.length - firstStock.likes.length,})
        }

        return res.json({stockData})
      }

      const {symbol, latestPrice} = await getStock(stock)
      if (!symbol) {
        return res.json({stockData: {likes: like ? 1 : 0}})
      }

      const oneStockData = await saveStock(symbol, like, req.ip);
      return res.json({stockData: {stock: symbol, price: latestPrice, likes: oneStockData.likes.length}})
    });
    
};
