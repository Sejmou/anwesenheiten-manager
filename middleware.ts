import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('middleware called');
  // Example function to validate auth
  if (isAuthValid(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

function isAuthValid(request: NextRequest) {
  return false;
}

// export const config = {
//   matcher: ['/*'],
// };
