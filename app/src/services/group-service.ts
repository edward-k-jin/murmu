import { isDemoMode, requireSupabase } from '@/lib/supabase';
import type {
  FeedItem,
  GroupInvite,
  GroupMember,
  GroupSummary,
  InvitePreview,
  MoodCode,
  PublishedMonologue,
  ScheduledMonologue,
  ThreadMessage,
} from '@/types/groups';

type GroupRow = {
  group_id: string;
  group_name: string;
  member_role: 'admin' | 'member';
  active_member_count: number;
  member_limit: number;
};

const DEMO_GROUPS: GroupSummary[] = [
  { id: 'demo-space-woori', name: '우리 둘', role: 'admin', activeMemberCount: 2, memberLimit: 2 },
  { id: 'demo-space-friend', name: '민서와 나', role: 'member', activeMemberCount: 2, memberLimit: 2 },
];

const DEMO_FEED: FeedItem[] = [
  {
    id: 'demo-monologue-open',
    authorId: '00000000-0000-4000-8000-000000000001',
    authorNickname: '나',
    authorIsActive: true,
    moodCode: 'calm',
    status: 'published',
    body: '오늘은 조금 천천히 가고 싶어요. 말로 바로 꺼내기엔 아직 정리가 덜 됐지만, 그래도 너한테는 남겨두고 싶었어요.',
    scheduledFor: null,
    publishedAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    threadCount: 2,
  },
  {
    id: 'demo-monologue-locked',
    authorId: 'demo-partner',
    authorNickname: '민서',
    authorIsActive: true,
    moodCode: 'hopeful',
    status: 'scheduled',
    body: null,
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    publishedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    threadCount: 0,
  },
];

