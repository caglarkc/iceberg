#!/usr/bin/env tsx
import { createDatabase } from "./db.js";
import { seedDatabase } from "./seed.js";

const db = createDatabase();
seedDatabase(db);
console.log("Seed complete.");
db.close();
