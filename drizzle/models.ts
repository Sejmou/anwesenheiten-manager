import { InferModel } from 'drizzle-orm';
import {
  googleDriveFile,
  attachmentType,
  setlist,
  song,
  songAttachment,
} from './schema';

export type SongAttachment = InferModel<typeof songAttachment, 'insert'>;
export type AudioFileAttachment = SongAttachment & {
  type: SelectByPrefix<FileAttachmentType, 'Audio'>;
  downloadUrl: string;
};
export type WeblinkType = Extract<AttachmentType, 'YouTube' | 'Other'>;
export type FileAttachmentType = Exclude<AttachmentType, WeblinkType>;
export type FileAttachment = SongAttachment & {
  type: FileAttachmentType;
  downloadUrl: string;
};
export type WeblinkAttachment = SongAttachment & {
  type: WeblinkType;
};
type SelectByPrefix<T extends string, Prefix extends string> = Extract<
  T,
  `${Prefix}${string}`
>;

export function isFileAttachment(
  attachment: SongAttachment
): attachment is FileAttachment {
  return !isWeblinkAttachment(attachment);
}

export function isAudioFileAttachment(
  attachment: SongAttachment
): attachment is AudioFileAttachment {
  return attachment.type.startsWith('Audio');
}

export function isWeblinkAttachment(
  attachment: SongAttachment
): attachment is WeblinkAttachment {
  return attachment.type === 'YouTube' || attachment.type === 'Other';
}

export type AttachmentType = InferModel<typeof songAttachment>['type'];
export const attachmentTypeValues = attachmentType.enumValues;
export const webLinkAttachmentTypeValues = attachmentTypeValues.filter(
  type => type === 'YouTube' || type === 'Other'
) as WeblinkType[];
export const fileAttachmentTypeValues = attachmentTypeValues.filter(
  type => !webLinkAttachmentTypeValues.includes(type as any)
) as FileAttachmentType[];

export type Song = InferModel<typeof song>;

export type Setlist = InferModel<typeof setlist>;

export type SongWithAttachments = Song & {
  attachments: Array<SongAttachment>;
};

export type GoogleDriveFile = InferModel<typeof googleDriveFile>;
export type DriveFileWithAttachment = GoogleDriveFile & {
  attachment: SongAttachment; // TODO: figure out how to model optional relationship in drizzle/relations.ts
};
export type NewGoogleDriveFile = InferModel<typeof googleDriveFile, 'insert'>;
