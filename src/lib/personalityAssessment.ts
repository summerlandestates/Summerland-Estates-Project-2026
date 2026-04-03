export type PersonalityDimension = 'energy' | 'information' | 'decision' | 'structure';

export interface PersonalityQuestionOption {
  value: string;
  label: string;
  weight: 1 | -1;
}

export interface PersonalityQuestion {
  id: string;
  dimension: PersonalityDimension;
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  options: [PersonalityQuestionOption, PersonalityQuestionOption];
}

export interface PersonalityAssessmentResult {
  type: string;
  headline: string;
  summary: string;
  workStyle: string;
  strengths: string[];
  dimensions: {
    energy: 'Extrovert' | 'Introvert';
    information: 'Intuitive' | 'Observant';
    decision: 'Thinking' | 'Feeling';
    structure: 'Judging' | 'Prospecting';
  };
  scores: Record<PersonalityDimension, number>;
  completedAt: string;
}

export const personalityQuestions: PersonalityQuestion[] = [
  {
    id: 'energy-1',
    dimension: 'energy',
    prompt: 'When work gets demanding, where do you naturally recharge?',
    leftLabel: 'Collaborative momentum',
    rightLabel: 'Quiet focus time',
    options: [
      { value: 'extrovert', label: 'I get energy from talking it through with people.', weight: 1 },
      { value: 'introvert', label: 'I do my best work when I can think privately first.', weight: -1 },
    ],
  },
  {
    id: 'energy-2',
    dimension: 'energy',
    prompt: 'In a new household or client environment, what feels most natural first?',
    leftLabel: 'Engage quickly',
    rightLabel: 'Observe first',
    options: [
      { value: 'extrovert', label: 'I connect quickly and build rapport right away.', weight: 1 },
      { value: 'introvert', label: 'I observe the room first and adapt carefully.', weight: -1 },
    ],
  },
  {
    id: 'information-1',
    dimension: 'information',
    prompt: 'How do you usually solve unfamiliar problems?',
    leftLabel: 'Patterns and possibilities',
    rightLabel: 'Facts and proven details',
    options: [
      { value: 'intuitive', label: 'I like spotting patterns and imagining better approaches.', weight: 1 },
      { value: 'observant', label: 'I trust concrete details and what has worked before.', weight: -1 },
    ],
  },
  {
    id: 'information-2',
    dimension: 'information',
    prompt: 'What kind of instructions help you most?',
    leftLabel: 'Big-picture direction',
    rightLabel: 'Step-by-step clarity',
    options: [
      { value: 'intuitive', label: 'Give me the vision and I can build the path.', weight: 1 },
      { value: 'observant', label: 'Give me the sequence and I will execute precisely.', weight: -1 },
    ],
  },
  {
    id: 'decision-1',
    dimension: 'decision',
    prompt: 'When making a difficult call, what leads first?',
    leftLabel: 'Objective logic',
    rightLabel: 'Human impact',
    options: [
      { value: 'thinking', label: 'I focus on what is fair, efficient, and defensible.', weight: 1 },
      { value: 'feeling', label: 'I focus on trust, harmony, and the people involved.', weight: -1 },
    ],
  },
  {
    id: 'decision-2',
    dimension: 'decision',
    prompt: 'What matters more in feedback conversations?',
    leftLabel: 'Direct clarity',
    rightLabel: 'Tone and relationship',
    options: [
      { value: 'thinking', label: 'Clear, direct truth helps everyone move faster.', weight: 1 },
      { value: 'feeling', label: 'Delivery matters as much as the message itself.', weight: -1 },
    ],
  },
  {
    id: 'structure-1',
    dimension: 'structure',
    prompt: 'How do you prefer to run your week?',
    leftLabel: 'Structured and planned',
    rightLabel: 'Flexible and adaptive',
    options: [
      { value: 'judging', label: 'I like decisions made early and systems locked in.', weight: 1 },
      { value: 'prospecting', label: 'I like room to adapt as priorities change.', weight: -1 },
    ],
  },
  {
    id: 'structure-2',
    dimension: 'structure',
    prompt: 'Which work environment fits you best?',
    leftLabel: 'Predictable cadence',
    rightLabel: 'Variety and movement',
    options: [
      { value: 'judging', label: 'I thrive when expectations and timing stay clear.', weight: 1 },
      { value: 'prospecting', label: 'I thrive when each day can evolve as needed.', weight: -1 },
    ],
  },
];

