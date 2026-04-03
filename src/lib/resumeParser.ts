export interface ParsedReference {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

export interface ParsedWorkHistory {
  title?: string;
  employer?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ResumeParseResult {
  rawText: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  skills: string[];
  yearsExperience?: string;
  workHistory: ParsedWorkHistory[];
  references: ParsedReference[];
}

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  january: '01',
  feb: '02',
  february: '02',
  mar: '03',
  march: '03',
  apr: '04',
  april: '04',
  may: '05',
  jun: '06',
  june: '06',
  jul: '07',
  july: '07',
  aug: '08',
  august: '08',
  sep: '09',
  sept: '09',
  september: '09',
  oct: '10',
  october: '10',
  nov: '11',
  november: '11',
  dec: '12',
  december: '12',
};

const DATE_RANGE_PATTERN =
  /\b(?:(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)\s+)?((?:19|20)\d{2})\s*(?:-|–|—|to)\s*(?:(Present|Current)|(?:(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)\s+)?((?:19|20)\d{2}))\b/i;

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
}

function sanitizeExtractedText(value: string) {
  return normalizeWhitespace(
    value
      .replace(/\b(?:xref|endobj|obj|stream|endstream|startxref|trailer)\b/gi, ' ')
      .replace(/\b\d+\s+\d+\s+obj\b/gi, ' ')
      .replace(/\b\d{5,}\b/g, ' ')
      .replace(/[^\S\n]{2,}/g, ' ')
  );
}

function isMeaningfulSentence(value: string) {
  const letters = (value.match(/[A-Za-z]/g) || []).length;
  const digits = (value.match(/\d/g) || []).length;
  return letters >= 20 && digits < letters;
}

function containsContactOnlyContent(value: string) {
  return /https?:\/\/|@[A-Z0-9.-]+\.[A-Z]{2,}|(?:\+?\d{1,2}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?){2}\d{4}/i.test(value);
}

function hasEnoughNaturalLanguage(value: string) {
  const words = value.match(/[A-Za-z][A-Za-z'-]{2,}/g) || [];
  return words.length >= 8;
}

function hasCorruptedPdfMarkers(value: string) {
  return /xref|endobj|startxref|0000000|stream|endstream/i.test(value);
}

function splitLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function extractPhone(text: string) {
  return text.match(/(?:\+?\d{1,2}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?){2}\d{4}/)?.[0];
}

function extractUrl(text: string, matcher: RegExp) {
  return text.match(matcher)?.[0];
}

function extractPortfolioUrl(text: string) {
  const urls = Array.from(text.matchAll(/https?:\/\/[^\s)]+/gi)).map((match) => match[0]);
  return urls.find((url) => /portfolio|behance|dribbble|github|about\.me|carbonmade|clippings\.me/i.test(url));
}

function extractLocation(text: string) {
  const match = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s?[A-Z]{2})\b/);
  return match?.[1];
}

function isContactLine(line: string) {
  return containsContactOnlyContent(line);
}

function isLikelyHeading(line: string) {
  return (
    /^[A-Z][A-Z\s/&-]{2,}$/.test(line) ||
    /^(summary|profile|objective|experience|employment|work history|professional experience|education|skills|references|certifications)$/i.test(line)
  );
}

