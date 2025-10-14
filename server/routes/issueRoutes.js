// server/routes/issueRoutes.js
import express from "express";
import {
  createIssue,
  getIssues,
  updateIssueStatus,
} from "../controllers/issueController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createIssue);
router.get("/", getIssues);
router.put("/:id", authMiddleware, updateIssueStatus);

export default router;
