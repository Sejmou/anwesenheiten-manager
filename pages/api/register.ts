import { NextApiHandler } from 'next';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';

const RegistrationDataValidator = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  inviteToken: z.string().optional(),
});

type RegistrationData = z.infer<typeof RegistrationDataValidator>;

const registerHandler: NextApiHandler = async (req, res) => {
  try {
    const requestBody = JSON.parse(req.body);
    const registrationData = RegistrationDataValidator.parse(requestBody);
    const { email } = registrationData;

    const firstUser = (await prisma.user.count()) === 0;
    if (firstUser) {
      registerUser(registrationData, false);
    }

    const emailTaken = !!(await prisma.user.findUnique({
      where: {
        email,
      },
    }));
    if (emailTaken) {
      throw Error(`Email ${email} already taken!`);
    }

    registerUser(registrationData);

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
  console.log('Creating new user in database');
  const passwordHash = await bcrypt.hash(password, 10);
  if (checkInviteToken) {
    // TODO: find cleaner way to figure out if token exists, and, if it does, whether it is still usable
    try {
      await prisma.inviteToken.findFirstOrThrow({
        where: { token: inviteToken },
      });
    } catch (error) {
      throw Error('Invalid token!');
    }

    // unfortunately, cannot use non-unique fields together with unique ones in where of update(): https://github.com/prisma/prisma/issues/7290
    const { count } = await prisma.inviteToken.updateMany({
      where: { token: inviteToken, used: false },
      data: { used: true, usedAt: new Date() },
    });
    if (count === 0) {
      // no rows affected by update -> no matching valid token found in database
      // as we already checked if token exists, we know that the reason must be that the token was already used
      throw Error('Token already used!');
    }
  }

  await prisma.user.create({
    data: { email, name, passwordHash },
  });
}
