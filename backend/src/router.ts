import Database, { type Database as DatabaseType } from "better-sqlite3";
import { Router } from "express";
import { NotFoundError } from "./error.ts";
import assetHandler from "./handlers/assetHandler.ts";
import questionsHandler from "./handlers/questionsHandler.ts";

const router = Router();

router.get("/assets/:assetName", (req, res) => {
  withDB((db) => assetHandler(req, res, db));
});

router.get("/questions", (req, res) => {
  withDB((db) => questionsHandler(req, res, db));
});

router.use((_req, _res) => {
  throw new NotFoundError();
});

function withDB(cb: (db: DatabaseType) => void) {
  const db = new Database("./questions.db", { readonly: true });
  try {
    cb(db);
  } finally {
    db.close();
  }
}

export default router;
