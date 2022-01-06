import { Request, Response, Router } from "express";
import Schema from "validate";
import { Configs } from "../domain/Configs";
import { BadRequest, Forbidden, Unauthorized } from "../domain/Response";
import User from "../models/user";
import UserLock from "../models/userlock";
import * as jwt from "jsonwebtoken";
import { JwtAlgorithm, JwtIssuer, JwtAudience } from "../middlewares/auth";

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

const generateToken = async (pk: string, user: User): Promise<string> => {
  const scopes = await user.getScopes().catch(console.error);
  if (!scopes) {
    return "";
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

export default (router: Router, configs: Configs): Router => {
  router.route("/login").post(async (req: Request, res: Response) => {
    const body = req.body;
    const errors = loginValidationSchema.validate(body);
    if (errors && errors.length > 0) {
      console.error(errors);
      return BadRequest(res, errors);
    }

    // Check if user has been locked out
    const locked = await UserLock.findOne({
      where: { "$user.email$": body.email },
      include: [User],
    }).catch(console.error);
    if (locked) {
      return Forbidden(res);
    }

    const user = await User.scope("withPassword")
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
      }

      return Unauthorized(res);
    }

    // User is good, generate JWTs
    const token = await generateToken(configs.jwt.privateKey, user);
    if (token === "") {
      Unauthorized(res);
      return;
    }

    res.status(200).json({ user, token });
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
