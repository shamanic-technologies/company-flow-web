import { redirect } from 'next/navigation';

/**
 * Default Dashboard Page
 * Redirects users immediately to the playground section.
 */
export default function DashboardPage() {
  // Redirect to the playground page
  redirect('/dashboard/playground');
  
  // Return null or an empty fragment as redirect throws an error
  // and stops execution, but React requires a return value.
  return null; 
} 