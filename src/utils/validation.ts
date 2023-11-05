import { validationResult, ValidationChain } from 'express-validator';
import { NextFunction, Request, Response } from 'express'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
import { EntityError, ErrorWithStatus } from '~/models/Error';
import HTTP_STATUS from '~/constants/httpStatus';

export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req);
    const errors = validationResult(req);
    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorObject) {
      const { msg } = errorObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorObject[key]
    }
    if (errors.isEmpty()) {
      return next();
    }
    next(entityError)
  };
};
