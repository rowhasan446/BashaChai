import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { fullName, mobile, email, type, location, message } = await request.json();

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${fullName}" <${process.env.GMAIL_USER}>`, // Show sender's name
      replyTo: email || undefined, // Set reply-to as sender's email if provided
      to: "bashachai34@gmail.com",
      subject: `Property Inquiry from ${fullName}`, // Clean subject line
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #7c3aed; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">New Property Inquiry</h2>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">Contact Information</h3>
            
            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold; width: 120px;">Full Name:</td>
                <td style="padding: 10px 0; color: #333;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Mobile:</td>
                <td style="padding: 10px 0; color: #333;">${mobile}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Email:</td>
                <td style="padding: 10px 0; color: #333;">${email || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Inquiry Type:</td>
                <td style="padding: 10px 0; color: #333;">${type}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-weight: bold;">Location:</td>
                <td style="padding: 10px 0; color: #333;">${location || "Not specified"}</td>
              </tr>
            </table>

            <h3 style="color: #333; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; margin-top: 30px;">Message</h3>
            <div style="background-color: #f5f3ff; padding: 15px; border-radius: 5px; margin-top: 15px; color: #333; line-height: 1.6;">
              ${message}
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #666; font-size: 12px;">
              <p>This inquiry was submitted through BashaChai.com</p>
              <p style="margin-top: 5px;">© ${new Date().getFullYear()} BashaChai.com - All rights reserved</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
