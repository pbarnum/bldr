import { Request, Response, Router } from "express";
import * as expressCore from "express-serve-static-core";
import Schema from "validate";
import Template from "../models/template";
import {
  BadRequest,
  InternalServerError,
  NotFound,
  WriteResponse,
} from "../domain/Response";
import User from "../models/user";
import pagination from "./pagination";
import { ListResourcesQP } from "./queryParams";
import Scope from "../models/scope";
import { verifyScopes } from "../middlewares/auth";

const newTemplateValidationSchema = new Schema({
  name: {
    type: String,
    required: true,
    size: { min: 1, max: 32 },
  },
  size: {
    type: Number,
    required: true,
  },
  contents: {
    type: String,
    required: true,
    size: { min: 1 },
  },
});

export default (router: Router): Router => {
  router
    .get("/users/templates", verifyScopes.bind(router, Scope.ListTemplates))
    .post("/users/templates", verifyScopes.bind(router, Scope.CreateTemplate))
    .get(
      "/users/:userId/templates/:templatId",
      verifyScopes.bind(router, Scope.GetTemplate)
    )
    .put(
      "/users/:userId/templates/:templatId",
      verifyScopes.bind(router, Scope.UpdateTemplate)
    )
    .delete(
      "/users/:userId/templates/:templatId",
      verifyScopes.bind(router, Scope.DeleteTemplate)
    )
    .patch(
      "/users/:userId/templates/:templatId/restore",
      verifyScopes.bind(router, Scope.DeleteTemplate)
    );

  router
    .route("/users/:userId/templates")
    .get(
      async (
        req: Request<
          expressCore.ParamsDictionary,
          unknown,
          unknown,
          ListResourcesQP
        >,
        res: Response
      ) => {
        let page = req.query.page;
        if (isNaN(page) || page <= 0) {
          page = 1;
        }

        let limit = req.query.limit;
        if (isNaN(limit) || limit <= 0) {
          limit = 25;
        }

        const user =
          (req.user as User) ||
          (await User.findByPk(req.params.userId).catch(console.error));
        if (!user) {
          return NotFound(res);
        }

        // FIXME: Query param should be type 'boolean'. This is missing edge cases (1/0/'TRUE'/etc)
        let paranoid = (req.query.archived || "").toLowerCase() === "false";
        if (await user.isAdmin()) {
          paranoid = false;
        }

        const offset = (page - 1) * limit;
        const { rows: templates, count } = await Template.findAndCountAll({
          where: { userId: req.params.userId },
          limit,
          offset,
          paranoid,
        });
        if (templates === null) {
          return InternalServerError(res);
        }

        if (templates.length === 0) {
          return NotFound(res);
        }

        WriteResponse(res, 200, {
          ...pagination(offset, limit, count),
          templates,
        });
      }
    )
    .post(async (req: Request, res: Response) => {
      const body = req.body;
      const errors = newTemplateValidationSchema.validate(body);
      if (errors && errors.length > 0) {
        console.error(errors);
        return BadRequest(res, errors);
      }

      const user = await User.findByPk(req.params.userId);
      if (!user) {
        console.error("user does not exist");
        return NotFound(res);
      }

      const templateWithUser = {
        ...body,
        userId: req.params.userId,
      };

      const template = new Template(templateWithUser, {
        include: [User],
      });
      const ok = await template.save().catch(console.error);
      if (!ok) {
        return InternalServerError(res);
      }

      WriteResponse(res, 201, { template });
    });

  router
    .route("/users/:userId/templates/:templateId")
    .get(async (req: Request, res: Response) => {
      const template = await Template.findOne({
        paranoid: false,
        include: [User],
        where: {
          id: req.params.templateId,
          userId: req.params.userId,
        },
      });
      if (!template) {
        return NotFound(res);
      }

      WriteResponse(res, 200, { template });
    })
    .put(async (req: Request, res: Response) => {
      const body = req.body;
      const errors = newTemplateValidationSchema.validate(body);
      if (errors && errors.length > 0) {
        console.error(errors);
        return BadRequest(res, errors);
      }

      const user =
        (req.user as User) ||
        (await User.findByPk(req.params.userId).catch(console.error));
      if (!user) {
        return NotFound(res);
      }

      let where = {
        id: req.params.templateId,
      };
      if (!(await user.isAdmin())) {
        where = Object.assign(where, { userId: user.id });
      }

      const template = await Template.findOne({ where, include: [User] });
      if (!template) {
        return NotFound(res);
      }

      const updated = await template.set({ body }).save().catch(console.error);
      if (!updated) {
        return InternalServerError(res);
      }

      WriteResponse(res, 200, { template: updated });
    })
    .delete(async (req: Request, res: Response) => {
      const user =
        (req.user as User) ||
        (await User.findByPk(req.params.userId).catch(console.error));
      if (!user) {
        return NotFound(res);
      }

      let where = {
        id: req.params.templateId,
      };
      if (!(await user.isAdmin())) {
        where = Object.assign(where, { userId: user.id });
      }

      const template = await Template.findOne({ where });
      if (!template) {
        return NotFound(res);
      }

      await template.destroy().catch(console.error);

      WriteResponse(res, 204);
    });

  router
    .route("/users/:userId/templates/:templateId/restore")
    .patch(async (req: Request, res: Response) => {
      const user =
        (req.user as User) ||
        (await User.findByPk(req.params.userId).catch(console.error));
      if (!user) {
        return NotFound(res);
      }

      let where = {
        id: req.params.templateId,
      };
      if (!(await user.isAdmin())) {
        where = Object.assign(where, { userId: user.id });
      }

      const template = await Template.findOne({
        where,
        paranoid: false,
        include: [User],
      });
      if (!template) {
        return NotFound(res);
      }

      await template.restore();

      WriteResponse(res, 200, { template });
    });

  return router;
};
