import "server-only";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/tagify";

const globalForMongo = globalThis as typeof globalThis & { _mongoClient?: MongoClient };

export const mongoClient = globalForMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") globalForMongo._mongoClient = mongoClient;

export const db = mongoClient.db();
