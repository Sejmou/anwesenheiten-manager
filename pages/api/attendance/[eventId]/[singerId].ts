import { getToken } from 'next-auth/jwt';
import { NextApiHandler, NextApiRequest } from 'next/types';
import prisma from '../../../../lib/prisma';

const attendancesRequestHandler: NextApiHandler = async (req, res) => {
  const token = await getToken({ req });
  if (!token) {
    // Client not authorized!
    res.status(401).end();
    return;
  }

  try {
    const singerId = extractQueryParamAsString(req, 'singerId');
    const eventId = extractQueryParamAsString(req, 'eventId');
    const { method } = req;
    if (method === 'PATCH') {
      // toggle event attendance for singer
      const attendance = await prisma.eventAttendance.findFirst({
        where: { eventId, singerId },
      });
      if (attendance) {
        await prisma.eventAttendance.deleteMany({
          where: { singerId, eventId },
        });
        // could not figure out how to do delete() with proper where clause
        // However, this will also delete just one record as singerId and eventId make up each EventAttendance ID
      } else {
        await prisma.eventAttendance.create({ data: { eventId, singerId } });
      }
    } else {
      throw Error('HTTP method ' + method + ' not supported by this endpoint!');
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
};

export default attendancesRequestHandler;

export function extractQueryParamAsString(
  req: NextApiRequest,
  paramName: string,
  required = true
) {
  const paramValue = req.query[paramName];
  if (!paramValue) {
    if (required)
      throw Error(`No value for query parameter '${paramName}' provided!`);
    else return '';
  }
  if (typeof paramValue !== 'string') {
    throw Error(`Multiple values for query parameter '${paramName}' provided!`);
  }
  return paramValue;
}
