import { randomUUID } from 'crypto';
import { Request, Response, Router } from 'express';
import Schema from 'validate';
import Email from '../domain/Email';
import { BadRequest, Forbidden, InternalServerError, NotFound, WriteResponse } from '../domain/Response';
import { verifyScopes } from '../middlewares/auth';
import Role from '../models/role';
import Scope from '../models/scope';
import User from '../models/user';
import pagination from './pagination';
import { Pagination } from './queryParams';

const newUserInviteValidationSchema = new Schema({
  email: {
    type: String,
    required: true,
    // TODO: Test email?
  },
  firstName: {
    type: String,
    match: /^[a-zA-Z]+$/,
    size: { min: 1, max: 32 },
    message: 'must be an alpha string',
  },
  lastName: {
    type: String,
    match: /^[a-zA-Z]+$/,
    size: { min: 1, max: 32 },
    message: 'must be an alpha string',
  },
});

const updateUserValidationSchema = new Schema({
  firstName: {
    type: String,
    match: /^[a-zA-Z]+$/,
    size: { min: 1, max: 32 },
    message: 'must be an alpha string',
  },
  lastName: {
    type: String,
    match: /^[a-zA-Z]+$/,
    size: { min: 1, max: 32 },
    message: 'must be an alpha string',
  },
  email: {
    type: String,
    required: true,
    // TODO: Test email?
  },
  roles: [
    {
      id: {
        type: String,
        required: true,
        match: /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/,
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],
});

export default (router: Router, emailer: Email): Router => {
  router
    .get('/users', verifyScopes.bind(router, Scope.ListUsers))
    .post('/users', verifyScopes.bind(router, Scope.CreateUser))
    .get('/users/:userId', verifyScopes.bind(router, Scope.GetUser))
    .put('/users/:userId', verifyScopes.bind(router, Scope.UpdateUser))
    .delete('/users/:userId', verifyScopes.bind(router, Scope.DeleteUser))
    .patch('/users/:userId/restore', verifyScopes.bind(router, Scope.DeleteUser));

  router
    .route('/users')
    .get(async (req: Request<unknown, unknown, unknown, Pagination>, res: Response) => {
      let page = req.query['page'];
      if (isNaN(page) || page <= 0) {
        page = 1;
      }

      let limit = req.query['limit'];
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
        include: [Role],
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
    })
    .post(async (req: Request, res: Response) => {
      const self = req.user as User;
      if (!self) {
        console.error('CreateUser: failed to get logged in user', req.user);
      }

      const body = req.body;
      const errors = newUserInviteValidationSchema.validate(body);
      if (errors && errors.length > 0) {
        console.error(errors);
        return BadRequest(res, errors);
      }

      const verifyToken = randomUUID();
      const user = new User(body);
      user.verifyToken = verifyToken;
      user.resetToken = randomUUID();

      const savedUser = await user.save().catch(console.error);
      if (!savedUser) {
        return InternalServerError(res);
      }

      const guestRole = await Role.findOne({ where: { name: Role.Guest } }).catch(console.error);
      if (!guestRole) {
        return InternalServerError(res);
      }

      await user.addRole(guestRole).catch(console.error);

      emailer.invite(body.email, self.name || 'our community', savedUser.name, verifyToken);

      WriteResponse(res, 201, { user });
    });

  router
    .route('/users/:userId')
    .get(async (req: Request, res: Response) => {
      const user = await User.findByPk(req.params.userId, { include: [Role] }).catch(console.error);
      if (!user) {
        return NotFound(res);
      }

      WriteResponse(res, 200, { user });
    })
    .patch(async (req: Request, res: Response) => {
      const body = req.body;
      const errors = updateUserValidationSchema.validate(body);
      if (errors && errors.length > 0) {
        console.error(errors);
        return BadRequest(res, errors);
      }

      const user = await User.findByPk(req.params.userId, { include: [Role] });
      if (!user) {
        return NotFound(res);
      }

      if (user.verifiedAt === null && body.roles.filter((r: Role) => r.name !== Role.Guest)) {
        return Forbidden(res);
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

      await updated.mergeRoles(body.roles);

      let updatedWithRoles = await User.findByPk(req.params.userId, { include: [Role] });
      if (!updatedWithRoles) {
        updatedWithRoles = updated;
      }

      WriteResponse(res, 200, { user: updatedWithRoles });
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

  router.route('/users/:userId/restore').patch(async (req: Request, res: Response) => {
    const user = await User.findByPk(req.params.userId, { include: [Role], paranoid: false }).catch(console.error);
    if (!user) {
      return NotFound(res);
    }

    await user.restore().catch(console.error);

    WriteResponse(res, 200, { user });
  });

  return router;
};
