import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

// POST - Create new property
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.location || !data.price) {
      return NextResponse.json({
        success: false,
        message: "Title, location, and price are required fields"
      }, { status: 400 });
    }
    
    // Prepare property document
    const propertyDoc = {
      title: data.title.trim(),
      location: data.location.trim(),
      price: data.price,
      beds: parseInt(data.beds) || 0,
      baths: parseInt(data.baths) || 0,
      description: data.description?.trim() || "",
      category: data.category || "Flat to Rent",
      type: data.type || "rent", // 'rent' or 'sale'
      image: data.image?.trim() || "",
      size: data.size || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(propertyDoc);
    
    return NextResponse.json({
      success: true,
      message: "Property saved successfully",
      data: { 
        _id: result.insertedId.toString(), 
        ...propertyDoc 
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error saving property:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred",
        error: error.message
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error saving property",
      error: error.message
    }, { status: 500 });
  }
}

// GET - Fetch all properties
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("BASHACHAI");
    const collection = db.collection("properties");
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'rent' or 'sale'
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' }; // Case-insensitive search
    
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
    
    return NextResponse.json({
      success: true,
      count: serializedProperties.length,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      data: serializedProperties
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching properties:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json({
        success: false,
        message: "Database error occurred",
        error: error.message
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error fetching properties",
      error: error.message
    }, { status: 500 });
  }
}