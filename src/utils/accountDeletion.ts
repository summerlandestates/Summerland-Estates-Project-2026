import type { Conversation, HireStatus } from '../types';

export function canDeleteAccount(
  userId: string,
  conversations: Conversation[]
): { allowed: boolean; reason?: string; unresolvedConversations?: string[] } {
  // Find all conversations involving this user
  const userConversations = conversations.filter(c => 
    c.participants.includes(userId)
  );

  // Check for unresolved hire statuses
  const unresolvedStatuses: HireStatus[] = ['pending-confirmation', 'disputed'];
  const unresolvedConversations = userConversations.filter(c => 
    c.hasWorkIntent && unresolvedStatuses.includes(c.hireStatus)
  );

  if (unresolvedConversations.length > 0) {
    return {
      allowed: false,
      reason: 'Before deleting your account, please confirm whether you were hired for any work discussed on this platform.',
      unresolvedConversations: unresolvedConversations.map(c => c.id)
    };
  }

  return { allowed: true };
}

export function getAccountDeletionBlockMessage(
  profileCategory: string,
  profileStatus?: string
): string {
  const isHiringProfile = 
    profileCategory === 'Agency' || 
    profileCategory === 'Estates' ||
    profileStatus === 'actively-hiring';

  if (isHiringProfile) {
    return 'Before deleting your account, please confirm whether you hired anyone through this platform.';
  }

  return 'Before deleting your account, please confirm whether you were hired for any work discussed on this platform.';
}
