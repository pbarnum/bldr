import { Request, Response, Router } from "express";
import Schema from "validate";
import {
  BadRequest,
  Forbidden,
  InternalServerError,
  NotFound,
  WriteResponse,
} from "../domain/Response";
import Role from "../models/role";
import Scope from "../models/scope";
import User from "../models/user";
import { verifyScopes } from "../middlewares/auth";
import pagination from "./pagination";
import { Pagination } from "./queryParams";

const newUserValidationSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    match: /^[a-zA-Z]+$/,
    size: { min: 1, max: 32 },
    message: "must be an alpha string",
  },
  lastName: {
    type: String,
    required: true,
    match: /^[a-zA-Z]+$/,
    size: { min: 1, max: 32 },
    message: "must be an alpha string",
  },
  email: {
    type: String,
    required: true,
    // TODO: Test email?
  },
  password: {
    type: String,
    required: true,
    size: { min: 6 },
  },
});

const updateUserValidationSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    match: /^[a-zA-Z]+$/,
    size: { min: 1, max: 32 },
    message: "must be an alpha string",
  },
  lastName: {
    type: String,
    required: true,
    match: /^[a-zA-Z]+$/,
    size: { min: 1, max: 32 },
    message: "must be an alpha string",
  },
  email: {
    type: String,
    required: true,
    // TODO: Test email?
  },
});

export default (router: Router): Router => {
  router
    .get("/users", verifyScopes.bind(router, Scope.ListUsers))
    .post("/users", verifyScopes.bind(router, Scope.CreateUser))
    .get("/users/:userId", verifyScopes.bind(router, Scope.GetUser))
    .put("/users/:userId", verifyScopes.bind(router, Scope.UpdateUser))
    .delete("/users/:userId", verifyScopes.bind(router, Scope.DeleteUser))
    .patch(
      "/users/:userId/restore",
      verifyScopes.bind(router, Scope.DeleteUser)
    );

  router
    .route("/users")
    .get(
      async (
        req: Request<unknown, unknown, unknown, Pagination>,
        res: Response
      ) => {
        let page = req.query["page"];
        if (isNaN(page) || page <= 0) {
          page = 1;
        }

        let limit = req.query["limit"];
        if (isNaN(limit) || limit <= 0) {
          limit = 25;
        }

        let paranoid = true;
        if (req.user) {
          paranoid = !(await (req.user as User).isAdmin());
        }

        const offset = (page - 1) * limit;
        const { rows: users, count } = await User.findAndCountAll({
          limit,
          offset,
          paranoid,
        });
        if (users === null) {
          return InternalServerError(res);
        }

        if (users.length === 0) {
          return NotFound(res);
        }

        WriteResponse(res, 200, {
          ...pagination(offset, limit, count),
          users,
        });
      }
    )
    .post(async (req: Request, res: Response) => {
      const body = req.body;
      const errors = newUserValidationSchema.validate(body);
      if (errors && errors.length > 0) {
        console.error(errors);
        return BadRequest(res, errors);
      }

      const user = new User(body);
      const savedUser = await user.save().catch(console.error);
      if (!savedUser) {
        return InternalServerError(res);
      }

      const userRole = await Role.findOne({ where: { name: Role.User } }).catch(
        console.error
      );
      if (!userRole) {
        return InternalServerError(res);
      }

      await user.addRole(userRole).catch(console.error);

      WriteResponse(res, 201, { user });
    });

  router
    .route("/users/:userId")
    .get(async (req: Request, res: Response) => {
      const user = await User.findByPk(req.params.userId).catch(console.error);
      if (!user) {
        return NotFound(res);
      }

      WriteResponse(res, 200, { user });
    })
    .put(async (req: Request, res: Response) => {
      const body = req.body;
      const errors = updateUserValidationSchema.validate(body);
      if (errors && errors.length > 0) {
        console.error(errors);
        return BadRequest(res, errors);
      }

      const user = await User.findByPk(req.params.userId);
      if (!user) {
        return NotFound(res);
      }

      const updated = await user
        .set({
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
        })
        .save()
        .catch(console.error);
      if (!updated) {
        return InternalServerError(res);
      }

      WriteResponse(res, 200, { user: updated });
    })
    .delete(async (req: Request, res: Response) => {
      const user = await User.findByPk(req.params.userId);
      if (!user) {
        return NotFound(res);
      }

      if (await user.isAdmin()) {
        return Forbidden(res);
      }

      await user.destroy().catch(console.error);

      WriteResponse(res, 204);
    });

  router
    .route("/users/:userId/restore")
    .patch(async (req: Request, res: Response) => {
      const user =
        (req.user as User) ||
        (await User.findByPk(req.params.userId).catch(console.error));
      if (!user) {
        return NotFound(res);
      }

      await user.restore();

      WriteResponse(res, 200, { user });
    });

  return router;
};
