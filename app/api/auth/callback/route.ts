import { NextRequest, NextResponse } from 'next/server';

/**
 * Authentication callback route handler
 * Stores token in localStorage and redirects to dashboard
 */
export async function GET(request: NextRequest) {
  // Get the token from the URL
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  // Handle missing token
  if (!token) {
    console.error('🔑 Auth Callback - No token provided');
    return NextResponse.redirect(new URL('/?error=no_token', request.url));
  }
  
  try {
    // Create response with redirect to dashboard
    const dashboardUrl = new URL('/dashboard', request.url);
    
    // Create a dark-mode friendly loading animation with auto-redirect
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
          <meta name="color-scheme" content="light dark">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background-color: #111827;
              color: #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              transition: background-color 0.3s, color 0.3s;
            }
            
            /* Auto-detect light mode and adjust colors */
            @media (prefers-color-scheme: light) {
              body {
                background-color: #f3f4f6;
                color: #1f2937;
              }
            }
            
            .loader {
              width: 48px;
              height: 48px;
              border: 5px solid #3b82f6;
              border-bottom-color: transparent;
              border-radius: 50%;
              display: inline-block;
              box-sizing: border-box;
              animation: rotation 1s linear infinite;
            }
            
            @keyframes rotation {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <span class="loader"></span>
            <script>
              // Store token in localStorage for the Bearer token pattern
              localStorage.setItem('auth-token', '${token}');
              console.log('Token stored in localStorage');
              
              // Navigate to dashboard with a slight delay for the animation to be seen
              setTimeout(() => {
                window.location.href = '${dashboardUrl.toString()}';
              }, 800);
            </script>
          </div>
        </body>
      </html>
    `;
    
    // Return HTML response
    return new NextResponse(htmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    // Log and handle errors
    console.error('🔑 Auth Callback - Error in authentication callback:', error);
    const errorUrl = new URL('/?error=auth_error', request.url);
    return NextResponse.redirect(errorUrl);
  }
} 