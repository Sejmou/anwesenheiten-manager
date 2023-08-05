import { InferModel } from 'drizzle-orm';
import { songFile } from './schema';

export type SongFile = InferModel<typeof songFile, 'insert'>;
