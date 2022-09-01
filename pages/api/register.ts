import { NextApiHandler } from 'next';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';

const RegistrationDataValidator = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
});

const registerHandler: NextApiHandler = async (req, res) => {
  try {
    const requestBody = JSON.parse(req.body);
    const registrationData = RegistrationDataValidator.parse(requestBody);
    const { email, name, password } = registrationData;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      throw Error(`Email ${email} already taken!`);
    } else {
      console.log('Creating new user in database');
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: { email, name, passwordHash },
      });
      res.send(200);
    }
  } catch (error) {
    console.error(error);
    res.send(400);
  }
};

export default registerHandler;
