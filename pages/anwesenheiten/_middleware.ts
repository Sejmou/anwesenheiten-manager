// this makes the whole route + subroutes unreachable to non-authenticated users: https://next-auth.js.org/tutorials/securing-pages-and-api-routes#nextjs-middleware
// Note: this feature does NOT work with NextJS 12.2+ (devs haven't yet developed middleware that works with NextJS' new middleware implementation)
export { default } from 'next-auth/middleware';
