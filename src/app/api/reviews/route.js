/**
 * @fileoverview Property review management API.
 * Handles fetching and creating reviews for properties.
 * Both endpoints are public (no authentication required).
 * 
 * @module api/reviews
 * @requires mongodb
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

/**
 * Connects to the MongoDB database.
 * Creates a new connection for each request.
 * 
 * @private
 * @async
 * @returns {Promise<MongoClient>} Connected MongoDB client
 * @throws {Error} If MONGODB_URI is not defined
 */
async function connectToDatabase() {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

/**
 * GET /api/reviews
 * Fetches all reviews for a specific property.
 * Returns reviews sorted by creation date (newest first).
 * 
 * @async
 * @param {Request} request - The Next.js request object
 * @returns {Promise<Response>} JSON response with array of reviews
 * @example
 * // Query parameters:
 * // - propertyId: string (required) - The property ID to get reviews for
 */
export async function GET(request) {
  let client;

  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return Response.json(
        { success: false, message: 'Property ID required' },
        { status: 400 }
      );
    }

    client = await connectToDatabase();
    const db = client.db("bashachai");

    const reviews = await db.collection("reviews")
      .find({ propertyId })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(
      { success: true, data: reviews },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

/**
 * POST /api/reviews
 * Creates a new review for a property.
 * Validates rating is between 1-5 and all required fields are present.
 * 
 * @async
 * @param {Request} request - The Next.js request object with JSON body
 * @returns {Promise<Response>} JSON response with created review data
 * @example
 * // Request body:
 * // {
 * //   propertyId: string (required),
 * //   rating: number (required, 1-5),
 * //   comment: string (required),
 * //   userName: string (required),
 * //   userEmail: string (required)
 * // }
 */
export async function POST(request) {
  let client;

  try {
    const body = await request.json();
    const { propertyId, rating, comment, userName, userEmail } = body;

    // Validation
    if (!propertyId || !rating || !comment || !userName || !userEmail) {
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return Response.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    client = await connectToDatabase();
    const db = client.db("bashachai");

    const review = {
      propertyId,
      rating: parseInt(rating),
      comment: comment.trim(),
      userName,
      userEmail,
      createdAt: new Date()
    };

    const result = await db.collection("reviews").insertOne(review);

    return Response.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          ...review
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Error creating review:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
