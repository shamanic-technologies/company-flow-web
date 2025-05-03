'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Clock } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/context/DashboardContext';

/**
 * User Profile Page
 * Displays detailed information about the current user
 * Uses the dashboard context for user data
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, error, getUserInitials } = useDashboard();

  // Format date in a readable way
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // User not found or not authenticated
  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>Unable to load user profile</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Determine display name based on available fields from PlatformUser
  // Primarily use displayName, fall back to email, then a generic 'User'.
  const displayName = user.displayName || user.email || 'User';

  return (
    <>
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-100">Profile</h1>
        <p className="text-gray-400">View and manage your account information</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Card className="w-full max-w-4xl mx-auto bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-100">User Profile</CardTitle>
            <CardDescription className="text-gray-400">Your account information</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                {/* {user.picture ? ( Remove picture logic */}
                {/*  <AvatarImage src={user.picture} alt={displayName} /> */}
                {/* ) : ( */}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getUserInitials()}
                  </AvatarFallback>
                {/* )} */}
              </Avatar>
              
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-100">{displayName}</h2>
                <p className="text-gray-400">{user.email || 'No email available'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  User ID: {user.id}
                </p>
              </div>
            </div>
            
            <Separator className="bg-gray-800" />
            
            {/* User Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Joined</p>
                      <p className="font-medium text-gray-200">{formatDate(user.createdAt.toISOString())}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 