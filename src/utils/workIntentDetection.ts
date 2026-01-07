// Semantic detection for work-related intent in conversations
const workIntentKeywords = [
  'interview',
  'meeting',
  'meet up',
  'trial',
  'start date',
  'starting',
  'begin',
  'hire',
  'hired',
  'hiring',
  'position',
  'job',
  'offer',
  'accept',
  'contract',
  'agreement',
  'onboard',
  'first day',
  'schedule',
  'availability',
  'compensation',
  'salary',
  'rate',
  'terms',
  'employment',
  'work with',
  'join',
  'team'
];

export function detectWorkIntent(messages: string[]): boolean {
  const combinedText = messages.join(' ').toLowerCase();
  
  // Check for direct keyword matches
  const hasKeyword = workIntentKeywords.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  );
  
  // Check for common phrases
  const workPhrases = [
    'when can you start',
    'are you available',
    'would you be interested',
    'looking forward to working',
    'excited to work',
    'see you on',
    'let me know your availability',
    'discuss the position',
    'talk about the role'
  ];
  
  const hasPhrase = workPhrases.some(phrase => 
    combinedText.includes(phrase)
  );
  
  return hasKeyword || hasPhrase;
}

export function canShowConfirmHired(
  conversation: { participants: string[]; messages: any[] },
  listings: any[]
): boolean {
  // Check if conversation has work intent
  const messageTexts = conversation.messages.map(m => m.body);
  const hasWorkIntent = detectWorkIntent(messageTexts);
  
  if (!hasWorkIntent) return false;
  
  // Check if participants are eligible (one hiring, one professional)
  const participants = conversation.participants
    .map(id => listings.find(l => l.id === id))
    .filter(Boolean);
  
  if (participants.length !== 2) return false;
  
  const hiringRoles = ['Agency', 'Estates'];
  const professionalRoles = ['Staff', 'Vendor'];
  
  const hasHiringProfile = participants.some(p => 
    hiringRoles.includes(p.category) || p.profileStatus === 'actively-hiring'
  );
  
  const hasProfessionalProfile = participants.some(p => 
    professionalRoles.includes(p.category) || p.profileStatus === 'available-for-hire'
  );
  
  return hasHiringProfile && hasProfessionalProfile;
}
