/**
 * Represents a user's profile information.
 */
interface User {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
  mobile: number;
  created_at: string; // or Date if you plan to parse it
}

interface Address {
  id: string;
  address: string;
}

/**
 * Represents the complete user data structure, including profile and addresses.
 * It's a tuple containing the user object and an array of address strings.
 */
type UserProfileData = [User, Address];

export type { UserProfileData };
