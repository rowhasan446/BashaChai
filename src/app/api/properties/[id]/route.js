import { NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from 'cloudinary';
import { verifyApiToken, requireRole, createAuthError, checkRateLimit } from '../../../../../lib/auth';

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

// GET - Fetch single property by ID (PUBLIC)
export async function GET(request, { params }) {
  try {
    checkRateLimit(request);

    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");
    
    // Await params in Next.js 15+
    const { id } = await params;
    
    console.log('🔍 GET /api/properties/[id] - ID:', id);

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID format"
      }, { status: 400 });
    }
    
    const property = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!property) {
      return NextResponse.json({
        success: false,
        message: "Property not found"
      }, { status: 404 });
    }
    
    // Serialize the property data
    const serializedProperty = {
      ...property,
      _id: property._id.toString(),
      createdAt: property.createdAt?.toISOString(),
      updatedAt: property.updatedAt?.toISOString()
    };
    
    console.log('✅ Property found:', serializedProperty.title);
    
    return NextResponse.json({
      success: true,
      data: serializedProperty
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Error fetching property:", error);
    console.error("❌ Stack trace:", error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }, { status: 503 });
    }
    
    // Handle invalid ObjectId errors
    if (error.name === 'BSONError') {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error fetching property",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Update property by ID (OWNER OR ADMIN ONLY)
export async function PUT(request, { params }) {
  let user = null;

  try {
    checkRateLimit(request);
    user = await verifyApiToken(request);
  } catch (authError) {
    console.error('❌ Authentication error in PUT /api/properties/[id]:', authError.message);
    return createAuthError(authError.message, 401);
  }

  try {
    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");
    
    // Await params in Next.js 15+
    const { id } = await params;
    
    console.log('🔍 PUT /api/properties/[id] - ID:', id, 'User:', user.email);

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID format"
      }, { status: 400 });
    }
    
    // Check if property exists
    const existingProperty = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!existingProperty) {
      return NextResponse.json({
        success: false,
        message: "Property not found"
      }, { status: 404 });
    }

    // Check if user owns the property or is admin
    if (existingProperty.createdBy !== user.userId && user.role !== 'admin') {
      console.error('❌ Access denied: User', user.userId, 'tried to edit property owned by', existingProperty.createdBy);
      return createAuthError('Access denied: You can only edit your own properties', 403);
    }

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
    const file = formData.get('image');
    const removeImage = formData.get('removeImage') === 'true';

    // Build update document
    const updateDoc = {
      updatedAt: new Date(),
      lastUpdatedBy: user.userId
    };

    // Update text fields if provided
    if (title !== null && title !== undefined) {
      if (typeof title !== 'string' || title.trim().length < 1) {
        return NextResponse.json({
          success: false,
          message: 'Valid title is required'
        }, { status: 400 });
      }
      updateDoc.title = title.trim();
    }

    if (location !== null && location !== undefined) {
      if (typeof location !== 'string' || location.trim().length < 1) {
        return NextResponse.json({
          success: false,
          message: 'Valid location is required'
        }, { status: 400 });
      }
      updateDoc.location = location.trim();
    }

    if (price !== null && price !== undefined) {
      updateDoc.price = price;
    }

    if (beds !== null && beds !== undefined) {
      updateDoc.beds = parseInt(beds) || 0;
    }

    if (baths !== null && baths !== undefined) {
      updateDoc.baths = parseInt(baths) || 0;
    }

    if (description !== null && description !== undefined) {
      if (typeof description !== 'string' || description.trim().length < 1) {
        return NextResponse.json({
          success: false,
          message: 'Valid description is required'
        }, { status: 400 });
      }
      updateDoc.description = description.trim();
    }

    if (category !== null && category !== undefined) {
      updateDoc.category = category;
    }

    if (type !== null && type !== undefined) {
      updateDoc.type = type;
    }

    if (size !== null && size !== undefined) {
      updateDoc.size = size;
    }

    // Handle image removal
    if (removeImage && existingProperty.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(existingProperty.imagePublicId);
        console.log('✅ Old image deleted from Cloudinary:', existingProperty.imagePublicId);
      } catch (deleteError) {
        console.error('❌ Error deleting old image:', deleteError);
      }
      updateDoc.image = '';
      updateDoc.imagePublicId = '';
    }

    // Handle new image upload
    if (file && file.size > 0) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({
          success: false,
          message: 'Only image files are allowed'
        }, { status: 400 });
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json({
          success: false,
          message: 'File size must be less than 10MB'
        }, { status: 400 });
      }

      try {
        // Delete old image if exists
        if (existingProperty.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(existingProperty.imagePublicId);
            console.log('✅ Old image replaced:', existingProperty.imagePublicId);
          } catch (deleteError) {
            console.error('❌ Error deleting old image:', deleteError);
          }
        }

        // Convert file to buffer for Cloudinary upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: 'image',
                folder: 'BASHACHAI_properties',
                public_id: `property_${user.userId}_${Date.now()}`,
                transformation: [
                  { width: 1200, height: 800, crop: 'fill' },
                  { quality: 'auto' },
                  { format: 'auto' },
                ],
              },
              (error, result) => {
                if (error) {
                  console.error('❌ Cloudinary upload error:', error);
                  reject(new Error(`Cloudinary upload failed: ${error.message}`));
                } else {
                  resolve(result);
                }
              }
            )
            .end(buffer);
        });

        updateDoc.image = uploadResponse.secure_url;
        updateDoc.imagePublicId = uploadResponse.public_id;

        console.log('✅ New image uploaded to Cloudinary:', uploadResponse.public_id);
      } catch (uploadError) {
        console.error('❌ Error uploading to Cloudinary:', uploadError);
        return NextResponse.json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        }, { status: 500 });
      }
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Property not found"
      }, { status: 404 });
    }
    
    // Fetch the updated property
    const updatedProperty = await collection.findOne({ _id: new ObjectId(id) });
    
    // Create audit log (non-blocking)
    setImmediate(async () => {
      try {
        await db.collection('audit_logs').insertOne({
          action: 'PROPERTY_UPDATED',
          propertyId: id,
          userId: user.userId,
          userEmail: user.email,
          propertyTitle: updatedProperty.title,
          updatedFields: Object.keys(updateDoc),
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
        });
      } catch (auditError) {
        console.error('Audit log error:', auditError);
      }
    });

    console.log('✅ Property updated successfully');
    
    return NextResponse.json({
      success: true,
      message: "Property updated successfully",
      modifiedCount: result.modifiedCount,
      data: {
        ...updatedProperty,
        _id: updatedProperty._id.toString(),
        createdAt: updatedProperty.createdAt?.toISOString(),
        updatedAt: updatedProperty.updatedAt?.toISOString()
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Error updating property:", error);
    console.error("❌ Stack trace:", error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }, { status: 503 });
    }
    
    // Handle invalid ObjectId errors
    if (error.name === 'BSONError') {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }, { status: 400 });
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        message: "Invalid JSON data",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error updating property",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Delete property by ID (OWNER OR ADMIN ONLY)
export async function DELETE(request, { params }) {
  let user = null;

  try {
    checkRateLimit(request);
    user = await verifyApiToken(request);
  } catch (authError) {
    console.error('❌ Authentication error in DELETE /api/properties/[id]:', authError.message);
    return createAuthError(authError.message, 401);
  }

  try {
    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");
    
    // Await params in Next.js 15+
    const { id } = await params;
    
    console.log('🔍 DELETE /api/properties/[id] - ID:', id, 'User:', user.email);

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID format"
      }, { status: 400 });
    }
    
    // Check if property exists
    const existingProperty = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!existingProperty) {
      return NextResponse.json({
        success: false,
        message: "Property not found"
      }, { status: 404 });
    }

    // Check if user owns the property or is admin
    if (existingProperty.createdBy !== user.userId && user.role !== 'admin') {
      console.error('❌ Access denied: User', user.userId, 'tried to delete property owned by', existingProperty.createdBy);
      return createAuthError('Access denied: You can only delete your own properties', 403);
    }

    // Delete image from Cloudinary if exists
    if (existingProperty.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(existingProperty.imagePublicId);
        console.log('✅ Image deleted from Cloudinary:', existingProperty.imagePublicId);
      } catch (deleteError) {
        console.error('❌ Error deleting image from Cloudinary:', deleteError);
        // Continue with property deletion even if image deletion fails
      }
    }
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Failed to delete property"
      }, { status: 500 });
    }
    
    // Create audit log (non-blocking)
    setImmediate(async () => {
      try {
        await db.collection('audit_logs').insertOne({
          action: 'PROPERTY_DELETED',
          propertyId: id,
          userId: user.userId,
          userEmail: user.email,
          deletedPropertyTitle: existingProperty.title,
          deletedPropertyLocation: existingProperty.location,
          hadImage: !!existingProperty.imagePublicId,
          deletedImagePublicId: existingProperty.imagePublicId || null,
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
        });
      } catch (auditError) {
        console.error('Audit log error:', auditError);
      }
    });

    console.log('✅ Property deleted successfully');
    
    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
      deletedProperty: {
        _id: existingProperty._id.toString(),
        title: existingProperty.title,
        location: existingProperty.location
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Error deleting property:", error);
    console.error("❌ Stack trace:", error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }, { status: 503 });
    }
    
    // Handle invalid ObjectId errors
    if (error.name === 'BSONError') {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error deleting property",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}