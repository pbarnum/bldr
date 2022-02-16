import { randomUUID } from 'crypto';
import { Request, Response, Router } from 'express';
import * as expressCore from 'express-serve-static-core';
import * as fs from 'fs';
import Schema from 'validate';
import Generator from '../domain/Generator';
import { strToBool } from '../domain/Request';
import { BadRequest, InternalServerError, NotFound, WriteResponse } from '../domain/Response';
import { verifyScopes } from '../middlewares/auth';
import Output from '../models/output';
import Scope from '../models/scope';
import Template from '../models/template';
import User from '../models/user';
import pagination from './pagination';
import { ListResourcesQP } from './queryParams';

const createOutputValidationSchema = new Schema({
  name: {
    type: String,
    required: false,
    size: { min: 5, max: 32 },
    // REFERENCE: https://regexr.com/3bdiv
    match: /^[\w\s-()]+(\.([a-zA-Z0-9]*))?$/,
  },
  variables: {
    type: Object,
    required: true,
  },
});

const listOutputs = async (
  req: Request<expressCore.ParamsDictionary, unknown, unknown, ListResourcesQP>,
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

  const user = (req.user as User) || (await User.findByPk(req.params.userId).catch(console.error));
  if (!user) {
    return NotFound(res);
  }

  const paranoid = !strToBool(req.query.archived);
  let where = {};
  if (req.params.templateId) {
    where = Object.assign(where, { templateId: req.params.templateId });
  }

  if (!(await user.isAdmin())) {
    where = Object.assign(where, { userId: user.id });
  }

  const offset = (page - 1) * limit;
  const { rows: outputs, count } = await Output.findAndCountAll({
    limit,
    offset,
    where,
    paranoid,
    include: [User, Template],
  });
  if (!outputs) {
    return InternalServerError(res);
  }

  if (outputs.length === 0) {
    return NotFound(res);
  }

  WriteResponse(res, 200, {
    ...pagination(offset, limit, count),
    outputs,
  });
};

export default (router: Router): Router => {
  router
    .get('/users/:userId/templates/:templateId/outputs', verifyScopes.bind(router, Scope.ListOutputs))
    .post('/users/:userId/templates/:templateId/outputs', verifyScopes.bind(router, Scope.CreateOutput))
    .get('/users/:userId/templates/:templateId/outputs/:outputId', verifyScopes.bind(router, Scope.GetOutput))
    .get('/users/:userId/templates/:templateId/outputs/:outputId/download', verifyScopes.bind(router, Scope.GetOutput))
    .delete('/users/:userId/templates/:templateId/outputs/:outputId', verifyScopes.bind(router, Scope.DeleteOutput))
    .patch(
      '/users/:userId/templates/:templatId/outputs/:outputId/restore',
      verifyScopes.bind(router, Scope.DeleteOutput)
    );

  router.route('/users/:userId/outputs').get(listOutputs);

  router
    .route('/users/:userId/templates/:templateId/outputs')
    .get(listOutputs)
    .post(async (req: Request, res: Response) => {
      const body = req.body;
      const errors = createOutputValidationSchema.validate(body, {
        strip: false,
      });
      if (errors && errors.length > 0) {
        console.error(errors);
        return BadRequest(res, errors);
      }

      const template = await Template.findOne({
        include: [User],
        where: {
          id: req.params.templateId,
          userId: req.params.userId,
        },
      });
      if (!template) {
        return NotFound(res);
      }

      const name = (body.name as string) || template.name;
      const generator = new Generator({ name, template });
      generator.generate(body.variables);

      const output = await new Output(
        {
          name: generator.name,
          contents: generator.output,
          amountReplaced: generator.replaced,
          userId: req.params.userId,
          templateId: req.params.templateId,
        },
        { include: [User, Template] }
      )
        .save()
        .catch(console.error);
      if (!output) {
        return InternalServerError(res);
      }

      WriteResponse(res, 201, { output });
    });

  router
    .route('/users/:userId/templates/:templateId/outputs/:outputId')
    .get(async (req: Request, res: Response) => {
      const output = await Output.findOne({
        where: {
          id: req.params.outputId,
          userId: req.params.userId,
          templateId: req.params.templateId,
        },
        include: [User, Template],
      }).catch(console.error);
      if (!output) {
        return NotFound(res);
      }

      WriteResponse(res, 200, { output });
    })
    .delete(async (req: Request, res: Response) => {
      const user = (req.user as User) || (await User.findByPk(req.params.userId).catch(console.error));
      if (!user) {
        return NotFound(res);
      }

      let where = {
        id: req.params.outputId,
        templateId: req.params.templateId,
      };
      if (!(await user.isAdmin())) {
        where = Object.assign(where, { userId: user.id });
      }

      const output = await Output.findOne({ where }).catch(console.error);
      if (!output) {
        return NotFound(res);
      }

      await output.destroy().catch(console.error);

      WriteResponse(res, 204);
    });

  router
    .route('/users/:userId/templates/:templateId/outputs/:outputId/download')
    .get(async (req: Request, res: Response) => {
      const output = await Output.findOne({
        where: {
          id: req.params.outputId,
          userId: req.params.userId,
          templateId: req.params.templateId,
        },
        include: [User, Template],
      }).catch(console.error);
      if (!output) {
        return NotFound(res);
      }

      const fileName = output.name + (output.name.split('.').length === 1 ? '.txt' : '');
      const savedFilePath = '/tmp/' + randomUUID();

      fs.promises
        .writeFile(savedFilePath, output.contents)
        .then(() => {
          res.status(200).download(savedFilePath, fileName, (err) => {
            if (err) {
              console.error(err);
            }

            if (fs.existsSync(savedFilePath)) {
              fs.unlink(savedFilePath, (err) => {
                if (err) {
                  console.error(err);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.error(err);
          InternalServerError(res);
        });
    });

  router
    .route('/users/:userId/templates/:templateId/outputs/:outputId/restore')
    .patch(async (req: Request, res: Response) => {
      const user = (req.user as User) || (await User.findByPk(req.params.userId).catch(console.error));
      if (!user) {
        return NotFound(res);
      }

      let where = {
        id: req.params.outputId,
        templateId: req.params.templateId,
      };
      if (!(await user.isAdmin())) {
        where = Object.assign(where, { userId: user.id });
      }

      const output = await Output.findOne({
        where,
        paranoid: false,
        include: [User, Template],
      });
      if (!output) {
        return NotFound(res);
      }

      await output.restore().catch(console.error);

      WriteResponse(res, 200, { output });
    });

  return router;
};
