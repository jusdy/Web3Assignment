import express from "express";
import PingController from "../controllers/ping";
import ethersRouter from "./ethers";
import binanceRouter from "./binance";

const router = express.Router();

router.get("/ping", async (_req, res) => {
  const controller = new PingController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.use("/ethers", ethersRouter);
router.use("/ccxt/binance", binanceRouter);

export default router;
