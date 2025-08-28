// lib/server/fetchUserProfile.js
export async function fetchUserProfile(cookies) {
  try {
    const cookieHeader = cookies
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

      console.log('Cookie Header:', cookieHeader);

      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}
