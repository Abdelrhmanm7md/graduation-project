import authRouter from "./auth/auth.routes.js";
import usersRouter from "./users/users.routes.js";
export function init(app) {
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/auth", authRouter);


  app.use("/", (req, res, next) => {
    // res.send("Page Not Found");
   return res.status(404).json({ message: "Page Not Found" });
  });

  app.all("*", (req, res, next) => {
    next(res.status(404).json({ message: "Page Not found" }));
  });
}
