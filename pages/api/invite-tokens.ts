import { NextApiHandler, NextApiResponse } from 'next/types';
import { getToken } from 'next-auth/jwt';
import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';

export interface InviteToken {
  token: string;
  used: boolean;
  usedBy?: {
    // TODO: smarter typing of this
    name?: string | null;
    email?: string | null;
  };
}

const tokenRequestHandler: NextApiHandler = async (
  req,
  res: NextApiResponse<InviteToken[]>
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
      const tokensDB = await prisma.inviteToken.findMany({
        include: { usedBy: true },
      });
      const tokens: InviteToken[] = tokensDB.map(t => ({
        token: t.token,
        used: t.used,
        usedBy: {
          email: t.usedBy?.email,
          name: t.usedBy?.name,
        },
      }));
      res.send(tokens);
    }
    if (method === 'POST') {
      const token = await bcrypt.hash('super secret token', 10);
      await prisma.inviteToken.create({ data: { token } });
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
