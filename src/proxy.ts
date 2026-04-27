import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// No auth required in this playground — pass all requests through.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
