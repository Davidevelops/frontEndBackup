// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log(`🔄 Middleware checking: ${path}`);
  
  // Public paths that don't require auth
  const publicPaths = ['/login', '/_next', '/favicon.ico', '/assets'];
  
  // Check if path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath) || path.includes('.')
  );
  
  if (isPublicPath) {
    console.log(`✅ Allowing public path: ${path}`);
    return NextResponse.next();
  }
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  console.log(`🔑 Token in cookies: ${token ? 'Yes' : 'No'}`);
  
  // If no token, redirect to login
  if (!token) {
    console.log(`↪ No token found, redirecting to login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log(`✅ Token found, allowing access to: ${path}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};