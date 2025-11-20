// server/routes/issueRoutes.js
import express from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  addComment,
  getIssueStats,
  uploadMiddleware,
  uploadResolutionMiddleware,
} from "../controllers/issueController.js";
import { authMiddleware, adminOnly, staffOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getIssues);
router.get("/stats", authMiddleware, staffOrAdmin, getIssueStats);
router.get("/:id", getIssueById);

// Authenticated routes
router.post("/", authMiddleware, uploadMiddleware, createIssue);
router.put("/:id", authMiddleware, staffOrAdmin, uploadResolutionMiddleware, updateIssue);
router.delete("/:id", authMiddleware, adminOnly, deleteIssue);

// Comments
router.post("/:id/comments", authMiddleware, addComment);

export default router;