function getHeadline(type: string) {
  const headlines: Record<string, string> = {
    INTJ: 'Strategic Planner',
    INTP: 'Systems Thinker',
    ENTJ: 'Decisive Operator',
    ENTP: 'Creative Problem Solver',
    INFJ: 'Steady Guide',
    INFP: 'Values-Led Supporter',
    ENFJ: 'People-Centered Organizer',
    ENFP: 'Warm Connector',
    ISTJ: 'Reliable Executor',
    ISFJ: 'Trusted Caretaker',
    ESTJ: 'Structured Leader',
    ESFJ: 'Service-Focused Coordinator',
    ISTP: 'Practical Troubleshooter',
    ISFP: 'Calm Craftsperson',
    ESTP: 'Action-Oriented Fixer',
    ESFP: 'High-Touch Host',
  };

  return headlines[type] || 'Balanced Professional';
}

function getStrengths(type: string) {
  const defaultStrengths = ['Discretion', 'Dependability', 'Composure under pressure'];
  const strengths: Record<string, string[]> = {
    INTJ: ['Strategic planning', 'Independent judgment', 'Long-range thinking'],
    INTP: ['Analytical problem-solving', 'Systems thinking', 'Calm reasoning'],
    ENTJ: ['Leadership presence', 'Fast decision-making', 'High standards'],
    ENTP: ['Creative solutions', 'Adaptability', 'Opportunity spotting'],
    INFJ: ['Quiet leadership', 'Intuition about people', 'Meaningful follow-through'],
    INFP: ['Empathy', 'Values alignment', 'Thoughtful communication'],
    ENFJ: ['Team guidance', 'Client sensitivity', 'Warm coordination'],
    ENFP: ['Relationship building', 'Positive momentum', 'Adaptive communication'],
    ISTJ: ['Consistency', 'Operational discipline', 'Precision'],
    ISFJ: ['Loyalty', 'Service orientation', 'Attention to detail'],
    ESTJ: ['Organization', 'Execution speed', 'Accountability'],
    ESFJ: ['Hospitality', 'People management', 'Follow-up'],
    ISTP: ['Calm under pressure', 'Hands-on problem-solving', 'Resourcefulness'],
    ISFP: ['Tasteful execution', 'Composure', 'Personal care'],
    ESTP: ['Action bias', 'Situational awareness', 'Confidence'],
    ESFP: ['Presence', 'Guest experience', 'Natural warmth'],
  };

  return strengths[type] || defaultStrengths;
}

export function formatPersonalitySummary(result: PersonalityAssessmentResult) {
  return `${result.type} - ${result.headline}. ${result.summary}`;
}

export function computePersonalityAssessment(
  answers: Record<string, string>
): PersonalityAssessmentResult {
  const scores: Record<PersonalityDimension, number> = {
    energy: 0,
    information: 0,
    decision: 0,
    structure: 0,
  };

  for (const question of personalityQuestions) {
    const answer = answers[question.id];
    const option = question.options.find((item) => item.value === answer);
    if (option) {
      scores[question.dimension] += option.weight;
    }
  }

  const dimensions = {
    energy: scores.energy >= 0 ? 'Extrovert' : 'Introvert',
    information: scores.information >= 0 ? 'Intuitive' : 'Observant',
    decision: scores.decision >= 0 ? 'Thinking' : 'Feeling',
    structure: scores.structure >= 0 ? 'Judging' : 'Prospecting',
  } as const;

  const type = [
    dimensions.energy === 'Extrovert' ? 'E' : 'I',
    dimensions.information === 'Intuitive' ? 'N' : 'S',
    dimensions.decision === 'Thinking' ? 'T' : 'F',
    dimensions.structure === 'Judging' ? 'J' : 'P',
  ].join('');

  const headline = getHeadline(type);
  const strengths = getStrengths(type);
  const summary = `${headline} with a ${dimensions.energy.toLowerCase()} energy style, ${dimensions.information.toLowerCase()} information processing, ${dimensions.decision.toLowerCase()} decision-making, and a ${dimensions.structure.toLowerCase()} work rhythm.`;
  const workStyle = `${dimensions.energy} style, ${dimensions.information} focus, ${dimensions.decision} decision-making, ${dimensions.structure} structure`;

  return {
    type,
    headline,
    summary,
    workStyle,
    strengths,
    dimensions,
    scores,
    completedAt: new Date().toISOString(),
  };
}
