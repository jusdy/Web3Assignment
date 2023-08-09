import express from "express";
import CCXTBinanceController from "../controllers/binance";

const router = express.Router();

const controller = new CCXTBinanceController();

router.get("/coins", async (_req, res) => {
  const response = await controller.getCurrencies();
  return res.send(response);
});

router.get("/average-prices", async (_req, res) => {
  const {first, limit} = _req.query;
  const response = await controller.getAveragePrices();
  return res.send(response);
});

export default router;
