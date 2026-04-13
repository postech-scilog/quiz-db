import type { Database } from "better-sqlite3";
import type { Request, Response } from "express";
import mime from "mime-types";
import { NotFoundError, PathError } from "../error.ts";
import type { AssetsTableRow } from "../types.ts";

export default function assetHandler(req: Request, res: Response, db: Database) {
  const assetName = req.params.assetName as string;
  if (assetName.length === 0) {
    throw new PathError("assetName", "assetName is missing");
  }

  const row = db.prepare("SELECT data FROM assets WHERE name = ?").get(req.params.assetName) as
    | AssetsTableRow
    | undefined;
  if (!row) throw new NotFoundError();
  res.set("Content-Type", mime.lookup(assetName) || "application/octet-stream");
  res.send(row.data);
}
