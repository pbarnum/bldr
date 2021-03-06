import { Request, Response, Router } from 'express';
import { Configs } from '../domain/Configs';
import Database from '../domain/Database';

export default (router: Router, configs: Configs, db: Database): Router => {
  router.route('/health').get((req: Request, res: Response) => {
    res.status(200).json();
  });

  router.route('/ready').get(async (req: Request, res: Response) => {
    res.status(200).json({
      api: {
        name: configs.app.name,
        connected: true,
      },
      db: {
        connected: await db.connected(),
      },
    });
  });

  return router;
};
