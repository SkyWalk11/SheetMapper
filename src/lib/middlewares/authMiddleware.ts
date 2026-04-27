import { NextRequest, NextResponse } from 'next/server';
import { ROUTES } from '@/lib/constants/routes';

export const authMiddleware = (request: NextRequest): NextResponse | null => {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  return null;
};
