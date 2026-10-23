// node scripts/import-api.mjs [../apelora-fabric]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { importApi } from "./lib/import-api.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
console.log(`Imported ${importApi(root, resolve(process.argv[2] ?? "../apelora-fabric"))} API groups.`);
