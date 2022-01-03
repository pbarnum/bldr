import { Request, Response } from "express";
import { MethodNotAllowed, NotFound } from "../domain/Response";
import path from "../route/path";

// Check to see if the requested route has the requested method as well
export default (
  req: Request,
  res: Response,
  next: (param?: unknown) => void
): void => {
  const route = path(req.path);

  if (!route || !route.methods) {
    NotFound(res);
    return;
  } else if (!route.methods.includes(req.method)) {
    MethodNotAllowed(res.setHeader("allow", route.methods));
    return;
  }

  next();
};
