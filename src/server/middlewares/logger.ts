import { Handler, NextFunction, Request, Response } from 'express';
import { Configs } from '../domain/Configs';

export default (configs: Configs): Handler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (configs.log.level === 'debug') {
      console.clear();
      const date: Date = new Date();
      console.table([
        {
          date: `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`,
          method: req.method,
          url: `${req.baseUrl}${req.url}`,
          body: req.body,
        },
      ]);
    }
    next();
  };
};
