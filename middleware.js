import { NextResponse } from 'next/server';

export function middleware(request) {
  // Allow all dashboard pages and API requests to pass through cleanly
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
