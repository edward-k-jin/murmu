export type GroupRole = 'admin' | 'member';

export type GroupSummary = {
  id: string;
  name: string;
  role: GroupRole;
  activeMemberCount: number;
  memberLimit: number;
};

export type InvitePreview = {
  state: 'valid' | 'invalid' | 'expired' | 'revoked' | 'full' | 'already_joined';
  groupName: string | null;
  adminNickname: string | null;
  activeMemberCount: number | null;
  memberLimit: number | null;
  expiresAt: string | null;
};

export type GroupInvite = {
  code: string;
  deepLink: string;
  expiresAt: string;
};

export type MoodCode = 'calm' | 'happy' | 'tired' | 'sad' | 'hopeful';

export type GroupMember = {
  userId: string;
  nickname: string;
  role: GroupRole;
  joinedAt: string;
  todayMood: MoodCode | null;
};

export type FeedItem = {
  id: string;
  authorId: string;
  authorNickname: string;
  authorIsActive: boolean;
  moodCode: MoodCode;
  status: 'scheduled' | 'published';
  body: string | null;
  scheduledFor: string | null;
  publishedAt: string | null;
  createdAt: string;
  threadCount: number;
};

export type ScheduledMonologue = {
  id: string;
  groupId: string;
  moodCode: MoodCode;
  body: string;
  scheduledFor: string;
};

export type PublishedMonologue = {
  id: string;
  authorId: string;
  authorNickname: string;
  authorIsActive: boolean;
  moodCode: MoodCode;
  body: string;
  publishedAt: string;
  createdAt: string;
};

export type ThreadMessage = {
  id: string;
  senderId: string;
  senderNickname: string;
  senderIsActive: boolean;
  body: string;
  createdAt: string;
};
