import express from "express";
import EthersTestController from "../controllers/ethers";

const router = express.Router();

const controller = new EthersTestController();

router.get("/address-validate", (_req, res) => {
  const { address } = _req.query;
  const response = controller.validateAddress(address as string);
  return res.send(response);
});

router.get("/generate-wallet", (_req, res) => {
  const response = controller.generateWallet();
  return res.send(response);
});

router.get("/wallet-history", async (_req, res) => {
  const { address } = _req.query;
  const response = await controller.getWalletHistory(address as string);
  return res.send(response);
});

export default router;
