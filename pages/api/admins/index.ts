import { getToken } from 'next-auth/jwt';
import { NextApiHandler, NextApiResponse } from 'next/types';
import prisma from 'lib/prisma';

export interface Admin {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

const tokenRequestHandler: NextApiHandler = async (
  req,
  res: NextApiResponse<Admin[]>
) => {
  const token = await getToken({ req });
  if (!token) {
    // Client not authorized!
    res.status(401).end();
    return;
  }

  try {
    const { method } = req;
    if (method === 'GET') {
      const usersDB = await prisma.user.findMany();
      const admins: Admin[] = usersDB.map(u => ({
        email: u.email ?? '-',
        createdAt: u.createdAt,
        firstName: u.firstName ?? '-',
        lastName: u.lastName ?? '-',
      }));
      res.send(admins);
    } else {
      throw Error('HTTP method ' + method + ' not supported by this endpoint!');
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
};

export default tokenRequestHandler;
