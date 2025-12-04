
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

  const path = request.nextUrl.pathname;
  

  const isPublicPath = path === '/auth/login' || path === '/' || path.startsWith('/_next') || path.includes('.');
  

  const token = request.cookies.get('token')?.value;
  
  console.log(`Middleware: ${path}, hasToken: ${!!token}, isPublic: ${isPublicPath}`);
  

  if (token && path === '/auth/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  

  if (isPublicPath || token) {
    return NextResponse.next();
  }
  

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};