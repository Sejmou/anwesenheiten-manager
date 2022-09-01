import { NextApiHandler, NextApiResponse } from 'next/types';
import { getToken } from 'next-auth/jwt';
import prisma from '../../lib/prisma';
import { InviteToken } from '@prisma/client';
import bcrypt from 'bcrypt';

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
      const tokens = await prisma.inviteToken.findMany();
      res.send(tokens); // TODO: think about whether it's a problem to send token IDs to authenticated clients
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
