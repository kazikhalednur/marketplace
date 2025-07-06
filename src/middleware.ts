import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // You can add custom logic here if needed
  return NextResponse.next();
}