function isLikelyNameLine(line: string) {
  if (line.length < 3 || line.length > 60) return false;
  if (/\d/.test(line)) return false;
  if (isContactLine(line)) return false;
  if (isLikelyHeading(line)) return false;
  if (/resume|curriculum vitae|professional summary|experience|skills/i.test(line)) return false;

  const words = line.split(/\s+/);
  return words.length >= 2 && words.length <= 4 && words.every((word) => /^[A-Za-z'.-]+$/.test(word));
}

function extractName(text: string, email?: string) {
  const firstChunk = splitLines(text).slice(0, 8);
  for (const line of firstChunk) {
    if (email && line.includes(email)) continue;
    if (isLikelyNameLine(line)) {
      return line;
    }
  }

  return undefined;
}

function extractNameFromFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const stripped = baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\b(?:resume|cv|curriculum vitae|full stack developer|developer|engineer|manager|profile)\b/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const words = stripped
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => /^[A-Za-z'.-]+$/.test(word))
    .slice(0, 4);

  if (words.length >= 2) {
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return undefined;
}

function extractNameFromLinkedIn(linkedinUrl?: string) {
  if (!linkedinUrl) return undefined;

  const slug = linkedinUrl
    .split('/in/')[1]
    ?.split(/[/?#]/)[0]
    ?.replace(/-\d+[a-z0-9]*$/i, '')
    ?.replace(/[^a-z-]/gi, ' ')
    ?.trim();

  if (!slug) return undefined;

  const words = slug
    .split(/[-\s]+/)
    .filter((word) => /^[a-z]{2,}$/i.test(word))
    .slice(0, 4);

  if (words.length < 2) return undefined;

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function extractNameFromEmail(email?: string) {
  if (!email) return undefined;

  const local = email.split('@')[0];
  const words = local
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .filter((word) => /^[a-z]{2,}$/i.test(word))
    .slice(0, 3);

  if (words.length < 2) return undefined;

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function extractYearsExperience(text: string) {
  const explicit = text.match(/(\d{1,2})\+?\s+years?\s+of\s+experience/i);
  if (explicit) return explicit[1];

  const dates = Array.from(text.matchAll(/\b(19\d{2}|20\d{2})\b/g)).map((match) => Number(match[1]));
  if (dates.length > 1) {
    const firstYear = Math.min(...dates);
    const currentYear = new Date().getFullYear();
    if (firstYear <= currentYear) {
      return String(Math.min(Math.max(currentYear - firstYear, 0), 50));
    }
  }

  return undefined;
}

function extractSkills(text: string) {
  const sectionMatch = text.match(/skills?[:\s]+([\s\S]{0,320})/i);
  const source = sectionMatch?.[1] || text;
  const candidateText = source.split(/\n{2,}/)[0];
  const candidates = candidateText
    .split(/[\n,|•]/)
    .map((item) => item.replace(/^[\s:-]+|[\s:-]+$/g, '').trim())
    .filter(Boolean)
    .filter((item) => item.length > 1 && item.length < 50)
    .filter((item) => !/\b(?:xref|endobj|startxref|obj|stream)\b/i.test(item))
    .filter((item) => !/^\d[\d\s.,-]+$/.test(item));

  return Array.from(new Set(candidates))
    .filter((item) => !containsContactOnlyContent(item))
    .filter((item) => /^[A-Za-z0-9&/+,.# -]+$/.test(item))
    .filter((item) => hasEnoughNaturalLanguage(item) || item.split(/\s+/).length <= 4)
    .slice(0, 12);
}

function splitSections(text: string) {
  return text
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean);
}

function extractSectionText(text: string, headings: RegExp[]) {
  const lines = text.split('\n');
  const startIndex = lines.findIndex((line) => headings.some((heading) => heading.test(line.trim())));

  if (startIndex === -1) {
    return '';
  }

  const collected: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      collected.push('');
      continue;
    }

    if (isLikelyHeading(line) && !headings.some((heading) => heading.test(line))) {
      break;
    }

    collected.push(line);
  }

  return normalizeWhitespace(collected.join('\n'));
}

function normalizeMonthValue(month?: string | null, year?: string | null) {
  if (!year) return undefined;
  if (!month) return `${year}-01`;
  const normalized = MONTH_MAP[month.toLowerCase()];
  return `${year}-${normalized || '01'}`;
}

function parseDateRange(value: string) {
  const match = value.match(DATE_RANGE_PATTERN);
  if (!match) return null;

  return {
    startDate: normalizeMonthValue(match[1], match[2]),
    endDate: match[3] ? 'Present' : normalizeMonthValue(match[4], match[5]),
  };
}

function extractWorkHistory(text: string) {
  const sectionText =
    extractSectionText(text, [/professional experience/i, /work history/i, /^experience$/i, /employment/i]) || text;
  const lines = splitLines(sectionText);
  const dateIndexes = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => DATE_RANGE_PATTERN.test(line))
    .map(({ index }) => index);

  const entries: ParsedWorkHistory[] = [];

  for (let pointer = 0; pointer < dateIndexes.length && entries.length < 2; pointer += 1) {
    const dateIndex = dateIndexes[pointer];
    const nextDateIndex = dateIndexes[pointer + 1] ?? lines.length;
    const dateInfo = parseDateRange(lines[dateIndex]);

    const beforeLines = lines
      .slice(Math.max(0, dateIndex - 2), dateIndex)
      .filter((line) => !isLikelyHeading(line) && !isContactLine(line) && !DATE_RANGE_PATTERN.test(line));
    const afterLines = lines
      .slice(dateIndex + 1, nextDateIndex)
      .filter((line) => !isLikelyHeading(line) && !isContactLine(line));

    let title = beforeLines[0];
    let employer = beforeLines[1];

    if (beforeLines.length === 1) {
      title = beforeLines[0];
      employer = afterLines.find((line) => line.length <= 80 && !/responsible|managed|oversaw|led|supported/i.test(line));
    }

    const description = afterLines
      .filter((line) => line.length > 20)
      .slice(0, 3)
      .join(' ')
      .trim();

    const cleanedTitle = title && title.length <= 80 ? title : undefined;
    const cleanedEmployer = employer && employer.length <= 100 ? employer : undefined;

    if (!cleanedTitle && !cleanedEmployer) {
      continue;
    }

    entries.push({
      title: cleanedTitle,
      employer: cleanedEmployer,
      startDate: dateInfo?.startDate,
      endDate: dateInfo?.endDate,
      description: description || undefined,
    });
  }

  return entries;
}

function extractReferences(text: string) {
  const refSectionMatch = text.match(/references?[:\s]+([\s\S]{0,500})/i);
  if (!refSectionMatch) {
    return [];
  }

  const lines = refSectionMatch[1]
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  const references: ParsedReference[] = [];
  for (let index = 0; index < lines.length; index += 2) {
    const current = lines[index];
    const next = lines[index + 1] || '';
    references.push({
      name: current && !extractEmail(current) && !extractPhone(current) ? current : undefined,
      email: extractEmail(`${current} ${next}`),
      phone: extractPhone(`${current} ${next}`),
    });
  }

  return references.slice(0, 2);
}

function extractPdfText(buffer: ArrayBuffer) {
  const binary = new TextDecoder('latin1').decode(new Uint8Array(buffer));
  const literalMatches = Array.from(binary.matchAll(/\(([^()]*)\)\s*Tj/g)).map((match) => match[1]);
  const arrayMatches = Array.from(binary.matchAll(/\[(.*?)\]\s*TJ/g)).map((match) => match[1]);
  const extractedText = [...literalMatches, ...arrayMatches]
    .join(' ')
    .replace(/\\[nrt]/g, ' ')
    .replace(/\\\)/g, ')')
    .replace(/\\\(/g, '(')
    .replace(/\\\d{3}/g, ' ');

  const sanitized = sanitizeExtractedText(extractedText);
  if (sanitized.trim().length > 80 && !hasCorruptedPdfMarkers(sanitized)) {
    return sanitized;
  }

  const uriMatches = Array.from(binary.matchAll(/https?:\/\/[^\s)<>\]]+/gi)).map((match) => match[0]);
  const emailMatches = Array.from(binary.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)).map((match) => match[0]);
  const phoneMatches = Array.from(binary.matchAll(/(?:\+?\d{1,2}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?){2}\d{4}/g)).map((match) => match[0]);
  return sanitizeExtractedText([...uriMatches, ...emailMatches, ...phoneMatches].join('\n'));
}

function extractSummary(text: string) {
  const sections = splitSections(text);
  const orderedCandidates = [
    ...sections.filter((section) => /summary|profile|about|objective/i.test(section)),
    ...sections,
  ];

  for (const candidate of orderedCandidates) {
    const normalizedCandidate = candidate.replace(/\s+/g, ' ').trim();
    if (!normalizedCandidate) continue;
    if (containsContactOnlyContent(normalizedCandidate)) continue;
    if (!isMeaningfulSentence(normalizedCandidate)) continue;
    if (!hasEnoughNaturalLanguage(normalizedCandidate)) continue;
    return normalizedCandidate;
  }

  return undefined;
}

async function readResumeText(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (file.type.startsWith('text/') || extension === 'txt' || extension === 'md' || extension === 'csv') {
    return file.text();
  }

  if (extension === 'pdf' || file.type === 'application/pdf') {
    return extractPdfText(await file.arrayBuffer());
  }

  const fallbackBuffer = await file.arrayBuffer();
  return new TextDecoder('latin1').decode(new Uint8Array(fallbackBuffer));
}

export async function parseResumeFile(file: File): Promise<ResumeParseResult> {
  const rawText = normalizeWhitespace(await readResumeText(file));
  const cleanedText = sanitizeExtractedText(rawText);
  const highQualityText = cleanedText.length >= 80 && !hasCorruptedPdfMarkers(cleanedText);
  const email = extractEmail(cleanedText);
  const phone = extractPhone(cleanedText);
  const linkedinUrl = extractUrl(cleanedText, /https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i);
  const websiteUrl = extractUrl(cleanedText, /https?:\/\/(?!www\.linkedin\.com)[^\s)]+/i);
  const portfolioUrl = extractPortfolioUrl(cleanedText);
  const summary = highQualityText ? extractSummary(cleanedText) : undefined;
  const skills = highQualityText ? extractSkills(cleanedText) : [];
  const workHistory = highQualityText ? extractWorkHistory(cleanedText) : [];
  const references = highQualityText ? extractReferences(cleanedText) : [];
  const derivedYearsExperience =
    extractYearsExperience(cleanedText) ||
    (() => {
      const startYears = workHistory
        .map((entry) => entry.startDate?.slice(0, 4))
        .filter(Boolean)
        .map((year) => Number(year));
      if (!startYears.length) return undefined;
      const firstYear = Math.min(...startYears);
      const currentYear = new Date().getFullYear();
      return String(Math.min(Math.max(currentYear - firstYear, 0), 50));
    })();

  return {
    rawText: cleanedText,
    name:
      (highQualityText ? extractName(cleanedText, email) : undefined) ||
      extractNameFromLinkedIn(linkedinUrl) ||
      extractNameFromEmail(email) ||
      extractNameFromFileName(file.name),
    email,
    phone,
    location: highQualityText ? extractLocation(cleanedText) : undefined,
    linkedinUrl,
    websiteUrl,
    portfolioUrl,
    summary,
    skills,
    yearsExperience: highQualityText ? derivedYearsExperience : undefined,
    workHistory,
    references,
  };
}
