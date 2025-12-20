import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  entities,
  deals,
  addNote,
  listNotes,
  touch,
  createDeal,
} from "./db";
import { applyOpsInPlace } from "./patch";
import { BaseEntity, Company, Deal, DealId, EntityId, Person, PersonId, PrefixedId } from "./types/model";
import assert from "node:assert";
import { Operation, UnknownObject } from "./types/dto";
import { assertNever } from "./assert";

const app = express();
app.use(express.json());

type SearchResult = {
    name: BaseEntity["name"],
    hint: string
} & (
    | Pick<Company, "id" | "kind">
    | Pick<Person, "id" | "kind">
    | Pick<Deal, "id" | "kind">
    )

// {
//     id: e.id,
//     kind: e.kind, // "person" | "company"
//     name: e.name,
//     hint:
//       e.kind === "company"
//         ? (e.domain ?? "no-domain")
//         : (e.email ?? "no-email"),
//   }

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/", express.static(path.join(__dirname, "../dist/public/public")));

app.get("/api/search", (req, res) => {
  const q = String(req.query.q ?? "")
    .toLowerCase()
    .trim();

  const result = [] as SearchResult[];

  for (const e of entities.values()) {
    if (!q || String(e.name).toLowerCase().includes(q)) {
        const { kind, id, name } = e;
        if (kind === 'company') {
            result.push({
                id,
                kind,
                name,
                hint: e.domain ?? "no-domain"
              });
        } else if (kind === 'person') {
            result.push({
                id,
                kind,
                name,
                hint: e.email ?? "no-email",
              });
        } else {
            assertNever(kind);
      }
      
    }
  }

  for (const d of deals.values()) {
    if (!q || d.title.toLowerCase().includes(q)) {
      result.push({
        id: d.id,
        kind: "deal",
        name: d.title,
        hint: `${d.stage} • $${d.amount}`,
      });
    }
  }

  result.sort((a, b) => String(a.name).localeCompare(String(b.name)));

  res.json({ query: q, result });
});

app.get("/api/entity/:id", (req, res) => {
  const id = req.params.id as EntityId;
  const e = entities.get(id);
  if (!e) return res.status(404).json({ error: "Entity not found" });
  return res.json({ id, result: e });
});

app.get("/api/deal/:id", (req, res) => {
  const id = req.params.id as DealId;
  const d = deals.get(id);
  if (!d) return res.status(404).json({ error: "Deal not found" });
  return res.json({ id, result: d });
});

app.get("/api/deals", (req, res) => {
  const ownerId = req.query.ownerId;
  const result = [];
  for (const d of deals.values()) {
    if (ownerId == null || d.ownerId == ownerId) result.push(d);
  }
  res.json({ ownerId, result });
});

app.post("/api/deal", (req, res) => {
  const body = req.body || {};
  const deal = createDeal({
    title: body.title,
    amount: body.amount,
    ownerId: body.ownerId,
    contactIds: body.contactIds,
  });
  res.json({ body, result: deal });
});

app.patch("/api/entity/:id", (req, res) => {
  const id = req.params.id as EntityId;
  const entity = entities.get(id);
  if (!entity) return res.status(404).json({ error: "Entity not found" });

  const body = req.body || {};

  if (body.meta?.snapshot) {
    Object.assign(entity, body.meta.snapshot);
    }
    // TODO проверка типов
  applyOpsInPlace(entity as UnknownObject, body.ops as Operation[]);

  touch(entity);

  res.json({ id, body, result: entity });
});

app.patch("/api/deal/:id", (req, res) => {
  const id = req.params.id as DealId;
  const deal = deals.get(id);
  if (!deal) return res.status(404).json({ error: "Deal not found" });

  const body = req.body || {};
  applyOpsInPlace(deal, body.ops);

  if (body.meta?.snapshot) {
    Object.assign(deal, body.meta.snapshot);
  }

  touch(deal);

  res.json({ id, body, result: deal });
});

app.get("/api/notes", (req, res) => {
  const subjectKind = String(req.query.subjectKind ?? "");
  const subjectId = req.query.subjectId; // string
  assert(typeof subjectId === 'string');  
    
  res.json({
    subjectKind,
    subjectId,
    result: listNotes(subjectKind, subjectId),
  });
});

app.post("/api/note", (req, res) => {
  const body = req.body || {};
  const note = addNote(body.subjectKind, body.subjectId, body.text);
  res.json({ body, result: note });
});

app.listen(3000, () => console.log("http://localhost:3000"));
