import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = pathname =>
    router.pathname === pathname;

  const { data: session, status } = useSession();

  const left = (
    <div className="left">
      <Link href="/">
        <a className="bold" data-active={isActive('/')}>
          Feed
        </a>
      </Link>
      {session && (
        <Link href="/drafts">
          <a data-active={isActive('/drafts')}>My drafts</a>
        </Link>
      )}
      <style jsx>{`
        .bold {
          font-weight: bold;
        }

        a {
          text-decoration: none;
          color: gray;
          display: inline-block;
        }

        .left a[data-active='true'] {
          color: black;
        }

        a:hover,
        .left a[data-active='true']:hover {
          color: blue;
        }

        a + a {
          margin-left: 1rem;
        }
      `}</style>
    </div>
  );

  const right =
    status === 'loading' ? (
      <div className="right">
        <p>Validating session ...</p>
        <style jsx>{`
          .right {
            margin-left: auto;
          }
        `}</style>
      </div>
    ) : (
      <div className="right">
        {session ? (
          <>
            <p>
              {session.user.name} ({session.user.email})
            </p>
            <Link href="/create">
              <button>
                <a>New post</a>
              </button>
            </Link>
            <button onClick={() => signOut()}>
              <a>Log out</a>
            </button>
          </>
        ) : (
          <Link href="/api/auth/signin">
            <a data-active={isActive('/signup')}>Log in</a>
          </Link>
        )}
        <style jsx>{`
          a {
            text-decoration: none;
            color: var(--geist-foreground);
            display: inline-block;
          }

          p {
            display: inline-block;
            font-size: 13px;
            padding-right: 1rem;
          }

          a:hover {
            color: blue;
          }

          a + a {
            margin-left: 1rem;
          }

          .right {
            margin-left: auto;
          }

          .right a {
            border: 1px solid var(--geist-foreground);
            padding: 0.5rem 1rem;
            border-radius: 3px;
          }
        `}</style>
      </div>
    );

  return (
    <nav>
      {left}
      {right}
      <style jsx>{`
        nav {
          display: flex;
          padding: 2rem;
          align-items: center;
        }
      `}</style>
    </nav>
  );
};

export default Header;
