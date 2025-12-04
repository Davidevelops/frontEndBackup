// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware for static files and _next
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') || // Static files
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Define public routes
  const publicRoutes = [
    '/',
    '/login',
    '/test',
  ];
  
  // Case-insensitive check
  const isPublicRoute = publicRoutes.some(route => 
    route.toLowerCase() === path.toLowerCase()
  );
  
  // If trying to access login while already logged in
  if (token && path.toLowerCase() === '/login') {
    console.log(`🔄 Middleware: Redirecting authenticated user from ${path} to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow access if it's a public route or user has token
  if (isPublicRoute || token) {
    // Add cache-control headers to prevent loops
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  }
  
  // Redirect to login if not authenticated
  console.log(`🔄 Middleware: Redirecting unauthenticated user from ${path} to /login`);
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};