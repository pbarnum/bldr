import { randomUUID } from 'crypto';
import { Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import Schema, { ValidationError } from 'validate';
import { Configs } from '../domain/Configs';
import Email from '../domain/Email';
import { BadRequest, Forbidden, InternalServerError, NotFound, Unauthorized, WriteResponse } from '../domain/Response';
import { JwtAlgorithm, JwtAudience, JwtIssuer } from '../middlewares/auth';
import Role from '../models/role';
import User from '../models/user';
import UserLock from '../models/userlock';
import { Verify as VerifyQP } from './queryParams';

const loginValidationSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const resetPasswordValidationSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

const passwordResetValidationSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
});

const generateToken = async (pk: string, user: User): Promise<string> => {
  const scopes = await user.getScopes().catch(console.error);
  if (!scopes) {
    return '';
  }

  const payload = {
    scp: scopes.map((s) => s.name),
  };

  return jwt.sign(payload, pk, {
    expiresIn: 3600, // 1 hour
    audience: JwtAudience,
    subject: user.id,
    issuer: JwtIssuer,
    algorithm: JwtAlgorithm,
  });
};

export default (router: Router, configs: Configs, emailer: Email): Router => {
  router.route('/login').post(async (req: Request, res: Response) => {
    const body = req.body;
    const errors = loginValidationSchema.validate(body);
    if (errors && errors.length > 0) {
      console.error(errors);
      return BadRequest(res, errors);
    }

    // Check if user has been locked out
    const locked = await UserLock.findOne({
      where: { '$user.email$': body.email },
      include: [User],
    }).catch(console.error);
    if (locked) {
      return Forbidden(res);
    }

    const user = await User.scope('withPassword')
      .findOne({
        where: {
          email: body.email,
        },
      })
      .catch(console.error);
    if (!user) {
      return Unauthorized(res);
    }

    if (!user.comparePassword(body.password)) {
      // Increment loginAttempts by 1 and lock account if over threashold
      user.increment({ loginAttempts: 1 });
      if (++user.loginAttempts > 10) {
        await new UserLock({ userId: user.id }).save().catch(console.error);
        emailer.lockedAccount(user.email);
      }

      return Unauthorized(res);
    }

    // User is good, generate JWTs
    const token = await generateToken(configs.jwt.privateKey, user);
    if (token === '') {
      Unauthorized(res);
      return;
    }

    user.loginAttempts = 0;
    user.resetToken = null;
    user.save();

    res.status(200).json({ user, token });
  });

  router.route('/reset').post(async (req: Request, res: Response) => {
    const body = req.body;
    const errors = resetPasswordValidationSchema.validate(body);
    if (errors && errors.length > 0) {
      console.error(errors);
      return BadRequest(res, errors);
    }

    const user = await User.findOne({
      where: {
        email: body.email,
      },
    }).catch(console.error);
    if (!user) {
      return res.status(200).json({ message: 'A message has been sent to your email' });
    }

    user.resetToken = randomUUID();
    user.save();

    emailer.resetPassword(user.email, user.resetToken);

    res.status(200).json({ message: 'A message has been sent to your email' });
  });

  router.route('/passwordreset').post(async (req: Request, res: Response) => {
    const body = req.body;
    const errors = passwordResetValidationSchema.validate(body);
    if (errors && errors.length > 0) {
      console.error(errors);
      return BadRequest(res, errors);
    }

    if (body.password !== body.confirmPassword) {
      return BadRequest(res, [new ValidationError('Password and Password Confirmation do not match', '')]);
    }

    const user = await User.findOne({
      where: {
        email: body.email,
        resetToken: body.token,
      },
    }).catch(console.error);
    if (!user) {
      return Unauthorized(res);
    }

    // Check if user has been locked out
    await UserLock.destroy({ where: { userId: user.id } }).catch(console.error);

    user.password = body.password;
    user.loginAttempts = 0;
    user.resetToken = null;
    await user.save().catch(console.error);

    res.status(200).json({ message: 'Your new password has been saved' });
  });

  router.route('/verify').get(async (req: Request<unknown, unknown, unknown, VerifyQP>, res: Response) => {
    console.log(req.query['token'], req.query['email']);
    const user = await User.findOne({
      where: {
        verifyToken: req.query['token'],
        email: req.query['email'],
      },
    }).catch(console.error);
    if (!user) {
      return Unauthorized(res);
    }

    // Check if user has been locked out
    user.verifiedAt = new Date();
    user.verifyToken = null;
    const updatedUser = await user.save().catch(console.error);

    const userRole = await Role.findOne({ where: { name: Role.User } }).catch(console.error);
    if (!userRole) {
      return InternalServerError(res);
    }

    await user.mergeRoles([userRole]).catch(console.error);

    WriteResponse(res, 200, { user: updatedUser });
  });

  router.route('/roles').get(async (req: Request, res: Response) => {
    const roles = await Role.findAll().catch(console.error);
    if (!roles) {
      return NotFound(res);
    }

    WriteResponse(res, 200, { roles });
  });

  // router
  //   .get("/logout", authenticate(configs))
  //   .route("/logout")
  //   .get(async (req: Request, res: Response) => {
  //     if (!req.user) {
  //       Forbidden(res);
  //       return;
  //     }

  //     await Token.destroy({ where: { userId: (req.user as User).id } }).catch(
  //       console.error
  //     );
  //     res.status(204).json();
  //   });

  return router;
};
