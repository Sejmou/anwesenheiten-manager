export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/admins',
    '/anwesenheiten',
    '/mitglieder',
    '/statistiken',
    '/termine',
    '/programm',
  ],
};
