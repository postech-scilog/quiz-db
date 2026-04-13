import type { JSONSerializable } from "./types.ts";

export class UserError extends Error {
  code: number;
  details?: JSONSerializable;

  constructor(message: string, details?: JSONSerializable) {
    super(message);
    this.name = "UserError";
    this.code = 500;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      details: this.details,
    };
  }
}

export class QueryError extends UserError {
  constructor(field: string, message: string) {
    super(`Query parameter '${field}' is not valid`, { field, message });
    this.name = "QueryError";
    this.code = 400;
  }
}

export class PathError extends UserError {
  constructor(field: string, message: string) {
    super(`Path parameter ${field} is not valid`, { field, message });
    this.name = "PathError";
    this.code = 400;
  }
}

export class NotFoundError extends UserError {
  constructor() {
    super("Resource not found");
    this.code = 404;
  }
}
