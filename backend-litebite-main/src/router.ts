import express from "express";

import authRouter from "@/routers/auth-router";
import restaurantsRouter from "@/routers/restaurants-router";
import foodRouter from "@/routers/foods-router";
import reviewsRouter from "@/routers/reviews-router";
import usersRouter from "@/routers/users-router";
import profileRouter from "@/routers/profile-router";
import reportRouter from "@/routers/report-router";
import aiRouter from "@/routers/ai-router";
import configurationRouter from "@/routers/configuration-router";

const router = express.Router();

router.use(authRouter);
router.use(aiRouter);
router.use(profileRouter);
router.use(restaurantsRouter);
router.use(foodRouter);
router.use(reviewsRouter);
router.use(usersRouter);
router.use(reportRouter);
router.use(configurationRouter);

export default router;
