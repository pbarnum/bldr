import { Handler, NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import { Configs } from '../domain/Configs';
import { BadRequest, Forbidden, InternalServerError, Unauthorized } from '../domain/Response';
import User from '../models/user';

export const JwtAudience = 'bldr-fe';
export const JwtIssuer = 'bldr-be';
export const JwtAlgorithm = 'RS256';

const getUserFromAuthPayload = async (
  req: Request,
  payload: JwtPayload,
  done: (err: unknown, user?: unknown, info?: unknown) => void
) => {
  try {
    const user = await User.findByPk(payload.sub).catch(console.error);
    if (user) {
      return done(null, user);
    }

    return done(null, false);
  } catch (err) {
    console.error(err);
    return done(err, false);
  }
};

const testUserId = (req: Request) => {
  return (
    (req.user && (req.user as User).isAdmin()) ||
    req.params.userId === undefined ||
    (req.user as User).id === req.params.userId
  );
};

const testScope = async (req: Request, requiredScope: string) => {
  if (requiredScope) {
    const scopes = (await (req.user as User).getScopes()).map((s) => s.name);
    return scopes.includes(requiredScope);
  }

  return false;
};

const testRequestForScope = (req: Request, requiredScope: string) => testUserId(req) && testScope(req, requiredScope);

export const initialize = (configs: Configs) => {
  const params = {
    secretOrKey: configs.jwt.privateKey,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    algorithms: [JwtAlgorithm],
    issuer: JwtIssuer,
    audience: JwtAudience,
    passReqToCallback: true,
  };

  const strategy = new passportJWT.Strategy(params, getUserFromAuthPayload);
  passport.use(strategy);

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user: User, done) => done(null, user));

  return passport.initialize();
};

export const authenticate = (configs: Configs): Handler =>
  passport.authenticate('jwt', {
    session: configs.jwt.session,
    failWithError: true,
  });
// passport.authenticate(
//   "jwt",
//   {
//     session: configs.jwt.session,
//     failWithError: true,
//     passReqToCallback: true,
//   },
//   console.error
// );

export const verifyScopes = async (requiredScope: string, req: Request, res: Response, next: NextFunction) => {
  return (await testRequestForScope(req, requiredScope)) ? next() : Unauthorized(res);
};

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error(err);
  }

  if (res.headersSent) {
    return next(err);
  }

  switch (res.statusCode) {
    case 400:
      return BadRequest(res, []);
    case 401:
      return Unauthorized(res);
    case 403:
      return Forbidden(res);
    case 500:
      return InternalServerError(res);
    default:
      return next(err);
  }
};
