import { NextApiHandler, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '../../../lib/prisma';
import { google } from 'googleapis';
import moment from 'moment-timezone';

const choirCalendarId = 'qshfu0pshf6u7emr0f7pn80a3c@group.calendar.google.com';

export const calendarUpdateRequestHandler: NextApiHandler = async (
  req,
  res: NextApiResponse
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
      const calendar = google.calendar({
        version: 'v3',
        auth: process.env.GOOGLE_API_KEY,
      });
      const apiRes = await calendar.events.list({
        calendarId: choirCalendarId,
        timeMin: new Date(2022, 2).toISOString(),
        maxResults: 2500, //largest possible value
        singleEvents: true, // important to make sure recurring events are returned as separate events
      });

      const { items: events, timeZone: timeZoneVal } = apiRes.data;

      if (!events || events.length === 0) {
        console.log('No upcoming events found.');
        return;
      }

      const timeZone = timeZoneVal ?? 'Europe/Vienna';

      const parsedEvents = events
        .map((event, i) => {
          const start = event?.start?.dateTime || event?.start?.date;
          if (!start) {
            console.log('Encountered event without start date, skipping...');
            return;
          }
          const end = event?.end?.dateTime || event?.end?.date;
          if (!end) {
            console.log('Encountered event without end date, skipping...');
            return;
          }

          const { summary, description, location, id } = event;

          if (!id) {
            console.error(
              'Encountered event without ID, something really weird is going on lol'
            );
            return;
          }

          if (!summary) {
            console.error(
              'Encountered event without summary, something really weird is going on lol'
            );
            return;
          }

          return {
            id,
            summary,
            description: description ?? null,
            location: location ?? null,
            start: moment(start).tz(timeZone).toDate(),
            end: moment(end).tz(timeZone).toDate(),
          };
        })
        .filter(el => el !== undefined) as {
        id: string;
        summary: string;
        description: string | null;
        location: string | null;
        start: Date;
        end: Date;
      }[];

      await Promise.allSettled(
        parsedEvents.map(({ id, description, start, end, location, summary }) =>
          prisma.event.upsert({
            where: { id },
            update: {
              description,
              start,
              end,
              lastSyncAt: new Date(),
              location,
              summary,
            },
            create: {
              id,
              description,
              start,
              end,
              lastSyncAt: new Date(),
              location,
              summary,
            },
          })
        )
      );

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

export default calendarUpdateRequestHandler;
