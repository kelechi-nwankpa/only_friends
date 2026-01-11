import type { RequestHandler } from 'express';
import { type ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Middleware factory for request validation using Zod schemas
 */
export function validate(schemas: ValidationSchemas): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(new AppError(
          'VALIDATION_ERROR',
          'Invalid request data',
          400,
          { errors: formattedErrors }
        ));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate only request body
 */
export function validateBody(schema: ZodSchema): RequestHandler {
  return validate({ body: schema });
}

/**
 * Validate only query parameters
 */
export function validateQuery(schema: ZodSchema): RequestHandler {
  return validate({ query: schema });
}

/**
 * Validate only route parameters
 */
export function validateParams(schema: ZodSchema): RequestHandler {
  return validate({ params: schema });
}
