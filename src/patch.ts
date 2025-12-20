import assert from "node:assert";
import { Operation, UnknownObject } from "./types/dto";
import { assertNever } from "./assert";


export function applyOpsInPlace(obj: UnknownObject, ops: Operation[]) {
  for (const op of ops || []) {
    const path = op.path || "".trim();
    if (!path) continue;

    if (op.op === "set") {
        setByPath(obj, path, op.value);
        return;
    };

    if (op.op === "unset") {
        unsetByPath(obj, path);
        return;
    }

    if (op.op === "push") {
        pushByPath(obj, path, op.value);
        return;
    }

    if (op.op === "inc") {
        incByPath(obj, path, op.value);
        return;
    }

    assertNever(op.op);
  }
}


function setByPath(obj: UnknownObject, path: string, value: unknown) {
  const parts = path.split(".");  
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      assert.ok(k);

      cur[k] ??= {}; 

      const nextPart = cur[k];
      assert(nextPart && typeof nextPart === 'object');
      cur = cur[k] as UnknownObject;
  }
    
  const lastPart = parts.at(-1);
  assert.ok(lastPart);

  cur[lastPart] = value;
}

function unsetByPath(obj: UnknownObject, path: string) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur == null) return;
    assert(k);
    cur = cur[k] as UnknownObject;
    }
    
    const lastPart = parts.at(-1);
    assert(lastPart);
  if (cur) delete cur[lastPart];
}

function pushByPath(obj: UnknownObject, path: string, value: unknown) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    assert(k);
    cur[k] ??= {};
    cur = cur[k] as UnknownObject;
  }
  const last = parts.at(-1);
  assert(last);
  if (!Array.isArray(cur[last])) cur[last] = [];
  assert(Array.isArray(cur[last]));  
  cur[last].push(value);
}

function incByPath(obj: UnknownObject, path: string, value: unknown) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    assert(k);  
    cur[k] ??= {};
    cur = cur[k] as UnknownObject;
  }
  const last = parts.at(-1);
  assert(last);
  cur[last] =
    (typeof cur[last] === "number" ? cur[last] : 0) + (Number(value) || 0);
}
