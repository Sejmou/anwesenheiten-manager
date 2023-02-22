import { NextApiHandler, NextApiResponse } from 'next';
import { verifySignature } from '@upstash/qstash/nextjs';
import { syncCalendar } from './sync';

export const calendarUpstashUpdateRequestHandler: NextApiHandler = async (
  req,
  res: NextApiResponse
) => {
  try {
    const { method } = req;
    if (method === 'GET') {
      await syncCalendar();
      res.end();
    } else {
      throw Error('HTTP method ' + method + ' not supported by this endpoint!');
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
};

export default verifySignature(calendarUpstashUpdateRequestHandler);
