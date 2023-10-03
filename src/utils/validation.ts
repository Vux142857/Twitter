import { validationResult, ValidationChain } from 'express-validator';
import { NextFunction, Request, Response } from 'express'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
import ErrorWithStatus from '~/models/Errors';
import httpStatus from '~/constants/httpStatus';

export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req);
    const errors = validationResult(req);
    const errorObject = errors.mapped()

    console.log(errorObject['type']);
    for (const key in errorObject) {
      const { msg } = errorObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
    }
    if (errors.isEmpty()) {
      return next();
    }
    res.status(422).json({ errors: errorObject });
  };
};
