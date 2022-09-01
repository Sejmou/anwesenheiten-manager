import { NextApiHandler } from 'next';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

const RegistrationDataValidator = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  inviteToken: z.string().optional(),
});

export type RegistrationData = z.infer<typeof RegistrationDataValidator>;

const registerHandler: NextApiHandler = async (req, res) => {
  try {
    const requestBody = JSON.parse(req.body);
    const registrationData = RegistrationDataValidator.parse(requestBody);
    const { email } = registrationData;

    const firstUser = (await prisma.user.count()) === 0;
    if (firstUser) {
      registerUser(registrationData, false);
      res.end();
      return;
    }

    const emailTaken = !!(await prisma.user.findUnique({
      where: {
        email,
      },
    }));
    if (emailTaken) {
      throw Error(`Email ${email} already taken!`);
    }

    await registerUser(registrationData);

    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
};

export default registerHandler;

async function registerUser(
  { email, name, password, inviteToken }: RegistrationData,
  checkInviteToken = true
) {
  const passwordHash = await bcrypt.hash(password, 10);
  if (checkInviteToken) {
    // TODO: rewrite this once Prisma offers proper support for interactive transactions (with access to intermediate results)
    try {
      const token = await prisma.inviteToken.findFirstOrThrow({
        where: { token: inviteToken },
      });
      if (token.used) {
        throw Error('Token already used!');
      }

      console.log('Creating new user in database, updating token status');
      let user: User;
      try {
        user = await prisma.user.create({
          data: { email, name, passwordHash },
        });
      } catch (error) {
        throw Error('Could not create user!');
      }
      try {
        await prisma.inviteToken.update({
          where: { token: inviteToken },
          data: { used: true, usedAt: new Date(), userId: user.id },
        });
        return;
      } catch (error) {
        // revert user creation
        prisma.user.delete({ where: { id: user.id } });
        throw Error('Could not update token status after creating user!');
      }
    } catch (error) {
      throw Error('Invalid token!');
    }
  }

  console.log('Creating new user in database');
  await prisma.user.create({
    data: { email, name, passwordHash },
  });
}
