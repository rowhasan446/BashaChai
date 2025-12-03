/**
 * @fileoverview MongoDB connection setup for the BashaChai application.
 * This file handles the database connection with different strategies for development and production.
 * In development, we reuse the connection to avoid creating too many connections during hot reloads.
 * In production, we create a fresh connection each time.
 * 
 * @module lib/mongodb
 * @requires mongodb
 */

import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  // In dev, use a global variable so the client is reused on hot reload
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, { tls: true })
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, always create a new client
  client = new MongoClient(uri, { tls: true })
  clientPromise = client.connect()
}

/**
 * MongoDB client promise that resolves to a connected MongoClient instance.
 * This is used throughout the app to access the database.
 * 
 * @type {Promise<MongoClient>}
 * @example
 * // Using the client to access a collection
 * const client = await clientPromise;
 * const db = client.db('BASHACHAI');
 * const users = await db.collection('user').find({}).toArray();
 */
export default clientPromise

