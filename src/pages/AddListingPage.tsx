import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, ArrowLeft, ArrowRight, Check, User, Building2, Briefcase, Home, Shield, FileText, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { getPlansByUserType } from '../data/pricing';
import { submitMembershipApplication } from '@/lib/membershipApplication';
import { isComplimentaryTier } from '@/lib/membership';
import PersonalityAssessmentDialog from '@/components/PersonalityAssessmentDialog';
import { formatPersonalitySummary, type PersonalityAssessmentResult } from '@/lib/personalityAssessment';
import { parseResumeFile, type ResumeParseResult } from '@/lib/resumeParser';
import { professionalTitles, genderOptions, languages, workAvailability, workPreference, certifications, animalExperience, comfortLevels, cookingExperience } from '../data/profileOptions';
import type { OnboardingType, OnboardingStep, UserType, PricingTier, ApplicationFormData, SerializedApplicationData, CheckoutData } from '../types';

type ProfileType = 'professional' | 'service-provider' | 'agency' | 'estates' | null;
type EstatesSubType = 'estate-manager' | 'chief-of-staff' | 'personal-assistant' | 'executive-assistant' | 'principal' | null;

interface UploadPreviewItem {
  name: string;
  size: number;
  type: string;
  previewUrl: string | null;
}

type ResumeParserState = 'idle' | 'parsing' | 'success' | 'error';

const APPLICATION_UPLOAD_BUCKET = import.meta.env.VITE_APPLICATION_UPLOAD_BUCKET || 'avatars';

const profileTypeToUserType: { [key: string]: UserType } = {
  'professional': 'professional',
  'service-provider': 'business',
  'agency': 'agency',
  'estates': 'estates'
};

const professionalSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome',
    content: 'A private network for professionals trusted in discreet households.'
  },
  {
    id: 2,
    title: 'Positioning',
    content: 'This is not a public job board.',
    subContent: 'Profiles are reviewed.\nPlacements are selective.\nVisibility is controlled.'
  },
  {
    id: 3,
    title: 'What Membership Provides',
    content: 'Membership may include access to private placements, controlled visibility, and private correspondence.',
    note: 'Access varies by membership level.'
  },
  {
    id: 4,
    title: 'Standards Notice',
    content: 'Discretion is a requirement.\nContent that compromises trust is removed.\nMembership may be revoked at any time.',
    buttonText: 'I Understand'
  }
];

const serviceProviderSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome',
    content: 'A trusted environment for businesses serving private estates.'
  },
  {
    id: 2,
    title: 'Positioning',
    content: 'This is not advertising. Businesses are presented by reputation and alignment.'
  },
  {
    id: 3,
    title: 'What Participation Provides',
    content: 'Participation may include quiet visibility, association with a vetted network, and opportunity-based exposure.'
  },
  {
    id: 4,
    title: 'Standards Notice',
    content: 'Discretion is a requirement.\nContent that compromises trust is removed.\nMembership may be revoked at any time.',
    buttonText: 'I Understand'
  }
];

const agencySteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome',
    content: 'A considered framework for private placements.'
  },
  {
    id: 2,
    title: 'Positioning',
    content: 'Volume is not the objective. Introductions are intentional. Reputation is protected.'
  },
  {
    id: 3,
    title: 'What Participation Provides',
    content: 'Introduction to a vetted network.\nA structured environment for private placements.\nPlatform standards that protect credibility.'
  },
  {
    id: 4,
    title: 'Standards Notice',
    content: 'Discretion is a requirement.\nContent that compromises trust is removed.\nMembership may be revoked at any time.',
    buttonText: 'I Understand'
  }
];

const estatesSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome',
    content: 'A secure environment for private hiring.'
  },
  {
    id: 2,
    title: 'Positioning',
    content: 'This is not public hiring. Placements may remain anonymous. Visibility is controlled.'
  },
  {
    id: 3,
    title: 'What the Network Supports',
    content: 'The network supports vetted professionals, private placement workflows, and controlled correspondence.',
    note: 'Tools and correspondence access depend on membership level.'
  },
  {
    id: 4,
    title: 'Standards Notice',
    content: 'Discretion is a requirement.\nContent that compromises trust is removed.\nMembership may be revoked at any time.',
    buttonText: 'I Understand'
  }
];

async function uploadApplicationFile(file: File, key: string, profileType: NonNullable<ProfileType>) {
  const response = await fetch('/api/application-upload', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'x-file-name': file.name,
      'x-file-type': file.type || 'application/octet-stream',
      'x-profile-type': profileType,
      'x-field-key': key,
    },
    body: file,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error ||
        `Unable to upload ${file.name}. Please ensure the API server is running and "${APPLICATION_UPLOAD_BUCKET}" is configured.`
    );
  }

  return {
    name: result.name || file.name,
    size: typeof result.size === 'number' ? result.size : file.size,
    type: result.type || file.type,
    storagePath: result.storagePath || null,
    publicUrl: result.publicUrl || null,
  };
}

async function serializeApplicationForm(
  formData: FormData,
  profileType: NonNullable<ProfileType>,
  selectedTier: PricingTier
): Promise<SerializedApplicationData> {
  const serializedData: SerializedApplicationData = {
    profile_type: profileType,
    selected_tier: selectedTier,
  };

  const groupedEntries = new Map<string, FormDataEntryValue[]>();

  for (const [key, value] of formData.entries()) {
    const currentValues = groupedEntries.get(key) ?? [];
    currentValues.push(value);
    groupedEntries.set(key, currentValues);
  }

  for (const [key, values] of groupedEntries.entries()) {
    if (key === 'account_password' || key === 'confirm_password') {
      continue;
    }

    const fileValues = values.filter((value): value is File => value instanceof File && value.name);

    if (fileValues.length > 0) {
      serializedData[key] = await Promise.all(
        fileValues.map((file) => uploadApplicationFile(file, key, profileType))
      );
      continue;
    }

    const normalizedValues = values
      .filter((value): value is string => typeof value === 'string')
      .map((value) => (value === 'on' ? 'true' : value));

    if (normalizedValues.length === 1) {
      serializedData[key] = normalizedValues[0] === 'true' ? true : normalizedValues[0];
    } else if (normalizedValues.length > 1) {
      serializedData[key] = normalizedValues;
    }
  }

  return serializedData;
}

