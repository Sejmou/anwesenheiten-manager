import { NextApiHandler, NextApiResponse } from 'next';
import { verifySignature } from '@upstash/qstash/nextjs';
import { syncCalendar } from './sync';

export const calendarUpstashUpdateRequestHandler: NextApiHandler = async (
  req,
  res: NextApiResponse
) => {
  try {
    await syncCalendar();
    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
};

export default verifySignature(calendarUpstashUpdateRequestHandler);
