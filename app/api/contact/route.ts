import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * Resend client instance.
 * Reads the API key from the environment variables.
 * Ensure RESEND_API_KEY is set in your .env file.
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * API route handler for POST requests to /api/contact.
 * Parses the contact form data from the request body and sends an email using Resend.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    const { name, email, message, button_id } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
        console.error('Resend API key is not configured. Please set RESEND_API_KEY environment variable.');
        return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 });
    }

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <contact@agent-base.ai>', // Updated from address to use the verified domain
      to: ['kevin@agent-base.ai'], // Your email address
      subject: `🎉 [Agent Base] Contact Form Submission from ${name}`,
      replyTo: email, // Corrected property name to camelCase
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">🎉 New Message via Agent Base Contact Form! 🎉</h2>
          <p>Great news! Someone reached out through the website:</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Their goal:</strong></p>
          <blockquote style="margin: 0 0 0 20px; border-left: 3px solid #eee; padding-left: 15px; color: #555;">
            ${message}
          </blockquote>
          ${button_id ? `<p><strong>Clicked Button ID:</strong> ${button_id}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.9em; color: #777;">Sent from the Agent Base contact form.</p>
        </div>
      `,
    });

    // Handle potential errors from Resend
    if (error) {
      console.error('Error sending email via Resend:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Return a success response
    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (err) {
    // Handle unexpected errors during request processing
    console.error('Error processing contact form submission:', err);
    // Avoid exposing internal error details to the client
    let errorMessage = 'Internal Server Error';
    if (err instanceof Error) {
        // Optionally log more specific errors internally if needed
        // errorMessage = err.message; // Be cautious about exposing potentially sensitive info
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 