import express, { Request, Response } from "express";
import "express-async-errors";
import session from "express-session";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import passport from "./config/passport-config";

//Errors Handling Imports
import { errorHandler } from "./middlewares/error-handlers";
import { NotFoundError } from "./errors/not-found-error";
import { requestErrHandling } from "./errors/request-validation-errors";

//@ Routes Imports
//Merchants
import { MerchantAuthRouter } from "./routes/merchant/merchant-auth";
import { MerchantProfileRouter } from "./routes/merchant/merchant-profile";
import { MerchantProductRouter } from "./routes/merchant/merchant-product";
import { MerchantSubscriptionRouter } from "./routes/merchant/merchant-subscription";

import { EmailRouter } from "./routes/email-routes/email.route";
import { UserEmailRouter } from "./routes/email-routes/user.email.route";
import { UserRouter } from "./routes/email-routes/user.route";

//Principal Admin
import { CartleAuthRouter } from "./routes/principal-admin/auth";
import { SubscriptionPlanRouter } from "./routes/principal-admin/subscription";

//Global Route
import { GlobalRouter } from "./routes/global-route/global-route";

const app = express();
dotenv.config();
app.use(json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:3000", "https://reartify.vercel.app"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// const sessionSecret = process.env.SESSION_SECRET || '';
// app.use(
//   session({
//     secret: sessionSecret,
//     resave: false,
//     saveUninitialized: true,
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());
app.use(helmet());

//Global Routes
app.use("/reartify", GlobalRouter);

//Merchants
app.use("/merchant/auth", MerchantAuthRouter);
app.use("/merchant", MerchantProfileRouter);
app.use("/merchant", MerchantProductRouter);
app.use("/merchant", MerchantSubscriptionRouter);

app.use("/api", EmailRouter);
app.use("/api", UserEmailRouter);
app.use("/api", UserRouter);

//Admin
app.use("/admin", CartleAuthRouter);
app.use("/admin", SubscriptionPlanRouter);

app.get("/", (req: Request, res: Response) => {
  res.json("Welcome to Reatify 😜");
});

//Handling Not found error & Implementing Error Handling
app.all("*", async (req: Request, res: Response) => {
  throw new NotFoundError();
});

app.use(errorHandler);
app.use(requestErrHandling);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Welcome to reartify`);
});