const DEMO_THREADS: ThreadMessage[] = [
  {
    id: 'demo-thread-1',
    senderId: '00000000-0000-4000-8000-000000000001',
    senderNickname: '나',
    senderIsActive: true,
    body: '천천히 말해줘도 괜찮아요.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'demo-thread-2',
    senderId: 'demo-partner',
    senderNickname: '민서',
    senderIsActive: true,
    body: '고마워요. 오늘은 이 정도만 남기고 싶었어요.',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
];

function mapGroup(row: GroupRow): GroupSummary {
  return {
    id: row.group_id,
    name: row.group_name,
    role: row.member_role,
    activeMemberCount: row.active_member_count,
    memberLimit: row.member_limit,
  };
}

export async function upsertProfile(nickname: string, timezone: string) {
  if (isDemoMode) {
    void nickname;
    void timezone;
    return;
  }
  const { error } = await requireSupabase().rpc('upsert_profile', {
    p_birth_date: null,
    p_nickname: nickname,
    p_timezone: timezone,
  });
  if (error) throw error;
}

export async function listMyGroups() {
  if (isDemoMode) return DEMO_GROUPS;
  const { data, error } = await requireSupabase().rpc('list_my_groups');
  if (error) throw error;
  return ((data ?? []) as GroupRow[]).map(mapGroup);
}

export async function createGroup(name: string, clientRequestId: string) {
  if (isDemoMode) {
    void clientRequestId;
    return { id: `demo-space-${Date.now()}`, name, role: 'admin', activeMemberCount: 1, memberLimit: 2 } satisfies GroupSummary;
  }
  const { data, error } = await requireSupabase().rpc('create_group', {
    p_client_request_id: clientRequestId,
    p_name: name,
  });
  if (error) throw error;
  return mapGroup((data as GroupRow[])[0]);
}

export async function createGroupInvite(groupId: string) {
  if (isDemoMode) {
    void groupId;
    return {
      code: 'A1B2C3D4E5',
      deepLink: 'murmu://invite/A1B2C3D4E5',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    } satisfies GroupInvite;
  }
  const { data, error } = await requireSupabase().rpc('create_group_invite', {
    p_group_id: groupId,
  });
  if (error) throw error;
  const row = (data as { code: string; deep_link: string; expires_at: string }[])[0];
  return { code: row.code, deepLink: row.deep_link, expiresAt: row.expires_at } satisfies GroupInvite;
}

export async function previewGroupInvite(code: string) {
  if (isDemoMode) {
    return {
      state: code.trim() ? 'valid' : 'invalid',
      groupName: '우리 둘',
      adminNickname: '민서',
      activeMemberCount: 1,
      memberLimit: 2,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    } satisfies InvitePreview;
  }
  const { data, error } = await requireSupabase().rpc('preview_group_invite', { p_code: code });
  if (error) throw error;
  const row = (data as {
    state: InvitePreview['state'];
    group_name: string | null;
    admin_nickname: string | null;
    active_member_count: number | null;
    member_limit: number | null;
    expires_at: string | null;
  }[])[0];
  return {
    state: row.state,
    groupName: row.group_name,
    adminNickname: row.admin_nickname,
    activeMemberCount: row.active_member_count,
    memberLimit: row.member_limit,
    expiresAt: row.expires_at,
  } satisfies InvitePreview;
}

export async function acceptGroupInvite(code: string, clientRequestId: string) {
  if (isDemoMode) {
    void code;
    void clientRequestId;
    return DEMO_GROUPS[0];
  }
  const { data, error } = await requireSupabase().rpc('accept_group_invite', {
    p_client_request_id: clientRequestId,
    p_code: code,
  });
  if (error) throw error;
  return mapGroup((data as GroupRow[])[0]);
}

export async function getGroupMembers(groupId: string, localDate: string) {
  if (isDemoMode) {
    void groupId;
    void localDate;
    return [
      {
        userId: '00000000-0000-4000-8000-000000000001',
        nickname: '나',
        role: 'admin',
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        todayMood: 'calm',
      },
      {
        userId: 'demo-partner',
        nickname: '민서',
        role: 'member',
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        todayMood: 'hopeful',
      },
    ] satisfies GroupMember[];
  }
  const { data, error } = await requireSupabase().rpc('get_group_members', {
    p_group_id: groupId,
    p_local_date: localDate,
  });
  if (error) throw error;
  return ((data ?? []) as {
    user_id: string;
    nickname: string;
    member_role: 'admin' | 'member';
    joined_at: string;
    today_mood: MoodCode | null;
  }[]).map((row) => ({
    userId: row.user_id,
    nickname: row.nickname,
    role: row.member_role,
    joinedAt: row.joined_at,
    todayMood: row.today_mood,
  } satisfies GroupMember));
}

export async function upsertGroupMood(groupId: string, localDate: string, timezone: string, moodCode: MoodCode) {
  if (isDemoMode) {
    void groupId;
    void localDate;
    void timezone;
    void moodCode;
    return;
  }
  const { error } = await requireSupabase().rpc('upsert_group_mood', {
    p_group_id: groupId,
    p_local_date: localDate,
    p_timezone: timezone,
    p_mood_code: moodCode,
  });
  if (error) throw error;
}

export async function listGroupFeed(groupId: string) {
  if (isDemoMode) {
    void groupId;
    return DEMO_FEED;
  }
  const { data, error } = await requireSupabase().rpc('list_group_feed', { p_group_id: groupId });
  if (error) throw error;
  return ((data ?? []) as {
    monologue_id: string;
    author_id: string;
    author_nickname: string;
    author_is_active: boolean;
    mood_code: MoodCode;
    monologue_status: 'scheduled' | 'published';
    body: string | null;
    scheduled_for: string | null;
    published_at: string | null;
    created_at: string;
    thread_count: number;
  }[]).map((row) => ({
    id: row.monologue_id,
    authorId: row.author_id,
    authorNickname: row.author_nickname,
    authorIsActive: row.author_is_active,
    moodCode: row.mood_code,
    status: row.monologue_status,
    body: row.body,
    scheduledFor: row.scheduled_for,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    threadCount: row.thread_count,
  } satisfies FeedItem));
}

export async function createMonologue(input: {
  groupId: string;
  clientRequestId: string;
  moodCode: MoodCode;
  body: string;
  publishMode: 'immediate' | 'scheduled';
  scheduledFor: string | null;
}) {
  if (isDemoMode) {
    void input;
    return `demo-monologue-${Date.now()}`;
  }
  const { data, error } = await requireSupabase().rpc('create_monologue', {
    p_group_id: input.groupId,
    p_client_request_id: input.clientRequestId,
    p_mood_code: input.moodCode,
    p_body: input.body,
    p_publish_mode: input.publishMode,
    p_scheduled_for: input.scheduledFor,
  });
  if (error) throw error;
  return (data as { monologue_id: string }[])[0].monologue_id;
}

export async function getScheduledMonologue(monologueId: string) {
  if (isDemoMode) {
    void monologueId;
    return {
      id: 'demo-monologue-locked',
      groupId: DEMO_GROUPS[0].id,
      moodCode: 'hopeful',
      body: '조금 더 정리되면 보여주고 싶은 마음이에요.',
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    } satisfies ScheduledMonologue;
  }
  const { data, error } = await requireSupabase().rpc('get_scheduled_monologue', { p_monologue_id: monologueId });
  if (error) throw error;
  const row = (data as {
    monologue_id: string;
    group_id: string;
    mood_code: MoodCode;
    body: string;
    scheduled_for: string;
  }[])[0];
  return {
    id: row.monologue_id,
    groupId: row.group_id,
    moodCode: row.mood_code,
    body: row.body,
    scheduledFor: row.scheduled_for,
  } satisfies ScheduledMonologue;
}

export async function updateScheduledMonologue(monologueId: string, moodCode: MoodCode, body: string, scheduledFor: string) {
  if (isDemoMode) {
    void monologueId;
    void moodCode;
    void body;
    void scheduledFor;
    return;
  }
  const { error } = await requireSupabase().rpc('update_scheduled_monologue', {
    p_monologue_id: monologueId,
    p_mood_code: moodCode,
    p_body: body,
    p_scheduled_for: scheduledFor,
  });
  if (error) throw error;
}

export async function cancelScheduledMonologue(monologueId: string) {
  if (isDemoMode) {
    void monologueId;
    return;
  }
  const { error } = await requireSupabase().rpc('cancel_scheduled_monologue', { p_monologue_id: monologueId });
  if (error) throw error;
}

export async function getPublishedMonologue(groupId: string, monologueId: string) {
  if (isDemoMode) {
    void groupId;
    const item = DEMO_FEED.find((entry) => entry.id === monologueId && entry.status === 'published') ?? DEMO_FEED[0];
    return {
      id: item.id,
      authorId: item.authorId,
      authorNickname: item.authorNickname,
      authorIsActive: item.authorIsActive,
      moodCode: item.moodCode,
      body: item.body ?? '',
      publishedAt: item.publishedAt ?? item.createdAt,
      createdAt: item.createdAt,
    } satisfies PublishedMonologue;
  }
  const { data, error } = await requireSupabase().rpc('get_published_monologue', {
    p_group_id: groupId,
    p_monologue_id: monologueId,
  });
  if (error) throw error;
  const row = (data as {
    monologue_id: string;
    author_id: string;
    author_nickname: string;
    author_is_active: boolean;
    mood_code: MoodCode;
    body: string;
    published_at: string;
    created_at: string;
  }[])[0];
  return {
    id: row.monologue_id,
    authorId: row.author_id,
    authorNickname: row.author_nickname,
    authorIsActive: row.author_is_active,
    moodCode: row.mood_code,
    body: row.body,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  } satisfies PublishedMonologue;
}

export async function listThreadMessages(groupId: string, monologueId: string) {
  if (isDemoMode) {
    void groupId;
    void monologueId;
    return DEMO_THREADS;
  }
  const { data, error } = await requireSupabase().rpc('list_thread_messages', {
    p_group_id: groupId,
    p_monologue_id: monologueId,
  });
  if (error) throw error;
  return ((data ?? []) as {
    message_id: string;
    sender_id: string;
    sender_nickname: string;
    sender_is_active: boolean;
    body: string;
    created_at: string;
  }[]).map((row) => ({
    id: row.message_id,
    senderId: row.sender_id,
    senderNickname: row.sender_nickname,
    senderIsActive: row.sender_is_active,
    body: row.body,
    createdAt: row.created_at,
  } satisfies ThreadMessage));
}

export async function sendThreadMessage(groupId: string, monologueId: string, clientRequestId: string, body: string) {
  if (isDemoMode) {
    void groupId;
    void monologueId;
    void clientRequestId;
    void body;
    return;
  }
  const { error } = await requireSupabase().rpc('send_thread_message', {
    p_group_id: groupId,
    p_monologue_id: monologueId,
    p_client_request_id: clientRequestId,
    p_body: body,
  });
  if (error) throw error;
}
