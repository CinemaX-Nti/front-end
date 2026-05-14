export type BackendRole = 'admin' | 'user';
export type AppRole = 'admin' | 'user';

export interface User {
  _id: string;
  name: string;
  email: string;
  // Backend enum value (tested): 'admin' | 'user'
  role: BackendRole;
  provider: string;
  photoUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface BasicResponse {
  success: boolean;
  message: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    requiresEmailConfirmation?: boolean;
  };
}
