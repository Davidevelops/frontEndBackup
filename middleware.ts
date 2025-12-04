// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Debug logging
  console.log(`🔍 Middleware checking: ${path}`);
  
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
  console.log(`   Token exists: ${!!token}`);
  
  // Define public routes - UPDATED TO lowercase 'login'
  const publicRoutes = [
    '/',
    '/login',      // Changed from '/logIn' to '/login'
    '/test',
  ];
  
  // Case-insensitive check
  const isPublicRoute = publicRoutes.some(route => 
    route.toLowerCase() === path.toLowerCase()
  );
  
  console.log(`   Is public route: ${isPublicRoute}`);
  
  // If trying to access login while already logged in - UPDATED
  if (token && (path.toLowerCase() === '/login')) {
    console.log(`   Redirecting to dashboard (already logged in)`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow access if it's a public route or user has token
  if (isPublicRoute || token) {
    return NextResponse.next();
  }
  
  // Redirect to login if not authenticated - UPDATED
  console.log(`   Redirecting to login (no auth)`);
  return NextResponse.redirect(new URL('/login', request.url)); // Changed to lowercase
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};