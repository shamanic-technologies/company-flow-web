import { redirect } from 'next/navigation';

/**
 * Auth Callback Page (Server Component)
 * Redirects to the route handler to properly handle cookies
 */
export default async function AuthCallback({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Get token value safely
  const params = await searchParams;
  const tokenValue = params?.token;
  const token = typeof tokenValue === 'string' 
    ? tokenValue 
    : Array.isArray(tokenValue) && tokenValue.length > 0 
      ? tokenValue[0] 
      : null;
  
  if (!token) {
    // No token found, redirect to error page
    redirect('/?error=no_token');
  }
  
  // Redirect to the API route handler which can properly set cookies
  redirect(`/api/auth/callback?token=${encodeURIComponent(token)}`);
  
  // This is a fallback - the function should redirect before reaching here
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Redirecting...
        </h1>
        <div className="flex justify-center">
          <div className="animate-pulse h-2 w-24 bg-blue-500 rounded"></div>
        </div>
      </div>
    </div>
  );
} 