import express from "express";
const router = express.Router();

import {
  addItem,
  getAllItems,
  getItemById,
  sendEnquiryEmail,
} from "../controllers/itemController.js";
import upload from "../middleware/uploadMiddleware.js";

router.post("/", upload, addItem);

router.get("/", getAllItems);

router.get("/:id", getItemById);

router.post("/:id/enquire", sendEnquiryEmail);

export default router;
