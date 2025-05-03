// Shared helper functions

/**
 * Helper function to get initials from first and last name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName?.charAt(0) || '';
  const lastInitial = lastName?.charAt(0) || '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

// Add other shared helpers here later 