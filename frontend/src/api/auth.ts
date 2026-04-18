import api from './axios';

export async function loginUser(email: string, password: string): Promise<{ token: string; fullName: string }> {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function registerUser(
  email: string,
  password: string,
  fullName: string
): Promise<{ message: string; userId: string }> {
  const response = await api.post('/auth/register', { email, password, fullName });
  return response.data;
}
