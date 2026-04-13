import type { Database } from "better-sqlite3";
import type { Request, Response } from "express";
import type QueryString from "qs";
import validator from "validator";
import { QueryError } from "../error.ts";

interface QuestionsQuery {
  limit: number;
  offset: number;
  id?: string;
  yearStart?: number;
  yearEnd?: number;
  subjects?: string[];
  q?: string;
}

type BindParams = (string | number)[];

export default function questionsHandler(req: Request, res: Response, db: Database) {
  const query = parseAndValidateQuery(req.query);
  const [sql, bindParams] = buildSql(query);
  const rows = db.prepare(sql).all(bindParams);
  res.json({
    status: "ok",
    data: rows,
  });
}

function parseAndValidateQuery(query: QueryString.ParsedQs): QuestionsQuery {
  const parsedQuery: Partial<QuestionsQuery> = {};

  if (typeof query.limit === "string") {
    if (!validator.isInt(query.limit)) {
      throw new QueryError("limit", "cannot parse query `limit` as integer");
    }
    parsedQuery.limit = +query.limit;
  }
  parsedQuery.limit = Math.min(parsedQuery.limit || 100, 100);

  if (typeof query.offset === "string") {
    if (!validator.isInt(query.offset)) {
      throw new QueryError("offset", "cannot parse query `offset` as integer");
    }
    parsedQuery.offset = +query.offset;
  }
  parsedQuery.offset = parsedQuery.offset || 0;

  if (typeof query.id === "string") parsedQuery.id = query.id;

  if (typeof query.yearStart === "string") {
    if (!validator.isInt(query.yearStart)) {
      throw new QueryError("yearStart", "cannot parse query `yearStart` as integer");
    }
    parsedQuery.yearStart = +query.yearStart;
  }

  if (typeof query.yearEnd === "string") {
    if (!validator.isInt(query.yearEnd)) {
      throw new QueryError("yearEnd", "cannot parse query `yearEnd` as integer");
    }
    parsedQuery.yearEnd = +query.yearEnd;
  }

  if (typeof query.subjects === "string") {
    parsedQuery.subjects = query.subjects.split(",");
  }

  if (typeof query.q === "string") {
    parsedQuery.q = query.q.replaceAll("+", " ");
  }

  return parsedQuery as QuestionsQuery;
}

function buildSql(query: QuestionsQuery): [string, BindParams] {
  const conditions = [];
  const bindParameters = [];

  if (query.subjects) {
    conditions.push(`subject IN (${new Array(query.subjects.length).fill("?").join(",")})`);
    for (const s of query.subjects) {
      bindParameters.push(s);
    }
  }

  if (query.yearStart) {
    conditions.push("year >= ?");
    bindParameters.push(query.yearStart);
  }

  if (query.yearEnd) {
    conditions.push("year <= ?");
    bindParameters.push(query.yearEnd);
  }

  if (query.id) {
    conditions.push("id = ?");
    bindParameters.push(query.id);
  }

  if (query.q) {
    conditions.push(
      `instr(question_text, ?) > 0 OR instr(short_answer, ?) > 0 OR instr(long_answer_text, ?) > 0`,
    );
    for (let i = 0; i < 3; i++) {
      bindParameters.push(query.q);
    }
  }

  let sql = "SELECT * FROM questions";
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  sql += " ORDER BY id LIMIT ? OFFSET ?";
  bindParameters.push(query.limit);
  bindParameters.push(query.offset);

  return [sql, bindParameters];
}
