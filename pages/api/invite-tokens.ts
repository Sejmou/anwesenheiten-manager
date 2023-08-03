import { NextApiHandler, NextApiResponse } from 'next/types';
import { getToken } from 'next-auth/jwt';
import prisma from 'lib/prisma';
import bcrypt from 'bcrypt';

export interface InviteToken {
  token: string;
  used: boolean;
  usedBy?: {
    // TODO: smarter typing of this
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
  createdAt: Date;
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
      const onlyAvailable = req.query.available !== undefined;
      const tokensDB = await prisma.inviteToken.findMany({
        where: { used: onlyAvailable ? false : undefined },
        include: { usedBy: true },
      });
      const tokens: InviteToken[] = tokensDB.map(t => ({
        token: t.token,
        used: t.used,
        usedBy: {
          email: t.usedBy?.email,
          firstName: t.usedBy?.firstName,
          lastName: t.usedBy?.lastName,
        },
        createdAt: t.createdAt,
      }));
      res.send(tokens);
    } else if (method === 'POST') {
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
