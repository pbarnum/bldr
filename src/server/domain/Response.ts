import { Response } from "express";
import { ValidationError } from "validate";

export enum ErrorType {
  BadRequest = "Bad Request",
  Unauthorized = "Unauthorized",
  Forbidden = "Forbidden",
  NotFound = "Not Found",
  MethodNotAllowed = "Method Not Allowed",
  InternalServerError = "Internal Server Error",
}

interface code {
  code: number;
}

type errorMapping = {
  [key in ErrorType]: code;
};

const errMapping: errorMapping = {
  [ErrorType.BadRequest]: {
    code: 400,
  },
  [ErrorType.Unauthorized]: {
    code: 401,
  },
  [ErrorType.Forbidden]: {
    code: 403,
  },
  [ErrorType.NotFound]: {
    code: 404,
  },
  [ErrorType.MethodNotAllowed]: {
    code: 405,
  },
  [ErrorType.InternalServerError]: {
    code: 500,
  },
};

export interface ResponseError {
  type: ErrorType;
  message: string;
  data?: unknown;
}

export function BadRequest(res: Response, errs: ValidationError[]): void {
  WriteErrorResponse(res, {
    type: ErrorType.BadRequest,
    message:
      "The request was malformed and could not be processed at this time",
    data: errs.reduce((prev, curr) => {
      return Object.assign(prev, {
        [curr.path]: "invalid (todo: broken validator messaging",
      });
    }, {}),
  });
}

export function Unauthorized(res: Response): void {
  WriteErrorResponse(res, {
    type: ErrorType.Unauthorized,
    message: "The request requires user authentication",
  });
}

export function Forbidden(res: Response): void {
  WriteErrorResponse(res, {
    type: ErrorType.Forbidden,
    message: "The server understood the request, but is refusing to fulfill it",
  });
}

export function NotFound(res: Response): void {
  WriteErrorResponse(res, {
    type: ErrorType.NotFound,
    message: "The server has not found anything matching the Request-URI",
  });
}

export function MethodNotAllowed(res: Response): void {
  WriteErrorResponse(res, {
    type: ErrorType.MethodNotAllowed,
    message:
      "The method specified in the Request-Line is not allowed for the resource identified by the Request-URI",
  });
}

export function InternalServerError(res: Response): void {
  WriteErrorResponse(res, {
    type: ErrorType.InternalServerError,
    message:
      "The server encountered an unexpected condition which prevented it from fulfilling the request",
  });
}

export function WriteErrorResponse(res: Response, err: ResponseError): void {
  let code = 500;
  if (errMapping[err.type]) {
    code = errMapping[err.type].code;
  }
  WriteResponse(res, code, err);
}

export function WriteResponse(
  res: Response,
  code: number,
  data?: unknown
): void {
  if (data) {
    res.status(code).json(data);
    return;
  }
  res.status(code).send();
}
