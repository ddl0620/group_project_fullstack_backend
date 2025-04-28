import express from "express";
import { DiscussionPostController } from "../controllers/discussionPost.controllers";
import { authenticationToken } from "../middlewares/auth.middleware";
import { checkEventParticipant } from "../middlewares/checkEventParticipant.middleware";
import upload from "../uploads/multer.config";

const router = express.Router();

// input: eventId là string nhé --> oke roi
router.post("/:eventId", authenticationToken, checkEventParticipant, upload.array("images", 10), DiscussionPostController.createPost);

// input: eventId là string nhé --> oke roi
router.get("/:eventId", authenticationToken, checkEventParticipant, DiscussionPostController.getPosts);

// input: eventId và postId --> oke rồi
router.get("/:eventId/posts/:postId", authenticationToken, checkEventParticipant, DiscussionPostController.getPostById);

// --> oke roi
router.put("/:postId", authenticationToken, upload.array("images", 10), DiscussionPostController.updatePost);

// input: eventId và postId --> oke roi
router.delete("/:eventId/posts/:postId", authenticationToken, checkEventParticipant, DiscussionPostController.deletePost);


export default router;