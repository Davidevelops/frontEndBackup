// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log(`🔄 Middleware checking: ${path}`);
  
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
  
  // Debug: Log all cookies
  const allCookies = request.cookies.getAll();
  console.log(`🍪 All cookies:`, allCookies.map(c => c.name));
  console.log(`🔑 Token cookie exists: ${!!token}`);
  
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
  
  console.log(`🌐 Is public route: ${isPublicRoute}`);
  
  // If trying to access login while already logged in
  if (token && path.toLowerCase() === '/login') {
    console.log(`↪ Redirecting authenticated user to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow access if it's a public route or user has token
  if (isPublicRoute || token) {
    console.log(`✅ Allowing access to: ${path}`);
    
    // Add token to headers for client-side access
    const response = NextResponse.next();
    if (token) {
      response.headers.set('x-auth-token', token);
    }
    
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    
    return response;
  }
  
  // Redirect to login if not authenticated
  console.log(`↪ Redirecting unauthenticated user from ${path} to /login`);
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};