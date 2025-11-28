import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Fetch single property by ID
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");
    
    // Await params in Next.js 15+
    const { id } = await params;
    
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
    
    return NextResponse.json({
      success: true,
      data: serializedProperty
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching property:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred",
        error: error.message
      }, { status: 503 });
    }
    
    // Handle invalid ObjectId errors
    if (error.name === 'BSONError') {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID",
        error: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error fetching property",
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update property by ID
export async function PUT(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");
    
    // Await params in Next.js 15+
    const { id } = await params;
    const data = await request.json();
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID format"
      }, { status: 400 });
    }
    
    // Validate that we have data to update
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No update data provided"
      }, { status: 400 });
    }
    
    // Remove _id and createdAt from update data if present
    delete data._id;
    delete data.createdAt;
    
    // Sanitize and prepare update document
    const updateDoc = {
      ...(data.title && { title: data.title.trim() }),
      ...(data.location && { location: data.location.trim() }),
      ...(data.price && { price: data.price }),
      ...(data.beds !== undefined && { beds: parseInt(data.beds) || 0 }),
      ...(data.baths !== undefined && { baths: parseInt(data.baths) || 0 }),
      ...(data.description !== undefined && { description: data.description?.trim() || "" }),
      ...(data.category && { category: data.category }),
      ...(data.type && { type: data.type }),
      ...(data.image !== undefined && { image: data.image?.trim() || "" }),
      ...(data.size !== undefined && { size: data.size }),
      updatedAt: new Date()
    };
    
    // Check if property exists before updating
    const existingProperty = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!existingProperty) {
      return NextResponse.json({
        success: false,
        message: "Property not found"
      }, { status: 404 });
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    
    // Fetch the updated property
    const updatedProperty = await collection.findOne({ _id: new ObjectId(id) });
    
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
    console.error("Error updating property:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred",
        error: error.message
      }, { status: 503 });
    }
    
    // Handle invalid ObjectId errors
    if (error.name === 'BSONError') {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID",
        error: error.message
      }, { status: 400 });
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        message: "Invalid JSON data",
        error: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error updating property",
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete property by ID
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");
    
    // Await params in Next.js 15+
    const { id } = await params;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID format"
      }, { status: 400 });
    }
    
    // Check if property exists before deleting
    const existingProperty = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!existingProperty) {
      return NextResponse.json({
        success: false,
        message: "Property not found"
      }, { status: 404 });
    }
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Failed to delete property"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
      deletedProperty: {
        _id: existingProperty._id.toString(),
        title: existingProperty.title
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting property:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred",
        error: error.message
      }, { status: 503 });
    }
    
    // Handle invalid ObjectId errors
    if (error.name === 'BSONError') {
      return NextResponse.json({
        success: false,
        message: "Invalid property ID",
        error: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error deleting property",
      error: error.message
    }, { status: 500 });
  }
}