export default function AddListingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [estatesSubType, setEstatesSubType] = useState<EstatesSubType>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeInfo, setPromoCodeInfo] = useState<{ id: string; tier: string; code: string } | null>(null);
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState('');
  const [showPricing, setShowPricing] = useState(false);
  const [formData, setFormData] = useState<Partial<ApplicationFormData>>({});
  const [isCommunityOnly, setIsCommunityOnly] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [showStandardsNotice, setShowStandardsNotice] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [filePreviews, setFilePreviews] = useState<Record<string, UploadPreviewItem[]>>({});
  const [resumeParserState, setResumeParserState] = useState<ResumeParserState>('idle');
  const [resumeParserMessage, setResumeParserMessage] = useState<string | null>(null);
  const [resumeInsights, setResumeInsights] = useState<ResumeParseResult | null>(null);
  const [resumeAutofilledFields, setResumeAutofilledFields] = useState<string[]>([]);
  const [personalityDialogOpen, setPersonalityDialogOpen] = useState(false);
  const [personalityResult, setPersonalityResult] = useState<PersonalityAssessmentResult | null>(null);
  const totalFormSteps = 3;
  const formRef = useRef<HTMLFormElement>(null);
  const sectionCardClassName = 'rounded-[32px] border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6';
  const sectionBodyClassName = 'space-y-4 md:space-y-5 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto xl:pr-3';
  const accountFormSteps = [
    { id: 1, title: 'Basic Information', description: 'Profile essentials', icon: User },
    { id: 2, title: 'Professional Details', description: 'Experience and preferences', icon: Briefcase },
    { id: 3, title: 'Contact & Account', description: 'Verification and final review', icon: Building2 },
  ];

  const revokePreviewUrls = (items: UploadPreviewItem[]) => {
    items.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  };

  const getNamedField = (name: string) =>
    formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`) ?? null;

  const hasContactLikeContent = (value?: string) =>
    Boolean(value && /https?:\/\/|@[A-Z0-9.-]+\.[A-Z]{2,}|(?:\+?\d{1,2}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?){2}\d{4}/i.test(value));

  const getSafeResumeSummary = (parsedResume: ResumeParseResult) =>
    parsedResume.summary && !hasContactLikeContent(parsedResume.summary) ? parsedResume.summary : undefined;

  const getSafeResumeSkills = (parsedResume: ResumeParseResult) =>
    parsedResume.skills.filter((skill) => !hasContactLikeContent(skill)).join(', ');

  const setFieldValueIfEmpty = (name: string, value: string | undefined, label: string) => {
    if (!value) return null;

    const field = getNamedField(name);
    if (!field) return null;

    const currentValue = field.value?.trim();
    if (currentValue) {
      return null;
    }

    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    return label;
  };

  const applyResumeAutofill = (parsedResume: ResumeParseResult) => {
    const safeSummary = getSafeResumeSummary(parsedResume);
    const safeSkills = getSafeResumeSkills(parsedResume);

    const appliedFields = [
      setFieldValueIfEmpty('name', parsedResume.name, 'Name'),
      setFieldValueIfEmpty('email', parsedResume.email, 'Email'),
      setFieldValueIfEmpty('phone', parsedResume.phone, 'Phone'),
      setFieldValueIfEmpty('location', parsedResume.location, 'Location'),
      setFieldValueIfEmpty('linkedin_url', parsedResume.linkedinUrl, 'LinkedIn'),
      setFieldValueIfEmpty('website_url', parsedResume.websiteUrl, 'Website'),
      setFieldValueIfEmpty('portfolio_url', parsedResume.portfolioUrl, 'Portfolio URL'),
      setFieldValueIfEmpty('bio', safeSummary, 'Profile Summary'),
      setFieldValueIfEmpty('skills', safeSkills, 'Skills'),
      setFieldValueIfEmpty('skills_summary', safeSkills, 'Skills Summary'),
      setFieldValueIfEmpty('years_experience', parsedResume.yearsExperience, 'Years Experience'),
      setFieldValueIfEmpty('experience', parsedResume.yearsExperience, 'Experience'),
      setFieldValueIfEmpty('work_title_1', parsedResume.workHistory[0]?.title, 'Work History 1'),
      setFieldValueIfEmpty('work_employer_1', parsedResume.workHistory[0]?.employer, 'Employer 1'),
      setFieldValueIfEmpty('work_start_1', parsedResume.workHistory[0]?.startDate, 'Work Start 1'),
      setFieldValueIfEmpty('work_end_1', parsedResume.workHistory[0]?.endDate === 'Present' ? '' : parsedResume.workHistory[0]?.endDate, 'Work End 1'),
      setFieldValueIfEmpty('work_description_1', parsedResume.workHistory[0]?.description, 'Work Description 1'),
      setFieldValueIfEmpty('work_title_2', parsedResume.workHistory[1]?.title, 'Work History 2'),
      setFieldValueIfEmpty('work_employer_2', parsedResume.workHistory[1]?.employer, 'Employer 2'),
      setFieldValueIfEmpty('work_start_2', parsedResume.workHistory[1]?.startDate, 'Work Start 2'),
      setFieldValueIfEmpty('work_end_2', parsedResume.workHistory[1]?.endDate === 'Present' ? '' : parsedResume.workHistory[1]?.endDate, 'Work End 2'),
      setFieldValueIfEmpty('work_description_2', parsedResume.workHistory[1]?.description, 'Work Description 2'),
      setFieldValueIfEmpty('ref_name_1', parsedResume.references[0]?.name, 'Reference 1'),
      setFieldValueIfEmpty('ref_phone_1', parsedResume.references[0]?.phone, 'Reference Phone 1'),
      setFieldValueIfEmpty('ref_email_1', parsedResume.references[0]?.email, 'Reference Email 1'),
      setFieldValueIfEmpty('ref_name_2', parsedResume.references[1]?.name, 'Reference 2'),
      setFieldValueIfEmpty('ref_phone_2', parsedResume.references[1]?.phone, 'Reference Phone 2'),
      setFieldValueIfEmpty('ref_email_2', parsedResume.references[1]?.email, 'Reference Email 2'),
    ].filter(Boolean) as string[];

    setResumeAutofilledFields(appliedFields);

    return appliedFields;
  };

  const handleResumeAutofill = async (file?: File) => {
    if (!file) {
      setResumeParserState('idle');
      setResumeParserMessage(null);
      setResumeInsights(null);
      setResumeAutofilledFields([]);
      return;
    }

    setResumeParserState('parsing');
    setResumeParserMessage('Reading your resume and matching details to the form...');

    try {
      const parsedResume = await parseResumeFile(file);
      setResumeInsights(parsedResume);

      const usefulSignals = [
        parsedResume.name,
        parsedResume.email,
        parsedResume.phone,
        parsedResume.location,
        parsedResume.linkedinUrl,
        parsedResume.websiteUrl,
        parsedResume.portfolioUrl,
        parsedResume.summary,
        parsedResume.yearsExperience,
        parsedResume.skills.length > 0 ? 'skills' : '',
        parsedResume.workHistory.length > 0 ? 'work-history' : '',
        parsedResume.references.length > 0 ? 'references' : '',
      ].filter(Boolean).length;

      if (parsedResume.rawText.length < 80 && usefulSignals < 2) {
        setResumeParserState('error');
        setResumeParserMessage('The resume uploaded successfully, but there was not enough readable text to auto-fill fields.');
        setResumeAutofilledFields([]);
        return;
      }

      const appliedFields = applyResumeAutofill(parsedResume);
      if (appliedFields.length === 0 && usefulSignals < 2) {
        setResumeParserState('error');
        setResumeParserMessage('The resume was uploaded, but this file did not contain clean readable text for reliable auto-fill.');
        return;
      }

      setResumeParserState('success');
      setResumeParserMessage(
        appliedFields.length > 0
          ? `We filled ${appliedFields.length} field${appliedFields.length === 1 ? '' : 's'} from your resume.`
          : 'The resume was read successfully, but your existing entries were kept where fields were already filled.'
      );

      toast.success('Resume processed', {
        description:
          appliedFields.length > 0
            ? `Auto-filled: ${appliedFields.slice(0, 4).join(', ')}${appliedFields.length > 4 ? '...' : ''}`
            : 'Your resume was uploaded and reviewed. No blank fields needed to be filled.',
      });
    } catch (error: any) {
      setResumeParserState('error');
      setResumeParserMessage(error.message || 'We could not extract readable text from this file.');
      setResumeAutofilledFields([]);
      toast.error('Resume parsing failed', {
        description: error.message || 'The file still uploaded, but auto-fill could not run.',
      });
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputName = event.target.name;
    const selectedFiles = Array.from(event.target.files ?? []);

    setFilePreviews((current) => {
      const previousItems = current[inputName] ?? [];
      revokePreviewUrls(previousItems);

      return {
        ...current,
        [inputName]: selectedFiles.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        })),
      };
    });

    if (inputName === 'resume') {
      void handleResumeAutofill(selectedFiles[0]);
    }
  };

  const renderFilePreview = (inputName: string) => {
    const files = filePreviews[inputName];

    if (!files?.length) {
      return null;
    }

    return (
      <div className="mt-3 space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Selected file{files.length > 1 ? 's' : ''}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {files.map((file) => {
            const isImage = Boolean(file.previewUrl);

            return (
              <div
                key={`${inputName}-${file.name}-${file.size}`}
                className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20"
              >
                {isImage ? (
                  <div className="aspect-[4/3] overflow-hidden bg-muted/40">
                    <img
                      src={file.previewUrl ?? undefined}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F0EA] text-[#8A8279]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Document ready</p>
                      <p className="text-xs text-muted-foreground">Preview available after submission</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1 px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isImage ? (
                      <ImageIcon className="h-4 w-4 text-[#8A8279]" />
                    ) : (
                      <FileText className="h-4 w-4 text-[#8A8279]" />
                    )}
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                    {file.type ? ` • ${file.type}` : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const focusFormStep = (step: number) => {
    setFormStep(step);
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  const validateCurrentFormStep = () => {
    const stepElement = formRef.current?.querySelector<HTMLElement>(`[data-form-step="${formStep}"]`);
    if (!stepElement) return true;

    const fields = Array.from(
      stepElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')
    );

    for (const field of fields) {
      if (field.disabled || field.type === 'hidden') continue;
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }

    if (formStep === 3) {
      const passwordField = stepElement.querySelector<HTMLInputElement>('input[name="account_password"]');
      const confirmPasswordField = stepElement.querySelector<HTMLInputElement>('input[name="confirm_password"]');

      if (confirmPasswordField) {
        confirmPasswordField.setCustomValidity('');
      }

      if (passwordField && confirmPasswordField && passwordField.value !== confirmPasswordField.value) {
        confirmPasswordField.setCustomValidity('Passwords do not match.');
        confirmPasswordField.reportValidity();
        confirmPasswordField.focus();
        return false;
      }
    }

    return true;
  };

  const renderPersonalityAssessmentSection = ({
    fieldId,
    title,
    helper,
  }: {
    fieldId: string;
    title: string;
    helper: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Label htmlFor={fieldId} className="text-foreground text-sm">{title}</Label>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPersonalityDialogOpen(true)}
          className="rounded-xl border-[#CFC5B9] bg-[#FCFAF8] text-foreground hover:bg-[#F7F2EC]"
        >
          <Sparkles className="mr-2 h-4 w-4 text-[#8A8279]" />
          {personalityResult ? 'Retake Assessment' : 'Start Assessment'}
        </Button>
      </div>

      {personalityResult ? (
        <div className="rounded-[24px] border border-border/70 bg-muted/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-[#A89F91] px-3 py-1 text-white">{personalityResult.type}</Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">{personalityResult.headline}</Badge>
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">{personalityResult.summary}</p>
          <p className="mt-1 text-xs text-muted-foreground">{personalityResult.workStyle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {personalityResult.strengths.map((strength) => (
              <span key={strength} className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-foreground">
                {strength}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/10 p-4 text-sm text-muted-foreground">
          Complete the assessment to save a structured personality result with your application.
        </div>
      )}

      <Textarea
        id={fieldId}
        name="personality"
        value={personalityResult ? formatPersonalitySummary(personalityResult) : ''}
        readOnly
        rows={3}
        placeholder="Your assessment result will appear here."
        className="bg-background text-foreground border-border"
        data-bwignore="true"
        data-lpignore="true"
        data-1p-ignore="true"
        autoComplete="off"
      />
      <input type="hidden" name="personality_type" value={personalityResult?.type ?? ''} data-bwignore="true" autoComplete="off" />
      <input type="hidden" name="personality_headline" value={personalityResult?.headline ?? ''} data-bwignore="true" autoComplete="off" />
      <input type="hidden" name="personality_work_style" value={personalityResult?.workStyle ?? ''} data-bwignore="true" autoComplete="off" />
      <input type="hidden" name="personality_strengths" value={personalityResult?.strengths.join(', ') ?? ''} data-bwignore="true" autoComplete="off" />
      <input type="hidden" name="personality_completed_at" value={personalityResult?.completedAt ?? ''} data-bwignore="true" autoComplete="off" />
      <PersonalityAssessmentDialog
        open={personalityDialogOpen}
        onOpenChange={setPersonalityDialogOpen}
        initialResult={personalityResult}
        inline
        onComplete={async (result) => {
          setPersonalityResult(result);
          setPersonalityDialogOpen(false);
          toast.success('Personality assessment saved', {
            description: `${result.type} - ${result.headline}`,
          });
        }}
      />
    </div>
  );

  const renderResumeAutofillSection = () => {
    const resumeFile = filePreviews.resume?.[0];
    const isProcessingResume = resumeParserState === 'parsing';
    const isResumeComplete = resumeParserState === 'success' && Boolean(resumeFile);
    const isResumeError = resumeParserState === 'error';

    return (
    <div className="space-y-4 rounded-[28px] border border-[#E6DED3] bg-[#FCFAF8] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Label htmlFor="resume" className="text-foreground text-sm">Upload a recent resume or CV</Label>
          <p className="text-xs text-muted-foreground">
            Autofill your profile in seconds by uploading your resume.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
          PDF, DOC, DOCX
        </Badge>
      </div>

      <div
        className={`rounded-[28px] border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
          isResumeComplete
            ? 'border-[#B9B0A4] bg-white'
            : isResumeError
            ? 'border-red-200 bg-red-50/50'
            : 'border-border bg-white hover:border-[#A89F91]'
        }`}
      >
        <Input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileInputChange}
          className="hidden"
          data-bwignore="true"
          data-lpignore="true"
          data-1p-ignore="true"
          autoComplete="off"
        />
        <label htmlFor="resume" className="cursor-pointer">
          {isProcessingResume ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F4F0FF]">
                <Loader2 className="h-10 w-10 animate-spin text-[#5B4BF1]" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-foreground">Uploading...</p>
                <p className="text-sm text-muted-foreground">or browse files on your computer</p>
                <p className="text-xs text-muted-foreground">Supports PDF up to 5MB</p>
              </div>
            </div>
          ) : isResumeComplete && resumeFile ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#5B4BF1] text-white shadow-lg shadow-[#5B4BF1]/20">
                <Check className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <p className="mx-auto max-w-[28rem] break-words text-xl font-semibold text-foreground">{resumeFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F0EA] text-[#8A8279]">
                <Upload className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">Upload resume to auto-fill your profile</p>
                <p className="text-sm text-muted-foreground">or browse files on your computer</p>
                <p className="text-xs text-muted-foreground">Searchable PDFs and text-based resumes work best</p>
              </div>
            </div>
          )}
        </label>
      </div>

      {resumeParserState !== 'idle' && (
        <div className={`rounded-2xl border p-4 ${
          resumeParserState === 'error'
            ? 'border-red-200 bg-red-50'
            : resumeParserState === 'success'
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-[#D9D0C4] bg-[#FCFAF8]'
        }`}>
          <div className="flex items-start gap-3">
            {resumeParserState === 'parsing' ? (
              <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-[#8A8279]" />
            ) : (
              <FileText className={`mt-0.5 h-4 w-4 ${resumeParserState === 'error' ? 'text-red-500' : 'text-emerald-600'}`} />
            )}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {resumeParserState === 'parsing'
                  ? 'Reading resume'
                  : resumeParserState === 'success'
                  ? 'Resume auto-fill complete'
                  : 'Resume uploaded without auto-fill'}
              </p>
              {resumeParserMessage ? <p className="text-xs text-muted-foreground">{resumeParserMessage}</p> : null}
              {resumeAutofilledFields.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resumeAutofilledFields.map((field) => (
                    <Badge key={field} variant="secondary" className="rounded-full px-3 py-1">
                      {field}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      <input type="hidden" name="resume_autofill_status" value={resumeParserState} data-bwignore="true" autoComplete="off" />
      <input type="hidden" name="resume_autofill_fields" value={resumeAutofilledFields.join(', ')} data-bwignore="true" autoComplete="off" />
      <input type="hidden" name="resume_detected_skills" value={resumeInsights?.skills.join(', ') ?? ''} data-bwignore="true" autoComplete="off" />
      <input type="hidden" name="resume_detected_summary" value={resumeInsights?.summary ?? ''} data-bwignore="true" autoComplete="off" />
    </div>
    );
  };

  const handleNextFormStep = () => {
    if (!validateCurrentFormStep()) return;
    focusFormStep(Math.min(formStep + 1, totalFormSteps));
  };

  const handlePreviousFormStep = () => {
    focusFormStep(Math.max(formStep - 1, 1));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if coming from community join flow
    if (location.state?.communityOnly) {
      setIsCommunityOnly(true);
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach(revokePreviewUrls);
    };
  }, [filePreviews]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select');
    fields.forEach((field) => {
      const fieldName = (field.getAttribute('name') || '').toLowerCase();
      const keepAutofill = new Set(['name', 'email', 'phone', 'account_password', 'confirm_password']);
      const shouldIgnore = !keepAutofill.has(fieldName);

      if (shouldIgnore) {
        field.setAttribute('data-bwignore', 'true');
        field.setAttribute('data-lpignore', 'true');
        field.setAttribute('data-1p-ignore', 'true');
        if (!field.getAttribute('autocomplete')) {
          field.setAttribute('autocomplete', 'off');
        }
        return;
      }

      if (fieldName === 'email') {
        field.setAttribute('autocomplete', 'email');
      } else if (fieldName === 'phone') {
        field.setAttribute('autocomplete', 'tel');
      } else if (fieldName === 'name') {
        field.setAttribute('autocomplete', 'name');
      } else {
        field.setAttribute('autocomplete', 'new-password');
      }
    });
  }, [profileType, currentStep, showPricing, formStep, personalityDialogOpen, resumeParserState]);

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) {
      setPromoCodeError('');
      setPromoCodeInfo(null);
      return;
    }
    setPromoCodeLoading(true);
    setPromoCodeError('');
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('id, code, tier, max_uses, used_count, valid_until, is_active')
        .eq('code', code.trim())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setPromoCodeError('Invalid promo code');
        setPromoCodeInfo(null);
        return;
      }
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        setPromoCodeError('Promo code expired');
        setPromoCodeInfo(null);
        return;
      }
      if (data.used_count >= data.max_uses) {
        setPromoCodeError('Promo code fully redeemed');
        setPromoCodeInfo(null);
        return;
      }
      setPromoCodeInfo({ id: data.id, tier: data.tier, code: data.code });
      toast.success('Promo code applied');
    } catch (err) {
      setPromoCodeError('Failed to validate promo code');
      setPromoCodeInfo(null);
    } finally {
      setPromoCodeLoading(false);
    }
  };

  const handleApplyPromoCode = () => {
    validatePromoCode(promoCode);
  };

  const getSteps = (): OnboardingStep[] => {
    if (profileType === 'professional') return professionalSteps;
    if (profileType === 'service-provider') return serviceProviderSteps;
    if (profileType === 'agency') return agencySteps;
    if (profileType === 'estates') return estatesSteps;
    return [];
  };

  const steps = getSteps();
  const currentStepData = steps.find(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // After onboarding, auto-select community tier if community-only flow
        if (isCommunityOnly && profileType) {
        const userType = profileTypeToUserType[profileType];
        const communityTier = userType === 'professional' 
          ? 'professional-community' 
          : userType === 'business'
          ? 'business-free' // Businesses don't have community-only tier
          : `${userType}-community` as PricingTier;
        
        setSelectedTier(communityTier);
        setFormStep(1);
        setCurrentStep(999); // Skip to form
      } else {
        setShowPricing(true);
      }
    }
  };

  const handleBack = () => {
    if (showPricing) {
      setShowPricing(false);
      setCurrentStep(steps.length);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (profileType) {
      setProfileType(null);
      setEstatesSubType(null);
      setCurrentStep(1);
    } else {
      navigate('/');
    }
  };

  const handleTierSelection = (tierId: PricingTier) => {
    setSelectedTier(tierId);
  };

  const handleContinueFromPricing = () => {
    if (!selectedTier) {
      alert('Please select a participation level');
      return;
    }
    setShowPricing(false);
    setFormStep(1);
    setCurrentStep(999);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTier) {
      alert('Please select a participation level first');
      return;
    }

    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    const password = String(formData.get('account_password') || '');
    const confirmPassword = String(formData.get('confirm_password') || '');

    if (!password || password.length < 8) {
      alert('Please create a password with at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    
    setSubmittingApplication(true);

    try {
      const plans = getPlansByUserType(profileTypeToUserType[profileType!]);
      const selectedPlan = plans.find(p => p.id === selectedTier);
      const applicationData = await serializeApplicationForm(formData, profileType!, selectedTier);

      const checkoutData: CheckoutData = {
        name: typeof applicationData.name === 'string' ? applicationData.name : '',
        email: typeof applicationData.email === 'string' ? applicationData.email : '',
        password,
        phone: typeof applicationData.phone === 'string' ? applicationData.phone : '',
        location: typeof applicationData.location === 'string' ? applicationData.location : '',
        role: typeof applicationData.role === 'string' ? applicationData.role : undefined,
        bio: typeof applicationData.bio === 'string' ? applicationData.bio : '',
        profileType: profileType!,
        selectedTier: promoCodeInfo ? (promoCodeInfo.tier as PricingTier) : selectedTier,
        planName: promoCodeInfo ? 'Free Pro Profile (6 months)' : (selectedPlan?.name || ''),
        planPrice: promoCodeInfo ? '$0' : (selectedPlan?.price || ''),
        applicationData,
        promoCode: promoCodeInfo?.code,
        promoCodeId: promoCodeInfo?.id,
        promoExpiresAt: promoCodeInfo ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      };

      setFormData(applicationData);

      if (user) {
        sessionStorage.setItem('checkoutDataDraft', JSON.stringify(checkoutData));
        navigate('/checkout', { state: { checkoutData } });
        return;
      }

      await submitMembershipApplication(checkoutData);
      sessionStorage.removeItem('checkoutDataDraft');

      const isPromoApplied = !!promoCodeInfo;
      toast.success('Application submitted', {
        description: isPromoApplied || isComplimentaryTier(selectedTier)
          ? 'Your account has been created and is now pending admin review.'
          : 'Your application is pending admin review. Payment will be requested after approval.',
      });

      navigate('/registration-pending', {
        state: {
          name: checkoutData.name,
          email: checkoutData.email,
          requiresPayment: !isPromoApplied && !isComplimentaryTier(selectedTier),
        },
      });
    } catch (error: any) {
      toast.error('Unable to submit application', {
        description: error.message || 'Please review the form and try again.',
      });
    } finally {
      setSubmittingApplication(false);
    }
  };

  // If user is logged in and hasn't selected a profile type, show upgrade options
  if (user && profileType === null) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-3xl">
            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
                Upgrade Your Account
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                You're already a member! Explore upgrade options to unlock more features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 bg-card text-card-foreground border border-gray-200 hover:border-[#A89F91] transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <User className="w-8 h-8 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
                    View Plans
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Explore available membership tiers and upgrade options
                  </p>
                  <Button 
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white rounded-xl"
                    onClick={() => navigate('/pricing')}
                  >
                    View Pricing
                  </Button>
                </div>
              </Card>

              <Card className="p-8 bg-card text-card-foreground border border-gray-200 hover:border-[#A89F91] transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
                    Manage Account
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Update your profile, settings, and subscription
                  </p>
                  <Button 
                    className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white rounded-xl"
                    onClick={() => navigate('/account-management')}
                  >
                    Account Settings
                  </Button>
                </div>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Need help? Contact our support team for assistance with your account.
              </p>
              <Button 
                variant="outline"
                className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91]/10"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Estates sub-type selection
  if (profileType === 'estates' && estatesSubType === null) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-5xl">
            <Button
              variant="ghost"
              onClick={() => setProfileType(null)}
              className="mb-12 text-foreground"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-6 tracking-tight">
                Estates
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Estate Principals and In-House Members Hiring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('principal')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Home className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Estate Principal
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Estate owners and high-net-worth individuals
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('estate-manager')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Estate Manager
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Hiring on behalf of the estate
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('chief-of-staff')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <User className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Chief of Staff
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Managing estate operations
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('personal-assistant')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Personal Assistant
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Coordinating hiring for the principal
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => setEstatesSubType('executive-assistant')}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Executive Assistant
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Managing recruitment and staffing
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    Continue
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Standards Notice screen (appears after profile type selection)
  if (showStandardsNotice && profileType !== null) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-2xl">
            <Card className="p-12 bg-card text-card-foreground border border-border">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#A89F91]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Shield className="w-10 h-10 text-[#A89F91]" />
                </div>
                <h1 className="text-4xl font-heading font-semibold text-foreground mb-6">
                  Standards Notice
                </h1>
                <div className="space-y-4 text-left mb-8">
                  <p className="text-lg text-foreground leading-relaxed">
                    <strong>Discretion is a requirement.</strong>
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Content that compromises trust is removed.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Membership may be revoked at any time.
                  </p>
                </div>
                <Button
                  onClick={() => setShowStandardsNotice(false)}
                  className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-12 py-4 text-lg rounded-xl"
                >
                  I Understand
                </Button>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Profile type selection (for non-logged-in users)
  if (profileType === null) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-5xl">
            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
                {isCommunityOnly ? 'Create Profile to Join Community' : 'Participation Levels'}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {isCommunityOnly 
                  ? 'Select your profile type to access community features.'
                  : 'Membership is reviewed to preserve the integrity of the network.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => { setProfileType('professional'); setShowStandardsNotice(true); }}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <User className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Professional
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Private estate professionals
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    {isCommunityOnly ? 'Select' : 'Apply'}
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => { setProfileType('service-provider'); setShowStandardsNotice(true); }}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Service Provider
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Estate service businesses
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    {isCommunityOnly ? 'Select' : 'Apply'}
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => { setProfileType('agency'); setShowStandardsNotice(true); }}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Agency Owner
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Private placement agencies
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    {isCommunityOnly ? 'Select' : 'Apply'}
                  </Button>
                </div>
              </Card>

              <Card 
                className="p-8 bg-card text-card-foreground cursor-pointer border border-gray-200 hover:border-[#A89F91] transition-all duration-300 h-full flex flex-col"
                onClick={() => { setProfileType('estates'); setShowStandardsNotice(true); }}
              >
                <div className="text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 bg-[#A89F91]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Home className="w-10 h-10 text-[#A89F91]" />
                  </div>
                  <h2 className="text-2xl font-heading font-semibold text-foreground mb-3 tracking-tight">
                    Estates
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    Principals and hiring staff
                  </p>
                  <Button className="w-full bg-[#A89F91] hover:bg-[#8A8279] text-white px-8 py-4 rounded-xl">
                    {isCommunityOnly ? 'Select' : 'Apply'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Pricing selection (after onboarding, skip if community-only)
  if (showPricing && profileType && !isCommunityOnly) {
    const userType = profileTypeToUserType[profileType];
    const plans = getPlansByUserType(userType);

    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-7xl">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-12 text-foreground"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            <div className="mb-16 text-center">
              <h1 className="text-6xl font-heading font-medium text-foreground mb-8 tracking-tight leading-tight">
                Select Participation Level
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Choose the level that fits your needs.
              </p>
            </div>

            <div className={`grid grid-cols-1 ${plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : plans.length === 3 ? 'md:grid-cols-3 max-w-6xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-4'} gap-8 mb-16`}>
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`p-8 bg-card text-card-foreground border transition-all cursor-pointer ${
                    selectedTier === plan.id
                      ? 'border-primary border-2 shadow-lg'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  onClick={() => handleTierSelection(plan.id)}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-heading font-medium text-foreground mb-4 tracking-tight">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-5xl font-heading font-medium text-foreground">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground ml-2">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.price !== '$0' && plan.price !== 'Complimentary' && (
                      <p className="text-sm text-muted-foreground mb-4">
                        Cancel anytime
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8 min-h-[240px]">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-foreground">
                        <Check className="w-5 h-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedTier === plan.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <div className="max-w-md mx-auto mb-12">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Have a promo code?</h3>
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g., PRO-XXXXX)"
                    disabled={promoCodeLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleApplyPromoCode}
                    disabled={promoCodeLoading || !promoCode.trim()}
                    variant="outline"
                    className="border-[#A89F91] text-[#A89F91] hover:bg-[#A89F91]/10"
                  >
                    {promoCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                {promoCodeError && <p className="text-sm text-red-500 mt-2">{promoCodeError}</p>}
                {promoCodeInfo && (
                  <p className="text-sm text-green-600 mt-2">
                    Promo applied: Free {promoCodeInfo.tier} for 6 months
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleContinueFromPricing}
                disabled={!selectedTier}
                size="lg"
                className="bg-[#A89F91] hover:bg-[#8A8279] text-white px-16 py-6 text-lg disabled:opacity-50 rounded-xl"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <Card className="p-8 bg-muted border-border/50 max-w-3xl mx-auto mt-16">
              <p className="text-center text-foreground leading-relaxed">
                Access varies by participation level.
              </p>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Onboarding flow
  if (currentStep < steps.length) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-48 pb-32">
          <div className="container mx-auto px-12 max-w-3xl">
            <div className="mb-12 text-center">
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`h-1 w-16 rounded-full ${
                      step.id <= currentStep ? 'bg-[#A89F91]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground tracking-wide uppercase">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            <Card className="p-16 bg-card text-card-foreground border-border/50">
              <div className="text-center space-y-8">
                <h1 className="text-5xl font-heading font-medium text-foreground tracking-tight leading-tight">
                  {currentStepData?.title}
                </h1>
                
                <div className="space-y-6 max-w-2xl mx-auto">
                  <p className="text-2xl text-foreground leading-relaxed whitespace-pre-line">
                    {currentStepData?.content}
                  </p>
                  
                  {currentStepData?.subContent && (
                    <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
                      {currentStepData.subContent}
                    </p>
                  )}
                  
                  {currentStepData?.note && (
                    <p className="text-sm text-muted-foreground italic pt-4 border-t border-border/30">
                      {currentStepData.note}
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-4 pt-8">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-xl"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    className="bg-[#A89F91] hover:bg-[#8A8279] text-white px-12 py-4 rounded-xl"
                  >
                    {currentStepData?.buttonText || 'Continue'}
                    {!currentStepData?.buttonText && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Account creation form (after pricing selection or auto-selected for community)
  if (currentStep === 999 && selectedTier) {
    const plans = getPlansByUserType(profileTypeToUserType[profileType!]);
    const selectedPlan = plans.find(p => p.id === selectedTier);

    return (
      <div className="min-h-screen bg-background page-transition">
        <NavBar currentPage="add-listing" />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-6 max-w-7xl">
            <Button
              variant="ghost"
              onClick={() => {
                if (formStep > 1) {
                  handlePreviousFormStep();
                } else if (isCommunityOnly) {
                  setProfileType(null);
                  setCurrentStep(1);
                } else {
                  setCurrentStep(steps.length);
                  setShowPricing(true);
                }
              }}
              className="mb-6 text-foreground"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            <div className="mb-8 text-center">
              <h1 className="text-4xl font-heading font-medium text-foreground mb-4 tracking-tight">
                Create Account
              </h1>
              <p className="text-lg text-muted-foreground">
                {isCommunityOnly 
                  ? 'Complete your profile to submit your community application'
                  : 'Complete your profile to submit your application for review'}
              </p>
            </div>

            <div className="mx-auto mb-6 grid max-w-5xl gap-3 md:grid-cols-3">
              {accountFormSteps.map((step) => {
                const Icon = step.icon;
                const isActive = formStep === step.id;
                const isCompleted = formStep > step.id;

                return (
                  <div
                    key={step.id}
                    className={`rounded-3xl border px-4 py-4 text-left transition-all ${
                      isActive
                        ? 'border-[#A89F91] bg-[#F5F0EA] shadow-sm'
                        : isCompleted
                        ? 'border-[#D8CFC3] bg-background'
                        : 'border-border/60 bg-card/70'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                          isActive || isCompleted ? 'bg-[#A89F91] text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : `0${step.id}`}
                      </span>
                      <Icon className={`h-5 w-5 ${isActive ? 'text-[#8A8279]' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                  </div>
                );
              })}
            </div>

            <Card className="mx-auto max-w-5xl border-border/50 bg-card/95 p-5 text-card-foreground shadow-sm sm:p-6 xl:p-7">
              <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-8">
                <div className="space-y-5">
                  {/* Left Column - Basic Information */}
                  <Card
                    className={`${sectionCardClassName} ${formStep === 1 ? 'block' : 'hidden'}`}
                    data-form-step="1"
                  >
                  <div className={sectionBodyClassName}>
                    <div className="flex items-center gap-2 pb-3 border-b border-border/30">
                      <User className="w-5 h-5 text-[#A89F91]" />
                      <h3 className="text-lg font-heading font-semibold text-foreground tracking-tight">
                        Basic Information
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground text-sm">
                        {profileType === 'professional' && 'Full Name'}
                        {profileType === 'service-provider' && 'Business Name'}
                        {profileType === 'agency' && 'Full Name'}
                        {profileType === 'estates' && 'Full Name'}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter name"
                        required
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    {profileType === 'professional' && (
                      <>
                        {renderResumeAutofillSection()}

                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-foreground text-sm">Professional Title</Label>
                          <Select name="role" required>
                            <SelectTrigger className="bg-background text-foreground border-border">
                              <SelectValue placeholder="Select your title" />
                            </SelectTrigger>
                            <SelectContent className="bg-card max-h-[300px]">
                              {professionalTitles.map((title) => (
                                <SelectItem key={title} value={title.toLowerCase().replace(/\s+/g, '-')}>
                                  {title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-foreground text-sm">Gender</Label>
                          <Select name="gender">
                            <SelectTrigger className="bg-background text-foreground border-border">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-card">
                              {genderOptions.map((gender) => (
                                <SelectItem key={gender} value={gender.toLowerCase()}>
                                  {gender}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                            <Input
                              id="linkedin_url"
                              name="linkedin_url"
                              type="url"
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website_url" className="text-foreground text-sm">Website URL</Label>
                            <Input
                              id="website_url"
                              name="website_url"
                              type="url"
                              placeholder="https://yourwebsite.com"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="portfolio_url" className="text-foreground text-sm">Portfolio URL</Label>
                          <Input
                            id="portfolio_url"
                            name="portfolio_url"
                            type="url"
                            placeholder="https://yourportfolio.com"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="skills" className="text-foreground text-sm">Skills</Label>
                          <Textarea
                            id="skills"
                            name="skills"
                            placeholder="List your key skills and expertise..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        {renderPersonalityAssessmentSection({
                          fieldId: 'professional_personality',
                          title: 'Personality Assessment',
                          helper: 'Complete the integrated assessment to attach a structured work-style result to your profile.',
                        })}

                        <div className="space-y-2">
                          <Label htmlFor="years_experience" className="text-foreground text-sm">Years Experience in this Field</Label>
                          <Input
                            id="years_experience"
                            name="years_experience"
                            type="number"
                            min="0"
                            max="50"
                            placeholder="e.g. 15"
                            required
                            className="bg-background text-foreground border-border"
                          />
                          <p className="text-xs text-muted-foreground">This will be displayed on your profile</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="available_date" className="text-foreground text-sm">Date Available to Start</Label>
                          <Input
                            id="available_date"
                            name="available_date"
                            type="date"
                            required
                            className="bg-background text-foreground border-border"
                          />
                          <p className="text-xs text-muted-foreground">Shows "Available Now" if today or past, otherwise shows the date</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="portfolio" className="text-foreground text-sm">Portfolio Photos</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="portfolio"
                              name="portfolio"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                            <label htmlFor="portfolio" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload portfolio photos</p>
                              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (Max 10MB each)</p>
                            </label>
                          </div>
                          {renderFilePreview('portfolio')}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="birthday" className="text-foreground text-sm">Birthday (Month/Day)</Label>
                            <Input
                              id="birthday"
                              name="birthday"
                              type="text"
                              placeholder="MM/DD"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="originally_from" className="text-foreground text-sm">Originally From</Label>
                            <Input
                              id="originally_from"
                              name="originally_from"
                              placeholder="City, State"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Animal Experience</Label>
                          <div className="flex flex-wrap gap-3">
                            {['Dogs', 'Cats', 'Farm', 'Exotic', 'Birds', 'Reptiles'].map((animal) => (
                              <div key={animal} className="flex items-center space-x-1">
                                <Checkbox id={`animal-${animal.toLowerCase()}`} name="animal_experience" value={animal} />
                                <Label htmlFor={`animal-${animal.toLowerCase()}`} className="text-xs text-foreground cursor-pointer">{animal}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox id="medication_experience" name="medication_experience" />
                          <Label htmlFor="medication_experience" className="text-sm text-foreground cursor-pointer">Experience Handling Medications</Label>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Comfortable With</Label>
                          <div className="flex flex-wrap gap-2">
                            {['Groups', 'Events', 'Alone', 'Pets', 'Children', 'Travel', 'Live-In', 'Overnight', 'Tech'].map((item) => (
                              <div key={item} className="flex items-center space-x-1">
                                <Checkbox id={`comfort-${item.toLowerCase()}`} name="comfortable_with" value={item} />
                                <Label htmlFor={`comfort-${item.toLowerCase()}`} className="text-xs text-foreground cursor-pointer">{item}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Cooking Experience</Label>
                          <div className="flex gap-3">
                            {['Basic', 'Intermediate', 'Expert'].map((level) => (
                              <div key={level} className="flex items-center space-x-1">
                                <Checkbox id={`cooking-${level.toLowerCase()}`} name="cooking_experience" value={level} />
                                <Label htmlFor={`cooking-${level.toLowerCase()}`} className="text-xs text-foreground cursor-pointer">{level}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="hobbies" className="text-foreground text-xs">Hobbies</Label>
                            <Textarea
                              id="hobbies"
                              name="hobbies"
                              placeholder="List hobbies..."
                              rows={1}
                              className="bg-background text-foreground border-border text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="interests" className="text-foreground text-xs">Interests</Label>
                            <Textarea
                              id="interests"
                              name="interests"
                              placeholder="List interests..."
                              rows={1}
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Label className="text-foreground text-xs">Willing To:</Label>
                          <div className="flex gap-3">
                            {['Travel', 'Relocate'].map((item) => (
                              <div key={item} className="flex items-center space-x-1">
                                <Checkbox id={`willing-${item.toLowerCase()}`} name="willing_to" value={item} />
                                <Label htmlFor={`willing-${item.toLowerCase()}`} className="text-xs text-foreground cursor-pointer">{item}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="salary_min" className="text-foreground text-xs">Salary Min</Label>
                            <Input id="salary_min" name="salary_min" type="number" placeholder="$50,000" className="bg-background text-foreground border-border h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="salary_max" className="text-foreground text-xs">Salary Max</Label>
                            <Input id="salary_max" name="salary_max" type="number" placeholder="$80,000" className="bg-background text-foreground border-border h-8 text-sm" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Work Preference</Label>
                          <div className="flex flex-wrap gap-2">
                            {['Full Time', 'Part Time', 'Contract', 'Seasonal', 'Temporary', 'Remote'].map((pref) => (
                              <div key={pref} className="flex items-center space-x-1">
                                <Checkbox id={`pref-${pref.toLowerCase().replace(' ', '')}`} name="work_preference" value={pref} />
                                <Label htmlFor={`pref-${pref.toLowerCase().replace(' ', '')}`} className="text-xs text-foreground cursor-pointer">{pref}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Vehicle & License</Label>
                          <div className="flex gap-3">
                            <div className="flex items-center space-x-1">
                              <Checkbox id="has-license" name="has_license" />
                              <Label htmlFor="has-license" className="text-xs text-foreground cursor-pointer">Driver's License</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Checkbox id="has-car" name="has_car" />
                              <Label htmlFor="has-car" className="text-xs text-foreground cursor-pointer">Own Car</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Checkbox id="has-insurance" name="has_insurance" />
                              <Label htmlFor="has-insurance" className="text-xs text-foreground cursor-pointer">Insurance</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Certifications</Label>
                          <div className="grid grid-cols-3 gap-1 max-h-[120px] overflow-y-auto border border-border rounded-lg p-2 text-xs">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-cpr" name="certifications" value="CPR/AED" />
                              <Label htmlFor="cert-cpr" className="text-xs text-foreground cursor-pointer">CPR / AED</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-firstaid" name="certifications" value="First Aid" />
                              <Label htmlFor="cert-firstaid" className="text-xs text-foreground cursor-pointer">First Aid</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-infantcpr" name="certifications" value="Infant & Child CPR" />
                              <Label htmlFor="cert-infantcpr" className="text-xs text-foreground cursor-pointer">Infant & Child CPR</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-pedfirstaid" name="certifications" value="Pediatric First Aid" />
                              <Label htmlFor="cert-pedfirstaid" className="text-xs text-foreground cursor-pointer">Pediatric First Aid</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-bls" name="certifications" value="BLS" />
                              <Label htmlFor="cert-bls" className="text-xs text-foreground cursor-pointer">Basic Life Support (BLS)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-acls" name="certifications" value="ACLS" />
                              <Label htmlFor="cert-acls" className="text-xs text-foreground cursor-pointer">Advanced Cardiac Life Support</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-watersafety" name="certifications" value="Water Safety" />
                              <Label htmlFor="cert-watersafety" className="text-xs text-foreground cursor-pointer">Water Safety / Lifeguard</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-medication" name="certifications" value="Medication Administration" />
                              <Label htmlFor="cert-medication" className="text-xs text-foreground cursor-pointer">Medication Administration</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-eldercare" name="certifications" value="Elder Care" />
                              <Label htmlFor="cert-eldercare" className="text-xs text-foreground cursor-pointer">Elder Care / Dementia Care</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-ncs" name="certifications" value="NCS" />
                              <Label htmlFor="cert-ncs" className="text-xs text-foreground cursor-pointer">Newborn Care Specialist</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-doula" name="certifications" value="Postpartum Doula" />
                              <Label htmlFor="cert-doula" className="text-xs text-foreground cursor-pointer">Postpartum Doula</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-childdev" name="certifications" value="Child Development" />
                              <Label htmlFor="cert-childdev" className="text-xs text-foreground cursor-pointer">Child Development</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-specialneeds" name="certifications" value="Special Needs Care" />
                              <Label htmlFor="cert-specialneeds" className="text-xs text-foreground cursor-pointer">Special Needs Care</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-montessori" name="certifications" value="Montessori" />
                              <Label htmlFor="cert-montessori" className="text-xs text-foreground cursor-pointer">Montessori</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-ece" name="certifications" value="ECE" />
                              <Label htmlFor="cert-ece" className="text-xs text-foreground cursor-pointer">Early Childhood Education</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-foodhandler" name="certifications" value="Food Handler" />
                              <Label htmlFor="cert-foodhandler" className="text-xs text-foreground cursor-pointer">Food Handler</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-servsafe" name="certifications" value="ServSafe" />
                              <Label htmlFor="cert-servsafe" className="text-xs text-foreground cursor-pointer">ServSafe</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-haccp" name="certifications" value="HACCP" />
                              <Label htmlFor="cert-haccp" className="text-xs text-foreground cursor-pointer">HACCP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-butler" name="certifications" value="Butler Certification" />
                              <Label htmlFor="cert-butler" className="text-xs text-foreground cursor-pointer">Butler / Formal Service</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-hospitality" name="certifications" value="Luxury Hospitality" />
                              <Label htmlFor="cert-hospitality" className="text-xs text-foreground cursor-pointer">Luxury Hospitality</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-propmgmt" name="certifications" value="Property Management" />
                              <Label htmlFor="cert-propmgmt" className="text-xs text-foreground cursor-pointer">Property Management</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-cdl" name="certifications" value="CDL" />
                              <Label htmlFor="cert-cdl" className="text-xs text-foreground cursor-pointer">CDL (Commercial Driver)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-chauffeur" name="certifications" value="Chauffeur" />
                              <Label htmlFor="cert-chauffeur" className="text-xs text-foreground cursor-pointer">Chauffeur Certification</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-defensive" name="certifications" value="Defensive Driving" />
                              <Label htmlFor="cert-defensive" className="text-xs text-foreground cursor-pointer">Defensive Driving</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-execprotect" name="certifications" value="Executive Protection" />
                              <Label htmlFor="cert-execprotect" className="text-xs text-foreground cursor-pointer">Executive Protection</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-security" name="certifications" value="Security Officer" />
                              <Label htmlFor="cert-security" className="text-xs text-foreground cursor-pointer">Security Officer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-stcw" name="certifications" value="STCW" />
                              <Label htmlFor="cert-stcw" className="text-xs text-foreground cursor-pointer">STCW (Maritime)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-yachtmaster" name="certifications" value="Yachtmaster" />
                              <Label htmlFor="cert-yachtmaster" className="text-xs text-foreground cursor-pointer">Yachtmaster</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-captain" name="certifications" value="Captain's License" />
                              <Label htmlFor="cert-captain" className="text-xs text-foreground cursor-pointer">Captain's License</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-osha" name="certifications" value="OSHA" />
                              <Label htmlFor="cert-osha" className="text-xs text-foreground cursor-pointer">OSHA Safety</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-hvac" name="certifications" value="HVAC" />
                              <Label htmlFor="cert-hvac" className="text-xs text-foreground cursor-pointer">HVAC</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-electrical" name="certifications" value="Electrical" />
                              <Label htmlFor="cert-electrical" className="text-xs text-foreground cursor-pointer">Electrical</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-plumbing" name="certifications" value="Plumbing" />
                              <Label htmlFor="cert-plumbing" className="text-xs text-foreground cursor-pointer">Plumbing</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-pool" name="certifications" value="Pool & Spa Operator" />
                              <Label htmlFor="cert-pool" className="text-xs text-foreground cursor-pointer">Pool & Spa Operator</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="cert-wine" name="certifications" value="Wine & Spirits" />
                              <Label htmlFor="cert-wine" className="text-xs text-foreground cursor-pointer">Wine & Spirits (WSET)</Label>
                            </div>
                          </div>
                          <Input
                            id="other_certifications"
                            name="other_certifications"
                            placeholder="Other certifications (comma separated)"
                            className="bg-background text-foreground border-border mt-2"
                          />
                        </div>

                        {/* Work History Section */}
                        <div className="space-y-4 pt-4 border-t border-border">
                          <h4 className="text-lg font-heading font-medium text-foreground">Work History</h4>
                          <p className="text-xs text-muted-foreground">Add your previous employment history (most recent first)</p>
                          
                          <div className="space-y-4 border border-border rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="work_title_1" className="text-foreground text-sm">Job Title</Label>
                                <Input
                                  id="work_title_1"
                                  name="work_title_1"
                                  placeholder="Estate Manager"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="work_employer_1" className="text-foreground text-sm">Employer/Family Name</Label>
                                <Input
                                  id="work_employer_1"
                                  name="work_employer_1"
                                  placeholder="Private Family"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="work_start_1" className="text-foreground text-sm">Start Date</Label>
                                <Input
                                  id="work_start_1"
                                  name="work_start_1"
                                  type="month"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="work_end_1" className="text-foreground text-sm">End Date</Label>
                                <Input
                                  id="work_end_1"
                                  name="work_end_1"
                                  type="month"
                                  placeholder="Present"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="work_description_1" className="text-foreground text-sm">Description</Label>
                              <Textarea
                                id="work_description_1"
                                name="work_description_1"
                                placeholder="Describe your responsibilities and achievements..."
                                rows={2}
                                className="bg-background text-foreground border-border"
                              />
                            </div>
                          </div>

                          <div className="space-y-4 border border-border rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="work_title_2" className="text-foreground text-sm">Job Title</Label>
                                <Input
                                  id="work_title_2"
                                  name="work_title_2"
                                  placeholder="Previous Position"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="work_employer_2" className="text-foreground text-sm">Employer/Family Name</Label>
                                <Input
                                  id="work_employer_2"
                                  name="work_employer_2"
                                  placeholder="Previous Employer"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="work_start_2" className="text-foreground text-sm">Start Date</Label>
                                <Input
                                  id="work_start_2"
                                  name="work_start_2"
                                  type="month"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="work_end_2" className="text-foreground text-sm">End Date</Label>
                                <Input
                                  id="work_end_2"
                                  name="work_end_2"
                                  type="month"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="work_description_2" className="text-foreground text-sm">Description</Label>
                              <Textarea
                                id="work_description_2"
                                name="work_description_2"
                                placeholder="Describe your responsibilities and achievements..."
                                rows={2}
                                className="bg-background text-foreground border-border"
                              />
                            </div>
                          </div>
                        </div>

                        {/* References Section */}
                        <div className="space-y-4 pt-4 border-t border-border">
                          <h4 className="text-lg font-heading font-medium text-foreground">References</h4>
                          <p className="text-xs text-muted-foreground">Provide professional references who can vouch for your work</p>
                          
                          <div className="space-y-4 border border-border rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="ref_name_1" className="text-foreground text-sm">Reference Name</Label>
                                <Input
                                  id="ref_name_1"
                                  name="ref_name_1"
                                  placeholder="John Smith"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ref_relationship_1" className="text-foreground text-sm">Relationship</Label>
                                <Input
                                  id="ref_relationship_1"
                                  name="ref_relationship_1"
                                  placeholder="Former Employer"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="ref_phone_1" className="text-foreground text-sm">Phone</Label>
                                <Input
                                  id="ref_phone_1"
                                  name="ref_phone_1"
                                  type="tel"
                                  placeholder="(555) 123-4567"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ref_email_1" className="text-foreground text-sm">Email</Label>
                                <Input
                                  id="ref_email_1"
                                  name="ref_email_1"
                                  type="email"
                                  placeholder="reference@email.com"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 border border-border rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="ref_name_2" className="text-foreground text-sm">Reference Name</Label>
                                <Input
                                  id="ref_name_2"
                                  name="ref_name_2"
                                  placeholder="Jane Doe"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ref_relationship_2" className="text-foreground text-sm">Relationship</Label>
                                <Input
                                  id="ref_relationship_2"
                                  name="ref_relationship_2"
                                  placeholder="Colleague"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="ref_phone_2" className="text-foreground text-sm">Phone</Label>
                                <Input
                                  id="ref_phone_2"
                                  name="ref_phone_2"
                                  type="tel"
                                  placeholder="(555) 987-6543"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ref_email_2" className="text-foreground text-sm">Email</Label>
                                <Input
                                  id="ref_email_2"
                                  name="ref_email_2"
                                  type="email"
                                  placeholder="reference2@email.com"
                                  className="bg-background text-foreground border-border"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="recommendation_letters" className="text-foreground text-sm">Recommendation Letters (PDF)</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                              <Input
                                id="recommendation_letters"
                                name="recommendation_letters"
                                type="file"
                                accept=".pdf"
                                multiple
                                onChange={handleFileInputChange}
                                className="hidden"
                              />
                              <label htmlFor="recommendation_letters" className="cursor-pointer">
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Click to upload recommendation letters</p>
                                <p className="text-xs text-muted-foreground mt-1">PDF files only (Max 5MB each)</p>
                              </label>
                            </div>
                            {renderFilePreview('recommendation_letters')}
                          </div>
                        </div>

                        {/* Software & Systems Section */}
                        <div className="space-y-4 pt-4 border-t border-border">
                          <h4 className="text-lg font-heading font-medium text-foreground">Software & Systems Used</h4>
                          <p className="text-xs text-muted-foreground">Select the software and systems you're proficient with</p>
                          
                          <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-excel" name="software" value="Microsoft Excel" />
                              <Label htmlFor="sw-excel" className="text-xs text-foreground cursor-pointer">Microsoft Excel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-word" name="software" value="Microsoft Word" />
                              <Label htmlFor="sw-word" className="text-xs text-foreground cursor-pointer">Microsoft Word</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-outlook" name="software" value="Microsoft Outlook" />
                              <Label htmlFor="sw-outlook" className="text-xs text-foreground cursor-pointer">Microsoft Outlook</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-gsheets" name="software" value="Google Sheets" />
                              <Label htmlFor="sw-gsheets" className="text-xs text-foreground cursor-pointer">Google Sheets</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-gdocs" name="software" value="Google Docs" />
                              <Label htmlFor="sw-gdocs" className="text-xs text-foreground cursor-pointer">Google Docs</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-gcal" name="software" value="Google Calendar" />
                              <Label htmlFor="sw-gcal" className="text-xs text-foreground cursor-pointer">Google Calendar</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-quickbooks" name="software" value="QuickBooks" />
                              <Label htmlFor="sw-quickbooks" className="text-xs text-foreground cursor-pointer">QuickBooks</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-netsuite" name="software" value="NetSuite" />
                              <Label htmlFor="sw-netsuite" className="text-xs text-foreground cursor-pointer">NetSuite</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-sage" name="software" value="Sage" />
                              <Label htmlFor="sw-sage" className="text-xs text-foreground cursor-pointer">Sage</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-asana" name="software" value="Asana" />
                              <Label htmlFor="sw-asana" className="text-xs text-foreground cursor-pointer">Asana</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-trello" name="software" value="Trello" />
                              <Label htmlFor="sw-trello" className="text-xs text-foreground cursor-pointer">Trello</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-monday" name="software" value="Monday.com" />
                              <Label htmlFor="sw-monday" className="text-xs text-foreground cursor-pointer">Monday.com</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-slack" name="software" value="Slack" />
                              <Label htmlFor="sw-slack" className="text-xs text-foreground cursor-pointer">Slack</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-zoom" name="software" value="Zoom" />
                              <Label htmlFor="sw-zoom" className="text-xs text-foreground cursor-pointer">Zoom</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-teams" name="software" value="Microsoft Teams" />
                              <Label htmlFor="sw-teams" className="text-xs text-foreground cursor-pointer">Microsoft Teams</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-estateman" name="software" value="Estate Management Software" />
                              <Label htmlFor="sw-estateman" className="text-xs text-foreground cursor-pointer">Estate Management</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-crestron" name="software" value="Crestron" />
                              <Label htmlFor="sw-crestron" className="text-xs text-foreground cursor-pointer">Crestron</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-control4" name="software" value="Control4" />
                              <Label htmlFor="sw-control4" className="text-xs text-foreground cursor-pointer">Control4</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-savant" name="software" value="Savant" />
                              <Label htmlFor="sw-savant" className="text-xs text-foreground cursor-pointer">Savant</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-lutron" name="software" value="Lutron" />
                              <Label htmlFor="sw-lutron" className="text-xs text-foreground cursor-pointer">Lutron</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-pos" name="software" value="POS Systems" />
                              <Label htmlFor="sw-pos" className="text-xs text-foreground cursor-pointer">POS Systems</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-inventory" name="software" value="Inventory Management" />
                              <Label htmlFor="sw-inventory" className="text-xs text-foreground cursor-pointer">Inventory Management</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-scheduling" name="software" value="Scheduling Software" />
                              <Label htmlFor="sw-scheduling" className="text-xs text-foreground cursor-pointer">Scheduling Software</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sw-security" name="software" value="Security Systems" />
                              <Label htmlFor="sw-security" className="text-xs text-foreground cursor-pointer">Security Systems</Label>
                            </div>
                          </div>
                          <Input
                            id="other_software"
                            name="other_software"
                            placeholder="Other software/systems (comma separated)"
                            className="bg-background text-foreground border-border"
                          />
                        </div>
                      </>
                    )}

                    {profileType === 'service-provider' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Business Type</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="is_company" name="is_company" />
                              <Label htmlFor="is_company" className="text-sm text-foreground cursor-pointer">Company</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="is_individual" name="is_individual" />
                              <Label htmlFor="is_individual" className="text-sm text-foreground cursor-pointer">Individual</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-foreground text-sm">Service Type</Label>
                          <Input
                            id="role"
                            name="role"
                            placeholder="Landscaping Services, Pool Maintenance"
                            required
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rate_min" className="text-foreground text-sm">Rate Range (Min)</Label>
                            <Input
                              id="rate_min"
                              name="rate_min"
                              type="number"
                              placeholder="$50"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rate_max" className="text-foreground text-sm">Rate Range (Max)</Label>
                            <Input
                              id="rate_max"
                              name="rate_max"
                              type="number"
                              placeholder="$200"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="year_founded" className="text-foreground text-sm">Business Year Founded</Label>
                          <Input
                            id="year_founded"
                            name="year_founded"
                            type="number"
                            min="1900"
                            max="2026"
                            placeholder="2015"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sp_linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                            <Input
                              id="sp_linkedin_url"
                              name="linkedin_url"
                              type="url"
                              placeholder="https://linkedin.com/company/yourcompany"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sp_website_url" className="text-foreground text-sm">Website URL</Label>
                            <Input
                              id="sp_website_url"
                              name="website_url"
                              type="url"
                              placeholder="https://yourwebsite.com"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="years_experience" className="text-foreground text-sm">Years Experience in this Field</Label>
                          <Input
                            id="years_experience"
                            name="years_experience"
                            type="number"
                            min="0"
                            max="50"
                            placeholder="e.g. 10"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="business_hours" className="text-foreground text-sm">Business Hours</Label>
                          <Input
                            id="business_hours"
                            name="business_hours"
                            placeholder="Mon-Fri 8am-6pm"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rate_sheet" className="text-foreground text-sm">Rate Sheet Upload (PDF)</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="rate_sheet"
                              name="rate_sheet"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                            <label htmlFor="rate_sheet" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload rate sheet</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                            </label>
                          </div>
                          {renderFilePreview('rate_sheet')}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sp_portfolio" className="text-foreground text-sm">Portfolio Photos</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="sp_portfolio"
                              name="sp_portfolio"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                            <label htmlFor="sp_portfolio" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload portfolio photos</p>
                              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (Max 10MB each)</p>
                            </label>
                          </div>
                          {renderFilePreview('sp_portfolio')}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Staff Options</Label>
                          <div className="flex gap-4">
                            {genderOptions.map((gender) => (
                              <div key={gender} className="flex items-center space-x-2">
                                <Checkbox id={`staff-${gender}`} name="staff_options" value={gender} />
                                <Label htmlFor={`staff-${gender}`} className="text-sm text-foreground cursor-pointer">
                                  {gender}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Availability</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {workAvailability.map((availability) => (
                              <div key={availability} className="flex items-center space-x-2">
                                <Checkbox id={`sp-availability-${availability}`} name="availability" value={availability} />
                                <Label htmlFor={`sp-availability-${availability}`} className="text-sm text-foreground cursor-pointer">
                                  {availability}
                                </Label>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-availability-remote" name="availability" value="Remote" />
                              <Label htmlFor="sp-availability-remote" className="text-sm text-foreground cursor-pointer">
                                Remote
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Comfortable With</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-pets" name="comfortable_with" value="Pets" />
                              <Label htmlFor="sp-pets" className="text-sm text-foreground cursor-pointer">Pets</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-children" name="comfortable_with" value="Children" />
                              <Label htmlFor="sp-children" className="text-sm text-foreground cursor-pointer">Children</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Certifications</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-licensed" name="certifications" value="Licensed" />
                              <Label htmlFor="sp-cert-licensed" className="text-sm text-foreground cursor-pointer">Licensed</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-bonded" name="certifications" value="Bonded" />
                              <Label htmlFor="sp-cert-bonded" className="text-sm text-foreground cursor-pointer">Bonded</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-insured" name="certifications" value="Insured" />
                              <Label htmlFor="sp-cert-insured" className="text-sm text-foreground cursor-pointer">Insured</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-epa" name="certifications" value="EPA Certified" />
                              <Label htmlFor="sp-cert-epa" className="text-sm text-foreground cursor-pointer">EPA Certified</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-osha" name="certifications" value="OSHA Certified" />
                              <Label htmlFor="sp-cert-osha" className="text-sm text-foreground cursor-pointer">OSHA Certified</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp-cert-green" name="certifications" value="Green Certified" />
                              <Label htmlFor="sp-cert-green" className="text-sm text-foreground cursor-pointer">Green Certified</Label>
                            </div>
                          </div>
                          <Input
                            id="sp_other_certifications"
                            name="other_certifications"
                            placeholder="Other certifications (comma separated)"
                            className="bg-background text-foreground border-border mt-2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Willing to Undergo</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp_background_check" name="background_check" />
                              <Label htmlFor="sp_background_check" className="text-sm text-foreground cursor-pointer">Background Check</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sp_drug_test" name="drug_test" />
                              <Label htmlFor="sp_drug_test" className="text-sm text-foreground cursor-pointer">Drug Test</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sp_skills" className="text-foreground text-sm">Skills & Expertise</Label>
                          <Textarea
                            id="sp_skills"
                            name="skills"
                            placeholder="List your key skills and service expertise..."
                            rows={3}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        {renderPersonalityAssessmentSection({
                          fieldId: 'sp_personality',
                          title: 'Business Personality & Approach',
                          helper: 'Generate a structured description of how your business communicates, decides, and delivers.',
                        })}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sp_hobbies" className="text-foreground text-sm">Hobbies</Label>
                            <Input
                              id="sp_hobbies"
                              name="hobbies"
                              placeholder="Personal interests"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sp_interests" className="text-foreground text-sm">Interests</Label>
                            <Input
                              id="sp_interests"
                              name="interests"
                              placeholder="Professional interests"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Languages Spoken</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {languages.slice(0, 12).map((lang) => (
                              <div key={lang} className="flex items-center space-x-2">
                                <Checkbox id={`sp-lang-${lang}`} name="languages" value={lang} />
                                <Label htmlFor={`sp-lang-${lang}`} className="text-xs text-foreground cursor-pointer">
                                  {lang}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sp_letters_rec" className="text-foreground text-sm">Letters of Recommendation</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="sp_letters_rec"
                              name="letters_of_rec"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              multiple
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                            <label htmlFor="sp_letters_rec" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Upload letters of recommendation</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB each)</p>
                            </label>
                          </div>
                          {renderFilePreview('letters_of_rec')}
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-foreground text-sm">Location</Label>
                      <LocationAutocomplete
                        onLocationSelect={(location) => {
                          // Store the selected location in a hidden field for form submission
                          const hiddenField = document.getElementById('hidden-location') as HTMLInputElement;
                          if (hiddenField) {
                            hiddenField.value = `${location.city}, ${location.state}`;
                          }
                        }}
                        placeholder="Enter your city..."
                        className="w-full"
                      />
                      <input
                        type="hidden"
                        id="hidden-location"
                        name="location"
                        required
                      />
                      {isCommunityOnly && (
                        <p className="text-xs text-muted-foreground">
                          You will automatically join the community for this location
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-foreground text-sm">
                        {profileType === 'professional' && 'Professional Bio'}
                        {profileType === 'service-provider' && 'Business Description'}
                        {profileType === 'agency' && 'Agency Description'}
                        {profileType === 'estates' && 'About'}
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Describe your experience and expertise"
                        rows={4}
                        required
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    {profileType === 'agency' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Business Type</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency_is_company" name="is_company" />
                              <Label htmlFor="agency_is_company" className="text-sm text-foreground cursor-pointer">Company</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency_is_individual" name="is_individual" />
                              <Label htmlFor="agency_is_individual" className="text-sm text-foreground cursor-pointer">Individual</Label>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="agency_year_founded" className="text-foreground text-sm">Year Founded</Label>
                            <Input
                              id="agency_year_founded"
                              name="year_founded"
                              type="number"
                              min="1900"
                              max="2026"
                              placeholder="2010"
                              className="bg-background text-foreground border-border"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="agency_years_experience" className="text-foreground text-sm">Years Experience in this Field</Label>
                            <Input
                              id="agency_years_experience"
                              name="years_experience"
                              type="number"
                              min="0"
                              max="50"
                              placeholder="e.g. 15"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="agency_linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                            <Input
                              id="agency_linkedin_url"
                              name="linkedin_url"
                              type="url"
                              placeholder="https://linkedin.com/company/youragency"
                              className="bg-background text-foreground border-border"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="agency_website_url" className="text-foreground text-sm">Website URL</Label>
                            <Input
                              id="agency_website_url"
                              name="website_url"
                              type="url"
                              placeholder="https://youragency.com"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Staff Options</Label>
                          <div className="flex gap-4">
                            {genderOptions.map((gender) => (
                              <div key={gender} className="flex items-center space-x-2">
                                <Checkbox id={`agency-staff-${gender}`} name="staff_options" value={gender} />
                                <Label htmlFor={`agency-staff-${gender}`} className="text-sm text-foreground cursor-pointer">
                                  {gender}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_business_hours" className="text-foreground text-sm">Business Hours</Label>
                          <Input
                            id="agency_business_hours"
                            name="business_hours"
                            placeholder="Mon-Fri 9am-5pm"
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Availability</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {workAvailability.map((availability) => (
                              <div key={availability} className="flex items-center space-x-2">
                                <Checkbox id={`agency-availability-${availability}`} name="availability" value={availability} />
                                <Label htmlFor={`agency-availability-${availability}`} className="text-sm text-foreground cursor-pointer">
                                  {availability}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Comfortable With</Label>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-pets" name="comfortable_with" value="Pets" />
                              <Label htmlFor="agency-pets" className="text-sm text-foreground cursor-pointer">Pets</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-children" name="comfortable_with" value="Children" />
                              <Label htmlFor="agency-children" className="text-sm text-foreground cursor-pointer">Children</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-travel" name="comfortable_with" value="Travel" />
                              <Label htmlFor="agency-travel" className="text-sm text-foreground cursor-pointer">Travel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-livein" name="comfortable_with" value="Live-In" />
                              <Label htmlFor="agency-livein" className="text-sm text-foreground cursor-pointer">Live-In</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Willing to Undergo</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency_background_check" name="background_check" />
                              <Label htmlFor="agency_background_check" className="text-sm text-foreground cursor-pointer">Background Check</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency_drug_test" name="drug_test" />
                              <Label htmlFor="agency_drug_test" className="text-sm text-foreground cursor-pointer">Drug Test</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_skills" className="text-foreground text-sm">Skills & Expertise</Label>
                          <Textarea
                            id="agency_skills"
                            name="skills"
                            placeholder="List your agency's key skills and expertise areas..."
                            rows={3}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        {renderPersonalityAssessmentSection({
                          fieldId: 'agency_personality',
                          title: 'Agency Culture & Personality',
                          helper: 'Capture your agency communication style and approach with a structured assessment.',
                        })}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="agency_hobbies" className="text-foreground text-sm">Hobbies</Label>
                            <Input
                              id="agency_hobbies"
                              name="hobbies"
                              placeholder="Team activities, interests"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="agency_interests" className="text-foreground text-sm">Interests</Label>
                            <Input
                              id="agency_interests"
                              name="interests"
                              placeholder="Industry focus areas"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Languages Spoken</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {languages.slice(0, 12).map((lang) => (
                              <div key={lang} className="flex items-center space-x-2">
                                <Checkbox id={`agency-lang-${lang}`} name="languages" value={lang} />
                                <Label htmlFor={`agency-lang-${lang}`} className="text-xs text-foreground cursor-pointer">
                                  {lang}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Certifications & Credentials</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-licensed" name="certifications" value="Licensed" />
                              <Label htmlFor="agency-cert-licensed" className="text-sm text-foreground cursor-pointer">Licensed</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-bonded" name="certifications" value="Bonded" />
                              <Label htmlFor="agency-cert-bonded" className="text-sm text-foreground cursor-pointer">Bonded</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-insured" name="certifications" value="Insured" />
                              <Label htmlFor="agency-cert-insured" className="text-sm text-foreground cursor-pointer">Insured</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-verified" name="certifications" value="Verified Agency" />
                              <Label htmlFor="agency-cert-verified" className="text-sm text-foreground cursor-pointer">Verified Agency</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-bbb" name="certifications" value="BBB Accredited" />
                              <Label htmlFor="agency-cert-bbb" className="text-sm text-foreground cursor-pointer">BBB Accredited</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="agency-cert-member" name="certifications" value="Industry Association Member" />
                              <Label htmlFor="agency-cert-member" className="text-sm text-foreground cursor-pointer">Industry Association</Label>
                            </div>
                          </div>
                          <Input
                            id="agency_other_certifications"
                            name="other_certifications"
                            placeholder="Other certifications (comma separated)"
                            className="bg-background text-foreground border-border mt-2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency_letters_rec" className="text-foreground text-sm">Letters of Recommendation</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-[#A89F91] transition-colors">
                            <Input
                              id="agency_letters_rec"
                              name="letters_of_rec"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              multiple
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                            <label htmlFor="agency_letters_rec" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Upload letters of recommendation</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB each)</p>
                            </label>
                          </div>
                          {renderFilePreview('letters_of_rec')}
                        </div>
                      </>
                    )}

                    {profileType === 'estates' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Role Type</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="is_principal" name="is_principal" />
                              <Label htmlFor="is_principal" className="text-sm text-foreground cursor-pointer">Principal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="is_estate_staff" name="is_estate_staff" />
                              <Label htmlFor="is_estate_staff" className="text-sm text-foreground cursor-pointer">Estate Staff</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estates_title" className="text-foreground text-sm">If Estate Staff, what is your title?</Label>
                          <Select name="estates_title">
                            <SelectTrigger className="bg-background text-foreground border-border">
                              <SelectValue placeholder="Select your title" />
                            </SelectTrigger>
                            <SelectContent className="bg-card max-h-[300px]">
                              {professionalTitles.map((title) => (
                                <SelectItem key={title} value={title.toLowerCase().replace(/\s+/g, '-')}>
                                  {title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="estates_linkedin_url" className="text-foreground text-sm">LinkedIn URL</Label>
                            <Input
                              id="estates_linkedin_url"
                              name="linkedin_url"
                              type="url"
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="bg-background text-foreground border-border"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="estates_website_url" className="text-foreground text-sm">Website URL</Label>
                            <Input
                              id="estates_website_url"
                              name="website_url"
                              type="url"
                              placeholder="https://yourwebsite.com"
                              className="bg-background text-foreground border-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Languages Spoken</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto border border-border rounded-lg p-3">
                            {languages.map((lang) => (
                              <div key={lang} className="flex items-center space-x-2">
                                <Checkbox id={`estates-lang-${lang}`} name="languages" value={lang} />
                                <Label htmlFor={`estates-lang-${lang}`} className="text-xs text-foreground cursor-pointer">
                                  {lang}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estates_hobbies" className="text-foreground text-sm">Hobbies</Label>
                          <Textarea
                            id="estates_hobbies"
                            name="hobbies"
                            placeholder="List your hobbies..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estates_interests" className="text-foreground text-sm">Interests</Label>
                          <Textarea
                            id="estates_interests"
                            name="interests"
                            placeholder="List your interests..."
                            rows={2}
                            className="bg-background text-foreground border-border"
                          />
                        </div>
                      </>
                    )}

                  </div>
                  </Card>

                  {/* Middle Column - Professional Details */}
                  <Card
                    className={`${sectionCardClassName} ${formStep === 2 ? 'block' : 'hidden'}`}
                    data-form-step="2"
                  >
                  <div className={sectionBodyClassName}>
                    <div className="flex items-center gap-2 pb-3 border-b border-border/30">
                      <Briefcase className="w-5 h-5 text-[#A89F91]" />
                      <h3 className="text-lg font-heading font-semibold text-foreground tracking-tight">
                        Professional Details
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-foreground text-sm">Years of Experience</Label>
                      <Input
                        id="experience"
                        name="experience"
                        type="number"
                        placeholder="e.g. 5"
                        min="0"
                        max="50"
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="available_date" className="text-foreground text-sm">Available From</Label>
                      <Input
                        id="available_date"
                        name="available_date"
                        type="date"
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Work Preference</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Full Time', 'Part Time', 'Contract', 'Remote'].map((pref) => (
                          <div key={pref} className="flex items-center space-x-1">
                            <Checkbox id={`pref-${pref.toLowerCase().replace(' ', '')}`} name="work_preference" value={pref} />
                            <Label htmlFor={`pref-${pref.toLowerCase().replace(' ', '')}`} className="text-xs text-foreground cursor-pointer">{pref}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Languages</Label>
                      <div className="grid grid-cols-2 gap-1 max-h-[120px] overflow-y-auto border border-border rounded-lg p-2 text-xs">
                        {['English', 'Spanish', 'French', 'German', 'Mandarin', 'Italian'].map((lang) => (
                          <div key={lang} className="flex items-center space-x-1">
                            <Checkbox id={`lang-${lang.toLowerCase()}`} name="languages" value={lang} />
                            <Label htmlFor={`lang-${lang.toLowerCase()}`} className="text-xs text-foreground cursor-pointer">{lang}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Skills</Label>
                      <Textarea
                        id="skills_summary"
                        name="skills_summary"
                        placeholder="Brief summary of your key skills..."
                        rows={3}
                        className="bg-background text-foreground border-border text-sm"
                      />
                    </div>
                  </div>
                  </Card>

                  {/* Third Column - Contact Information */}
                  <Card
                    className={`${sectionCardClassName} ${formStep === 3 ? 'block' : 'hidden'}`}
                    data-form-step="3"
                  >
                  <div className={sectionBodyClassName}>
                    <div className="flex items-center gap-2 pb-3 border-b border-border/30">
                      <Building2 className="w-5 h-5 text-[#A89F91]" />
                      <h3 className="text-lg font-heading font-semibold text-foreground tracking-tight">
                        Contact & Account
                      </h3>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Email and phone are for verification only.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          required
                          className="bg-background text-foreground border-border"
                        />
                        <p className="text-xs text-muted-foreground">Not displayed publicly</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground text-sm">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          required
                          className="bg-background text-foreground border-border"
                        />
                        <p className="text-xs text-muted-foreground">Not displayed publicly</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="account_password" className="text-foreground text-sm">Password</Label>
                        <Input
                          id="account_password"
                          name="account_password"
                          type="password"
                          minLength={8}
                          placeholder="At least 8 characters"
                          required
                          className="bg-background text-foreground border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password" className="text-foreground text-sm">Confirm Password</Label>
                        <Input
                          id="confirm_password"
                          name="confirm_password"
                          type="password"
                          minLength={8}
                          placeholder="Re-enter your password"
                          required
                          className="bg-background text-foreground border-border"
                        />
                      </div>
                    </div>

                    {profileType === 'professional' && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground text-sm">Certifications</Label>
                          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto border border-border rounded-lg p-3">
                            {certifications.slice(0, 20).map((cert) => (
                              <div key={cert} className="flex items-center space-x-2">
                                <Checkbox id={`cert-${cert}`} name="certifications" value={cert} />
                                <Label htmlFor={`cert-${cert}`} className="text-xs text-foreground cursor-pointer">
                                  {cert}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">Scroll for more options</p>
                        </div>
                      </>
                    )}

                    <div className="bg-muted rounded-lg p-4 mt-6">
                      <h4 className="font-heading font-semibold text-foreground mb-2 text-sm">
                        Selected Participation Level
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground font-medium text-sm">
                            {selectedPlan?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedPlan?.price}
                            {selectedPlan?.period}
                          </p>
                        </div>
                        {!isCommunityOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowPricing(true);
                              setCurrentStep(steps.length);
                            }}
                            className="text-primary text-xs"
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  </Card>
                </div>

                <div className="flex flex-col gap-4 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    Step {formStep} of {totalFormSteps}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {formStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePreviousFormStep}
                        className="rounded-xl px-6"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    )}

                    {formStep < totalFormSteps && (
                      <Button
                        type="button"
                        onClick={handleNextFormStep}
                        className="rounded-xl bg-[#A89F91] px-6 text-white hover:bg-[#8A8279]"
                      >
                        Proceed
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {formStep === totalFormSteps && (
                  <>
                    <div className="flex items-start space-x-3 pt-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-foreground">
                        I agree to the <a href="/terms" className="text-primary">Standards & Conduct</a> and <a href="/privacy" className="text-primary">Privacy & Confidentiality</a>. Access varies by participation level.
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingApplication}
                      className="w-full rounded-xl bg-[#A89F91] px-12 py-4 text-base text-white hover:bg-[#8A8279]"
                    >
                      {submittingApplication ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Application...
                        </>
                      ) : isCommunityOnly || selectedTier.includes('community') || selectedTier.includes('free') ? (
                        'Create Account & Submit Application'
                      ) : (
                        'Submit Application'
                      )}
                    </Button>

                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Approvals within 1-12 hours. We will Email & Text Your Approval.
                    </p>

                    {!isCommunityOnly && !selectedTier.includes('free') && (
                      <p className="text-center text-xs text-muted-foreground">
                        Your profile will be published after approval and payment is processed
                      </p>
                    )}
                  </>
                )}
              </form>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Show pricing immediately after onboarding completes (unless community-only)
  if (currentStep === steps.length && !showPricing && !isCommunityOnly) {
    setShowPricing(true);
  }

  return null;
}
