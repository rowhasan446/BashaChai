/**
 * @fileoverview Property management API endpoints.
 * Handles creating and fetching properties with image uploads to Cloudinary.
 * POST requires authentication, GET is public.
 * 
 * @module api/properties
 * @requires next/server
 * @requires lib/mongodb
 * @requires cloudinary
 * @requires lib/auth
 */

import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { v2 as cloudinary } from 'cloudinary';
import { verifyApiToken, requireRole, createAuthError, checkRateLimit } from '../../../../lib/auth';

// Validate environment variables
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error('Missing required Cloudinary environment variables');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a single image file to Cloudinary.
 * Validates file type and size before uploading.
 * 
 * @private
 * @async
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID (used in the filename)
 * @returns {Promise<Object>} Object containing the image URL and public ID
 * @returns {string} return.url - The secure URL of the uploaded image
 * @returns {string} return.publicId - The Cloudinary public ID for later deletion
 * @throws {Error} If file is not an image or exceeds 10MB
 */
async function uploadImageToCloudinary(file, userId) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error(`File ${file.name} is not an image`);
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`File ${file.name} exceeds 10MB limit`);
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Cloudinary
  const uploadResponse = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'image',
          folder: 'BASHACHAI_properties',
          public_id: `property_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          transformation: [
            { width: 1200, height: 800, crop: 'fill' },
            { quality: 'auto' },
            { format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      )
      .end(buffer);
  });

  return {
    url: uploadResponse.secure_url,
    publicId: uploadResponse.public_id,
  };
}

/**
 * POST /api/properties
 * Creates a new property listing with multiple image uploads.
 * Requires authentication. Users can only create properties for themselves.
 * 
 * @async
 * @param {Request} request - The Next.js request object with FormData
 * @returns {Promise<NextResponse>} JSON response with created property data
 * @example
 * // Request body (FormData):
 * // - title: string (required)
 * // - location: string (required)
 * // - price: string (required)
 * // - beds: number
 * // - baths: number
 * // - description: string (required)
 * // - category: string
 * // - type: string
 * // - size: string
 * // - images: File[] (max 10 images, each max 10MB)
 */
export async function POST(request) {
  let user = null;

  try {
    checkRateLimit(request);
    user = await verifyApiToken(request);
  } catch (authError) {
    console.error('❌ Authentication error in POST /api/properties:', authError.message);
    return createAuthError(authError.message, 401);
  }

  try {
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get('title');
    const location = formData.get('location');
    const price = formData.get('price');
    const beds = formData.get('beds');
    const baths = formData.get('baths');
    const description = formData.get('description');
    const category = formData.get('category');
    const type = formData.get('type');
    const size = formData.get('size');

    // Get all images using getAll()
    const imageFiles = formData.getAll('images');

    console.log('🔍 POST /api/properties - User:', user.email);
    console.log('🖼️ Number of images:', imageFiles.length);

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return NextResponse.json({
        success: false,
        message: "Valid title is required"
      }, { status: 400 });
    }

    if (!location || typeof location !== 'string' || location.trim().length < 1) {
      return NextResponse.json({
        success: false,
        message: "Valid location is required"
      }, { status: 400 });
    }

    if (!price) {
      return NextResponse.json({
        success: false,
        message: "Price is required"
      }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim().length < 1) {
      return NextResponse.json({
        success: false,
        message: "Valid description is required"
      }, { status: 400 });
    }

    // Arrays to store multiple image URLs and public IDs
    let imageUrls = [];
    let imagePublicIds = [];

    // Upload multiple images to Cloudinary
    if (imageFiles && imageFiles.length > 0) {
      // Filter out empty files
      const validImageFiles = imageFiles.filter(file => file && file.size > 0);

      if (validImageFiles.length > 0) {
        // Limit number of images (max 10 images)
        const maxImages = 10;
        if (validImageFiles.length > maxImages) {
          return NextResponse.json({
            success: false,
            message: `Maximum ${maxImages} images allowed`
          }, { status: 400 });
        }

        try {
          console.log(`📤 Uploading ${validImageFiles.length} images to Cloudinary...`);

          // Use Promise.all to upload all images concurrently
          const uploadPromises = validImageFiles.map(file =>
            uploadImageToCloudinary(file, user.userId)
          );

          const uploadResults = await Promise.all(uploadPromises);

          // Extract URLs and public IDs
          imageUrls = uploadResults.map(result => result.url);
          imagePublicIds = uploadResults.map(result => result.publicId);

          console.log(`✅ Successfully uploaded ${imageUrls.length} images`);

        } catch (uploadError) {
          console.error('❌ Error uploading images:', uploadError);

          // If any upload fails, try to clean up already uploaded images
          if (imagePublicIds.length > 0) {
            console.log('🧹 Cleaning up uploaded images...');
            try {
              await Promise.all(
                imagePublicIds.map(publicId =>
                  cloudinary.uploader.destroy(publicId)
                )
              );
            } catch (cleanupError) {
              console.error('❌ Error cleaning up images:', cleanupError);
            }
          }

          return NextResponse.json({
            success: false,
            message: 'Failed to upload images',
            error: uploadError.message
          }, { status: 500 });
        }
      }
    }

    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");

    // Property document with arrays for images
    const propertyDoc = {
      title: title.trim(),
      location: location.trim(),
      price: price,
      beds: parseInt(beds) || 0,
      baths: parseInt(baths) || 0,
      description: description.trim(),
      category: category || "Flat to Rent",
      type: type || "rent",

      // Store arrays of images
      images: imageUrls,
      imagePublicIds: imagePublicIds,

      // Keep backward compatibility with single image field
      image: imageUrls[0] || '',
      imagePublicId: imagePublicIds[0] || '',

      size: size || "",
      createdBy: user.userId,
      createdByEmail: user.email,
      createdByName: user.name || user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(propertyDoc);

    // Create audit log (non-blocking)
    setImmediate(async () => {
      try {
        await db.collection('audit_logs').insertOne({
          action: 'PROPERTY_CREATED',
          propertyId: result.insertedId.toString(),
          userId: user.userId,
          userEmail: user.email,
          propertyTitle: propertyDoc.title,
          propertyLocation: propertyDoc.location,
          imageCount: imageUrls.length,
          hasImage: imageUrls.length > 0,
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown'
        });
      } catch (auditError) {
        console.error('Audit log error:', auditError);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Property saved successfully",
      data: {
        _id: result.insertedId.toString(),
        ...propertyDoc,
        createdAt: propertyDoc.createdAt.toISOString(),
        updatedAt: propertyDoc.updatedAt.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Error saving property:", error);
    console.error("❌ Stack trace:", error.stack);

    return NextResponse.json({
      success: false,
      message: "Error saving property",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * GET /api/properties
 * Fetches all properties with optional filtering and pagination.
 * This is a public endpoint that doesn't require authentication.
 * 
 * @async
 * @param {Request} request - The Next.js request object
 * @returns {Promise<NextResponse>} JSON response with array of properties
 * @example
 * // Query parameters:
 * // - type: 'rent' | 'sale'
 * // - category: string
 * // - location: string (partial match, case-insensitive)
 * // - createdBy: string (user ID)
 * // - page: number (default: 1)
 * // - limit: number (default: 100, max: 500)
 */
export async function GET(request) {
  try {
    checkRateLimit(request);

    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const createdBy = searchParams.get('createdBy');
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    console.log('🔍 GET /api/properties - Filters:', { type, category, location, createdBy, page, limit });

    // Input validation
    if (limit > 500) {
      return NextResponse.json({
        success: false,
        message: 'Limit cannot exceed 500'
      }, { status: 400 });
    }

    if (page < 1) {
      return NextResponse.json({
        success: false,
        message: 'Page must be greater than 0'
      }, { status: 400 });
    }

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (createdBy) filter.createdBy = createdBy;

    // Get total count for pagination
    const totalCount = await collection.countDocuments(filter);

    const properties = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Convert ObjectId to string for each property
    const serializedProperties = properties.map(prop => ({
      ...prop,
      _id: prop._id.toString(),
      createdAt: prop.createdAt?.toISOString(),
      updatedAt: prop.updatedAt?.toISOString()
    }));

    console.log(`✅ Fetched ${serializedProperties.length} properties (Total: ${totalCount})`);

    return NextResponse.json({
      success: true,
      count: serializedProperties.length,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      data: serializedProperties
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    console.error("❌ Stack trace:", error.stack);

    if (error.name === 'MongoServerError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }, { status: 503 });
    }

    return NextResponse.json({
      success: false,
      message: "Error fetching properties",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
