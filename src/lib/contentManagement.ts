export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  lastUpdated: string;
  isPublished: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

export interface CookieConsentConfig {
  enabled: boolean;
  title: string;
  message: string;
  acceptButtonText: string;
  declineButtonText: string;
  privacyLinkText: string;
  position: 'bottom' | 'top' | 'bottom-left' | 'bottom-right';
  theme: 'light' | 'dark';
}

export interface ContentManagementState {
  pages: ContentPage[];
  faqs: FAQItem[];
  cookieConfig: CookieConsentConfig;
}

const STORAGE_KEY = 'summerland_content_management';

export const defaultContent: ContentManagementState = {
  pages: [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      slug: 'privacy',
      content: `<h1>Privacy Policy</h1>
<p><strong>Last Updated:</strong> January 2025</p>

<h2>1. Introduction</h2>
<p>Summerland Estates ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>

<h2>2. Information We Collect</h2>
<p>We may collect the following types of information:</p>
<ul>
<li><strong>Personal Information:</strong> Name, email address, phone number, address, and other contact details.</li>
<li><strong>Professional Information:</strong> Resume, work history, certifications, skills, and qualifications.</li>
<li><strong>Account Information:</strong> Username, password, profile photos, and account preferences.</li>
<li><strong>Usage Data:</strong> Information about how you interact with our platform.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Provide and maintain our services</li>
<li>Match professionals with employers</li>
<li>Process transactions and payments</li>
<li>Communicate with you about our services</li>
<li>Improve our platform and user experience</li>
</ul>

<h2>4. Information Sharing</h2>
<p>We may share your information with:</p>
<ul>
<li>Other users as necessary for the service (e.g., employers viewing candidate profiles)</li>
<li>Service providers who assist in operating our platform</li>
<li>Legal authorities when required by law</li>
</ul>

<h2>5. Data Security</h2>
<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h2>6. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal information</li>
<li>Correct inaccurate information</li>
<li>Request deletion of your data</li>
<li>Opt-out of certain data processing activities</li>
</ul>

<h2>7. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at:<br>
Email: summerlandestates@summerlandestates.com</p>`,
      metaDescription: 'Summerland Estates Privacy Policy - Learn how we protect and handle your personal information.',
      lastUpdated: new Date().toISOString(),
      isPublished: true
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      slug: 'terms',
      content: `<h1>Terms & Conditions</h1>
<p><strong>Last Updated:</strong> January 2025</p>

<h2>1. Acceptance of Terms</h2>
<p>By accessing or using the Summerland Estates platform ("Service"), you agree to be bound by these Terms & Conditions. If you disagree with any part of the terms, you may not access the Service.</p>

<h2>2. Description of Service</h2>
<p>Summerland Estates is a private network connecting estate professionals with households seeking domestic staffing services. Our platform facilitates connections between job seekers and employers in the luxury domestic service industry.</p>

<h2>3. User Accounts</h2>
<p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for all activities under your account.</p>

<h2>4. User Conduct</h2>
<p>You agree not to:</p>
<ul>
<li>Provide false or misleading information</li>
<li>Harass, abuse, or harm other users</li>
<li>Use the service for illegal purposes</li>
<li>Share private contact information prematurely</li>
<li>Circumvent our platform's payment systems</li>
</ul>

<h2>5. Membership and Fees</h2>
<p>Certain features require paid membership. Fees are as displayed on our pricing page. All payments are non-refundable unless otherwise stated.</p>

<h2>6. Verification and Background Checks</h2>
<p>We offer optional verification and background check services. While we strive for accuracy, we cannot guarantee the completeness or reliability of background check information.</p>

<h2>7. Intellectual Property</h2>
<p>The Service and its original content, features, and functionality are owned by Summerland Estates and are protected by international copyright, trademark, and other intellectual property laws.</p>

<h2>8. Termination</h2>
<p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms.</p>

<h2>9. Limitation of Liability</h2>
<p>Summerland Estates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.</p>

<h2>10. Governing Law</h2>
<p>These Terms shall be governed by the laws of the State of California, United States, without regard to its conflict of law provisions.</p>

<h2>11. Changes to Terms</h2>
<p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.</p>

<h2>12. Contact Information</h2>
<p>For any questions about these Terms, please contact us:<br>
Email: summerlandestates@summerlandestates.com</p>`,
      metaDescription: 'Summerland Estates Terms & Conditions - Read our terms of service and user agreement.',
      lastUpdated: new Date().toISOString(),
      isPublished: true
    }
  ],
  faqs: [
    // Home Page - Frequently Asked Questions
    {
      id: '1',
      question: 'What is Summerland Estates?',
      answer: 'Summerland Estates is a private, curated directory and network connecting high-net-worth households with vetted professionals, service providers, and agencies specializing in estate living.',
      category: 'Getting Started',
      order: 1,
      isPublished: true
    },
    {
      id: '2',
      question: 'Who can join Summerland Estates?',
      answer: 'Our platform is designed for a select group of users, including: Estate principals and their assistants, Household staff (private chefs, estate managers, housekeepers, etc.), Luxury service providers and in-home businesses, Staffing agencies specializing in private placements. All members are subject to approval to maintain the integrity of the network.',
      category: 'Getting Started',
      order: 2,
      isPublished: true
    },
    {
      id: '3',
      question: 'How does the vetting process work?',
      answer: 'We review profiles for completeness, professionalism, and relevance to estate-level service. Select users may be asked for: Work history or portfolio, References, Verification details. Our goal is to ensure a trusted, high-quality environment for all members.',
      category: 'Getting Started',
      order: 3,
      isPublished: true
    },
    {
      id: '4',
      question: 'Is Summerland Estates a staffing agency?',
      answer: 'No. Summerland Estates is not an agency—we are a direct access platform that allows principals, managers, and professionals to connect without traditional intermediaries.',
      category: 'Getting Started',
      order: 4,
      isPublished: true
    },
    {
      id: '5',
      question: 'How do professionals find job opportunities?',
      answer: 'Professionals can create a detailed profile showcasing their: Experience, Skills, Availability, Certifications. Estate principals, assistants, and agencies can search and reach out directly for opportunities.',
      category: 'For Professionals',
      order: 5,
      isPublished: true
    },
    {
      id: '6',
      question: 'How do estate principals or assistants hire staff?',
      answer: 'You can browse curated profiles, filter by role and qualifications, and connect directly with candidates or agencies. For a more tailored experience, some users opt for concierge-style support.',
      category: 'For Employers',
      order: 6,
      isPublished: true
    },
    {
      id: '7',
      question: 'Can businesses and service providers join?',
      answer: 'Yes. We welcome luxury brands and service providers offering: In-home services, Estate maintenance, Lifestyle products. Business profiles allow you to showcase offerings and connect with qualified households.',
      category: 'For Businesses',
      order: 7,
      isPublished: true
    },
    {
      id: '8',
      question: 'What is the Summerland Estates community forum?',
      answer: 'Our private forum is a space for members to: Share insights and recommendations, Ask questions within the estate community, Connect with peers across roles. It is moderated to ensure relevance, professionalism, and discretion.',
      category: 'Community',
      order: 8,
      isPublished: true
    },
    {
      id: '9',
      question: 'What type of content is featured in estate news and articles?',
      answer: 'We publish curated content relevant to estate living, including: Industry trends, Staffing insights, Lifestyle and operational guidance, Best practices for managing and maintaining luxury properties.',
      category: 'Resources',
      order: 9,
      isPublished: true
    },
    {
      id: '10',
      question: 'Is my information private and secure?',
      answer: 'Yes. Privacy and discretion are central to Summerland Estates. We implement strict controls around visibility and access, and members are expected to uphold a high standard of confidentiality.',
      category: 'Privacy & Security',
      order: 10,
      isPublished: true
    },

    // Find a Professional Page FAQs
    {
      id: '11',
      question: 'What is the Summerland Estates Directory?',
      answer: 'The directory is a curated listing of household professionals, service providers, agencies, and businesses serving private estates and high-net-worth households.',
      category: 'Directory',
      order: 11,
      isPublished: true
    },
    {
      id: '12',
      question: 'Who appears in the directory?',
      answer: 'Only approved members with completed profiles are featured, including: Household staff (e.g., estate managers, private chefs), Service providers and luxury vendors, Staffing agencies. All profiles are reviewed to maintain quality and relevance.',
      category: 'Directory',
      order: 12,
      isPublished: true
    },
    {
      id: '13',
      question: 'How do I search for the right person or service?',
      answer: 'You can browse or filter by: Role or service type, Experience level, Location, Availability. This allows you to quickly find professionals or businesses suited to your needs.',
      category: 'Directory',
      order: 13,
      isPublished: true
    },
    {
      id: '14',
      question: 'Can I contact profiles directly?',
      answer: 'Yes. Depending on your membership level, you can message or connect directly with professionals, businesses, or agencies listed in the directory.',
      category: 'Directory',
      order: 14,
      isPublished: true
    },
    {
      id: '15',
      question: 'Are profiles verified or vetted?',
      answer: 'All profiles go through an approval process. Some may include additional verification such as references, credentials, or prior experience in estate settings.',
      category: 'Directory',
      order: 15,
      isPublished: true
    },
    {
      id: '16',
      question: 'Can agencies and businesses be found here too?',
      answer: 'Yes. The directory includes: Independent professionals, Staffing agencies, Businesses offering in-home or estate services. You can filter by category to refine your search.',
      category: 'Directory',
      order: 16,
      isPublished: true
    },
    {
      id: '17',
      question: 'How do I stand out in the directory as a professional or business?',
      answer: 'Complete profiles with: Detailed experience or service offerings, High-quality photos, Clear availability and location. Premium members may also receive enhanced visibility within search results.',
      category: 'Directory',
      order: 17,
      isPublished: true
    },
    {
      id: '18',
      question: 'Is the directory public?',
      answer: 'No. The directory is part of a controlled-access network, ensuring that only approved members can view and engage with profiles.',
      category: 'Directory',
      order: 18,
      isPublished: true
    },
    {
      id: '19',
      question: 'How often are profiles updated?',
      answer: 'Members can update their profiles at any time. We encourage regular updates to reflect: Current availability, New experience or services, Updated contact preferences.',
      category: 'Directory',
      order: 19,
      isPublished: true
    },
    {
      id: '20',
      question: 'What if I can\'t find what I\'m looking for?',
      answer: 'If your search doesn\'t return the right match, you can: Broaden your filters, Reach out to agencies within the directory, Request assistance through our support or concierge options (if available).',
      category: 'Directory',
      order: 20,
      isPublished: true
    },

    // Jobs & Service Requests FAQs
    {
      id: '21',
      question: 'What is the difference between a job posting and a service request?',
      answer: 'A job posting is for ongoing or long-term roles (e.g., estate manager, private chef), while a service request is for one-time or short-term needs (e.g., event staffing, repairs, installations).',
      category: 'Jobs & Services',
      order: 21,
      isPublished: true
    },
    {
      id: '22',
      question: 'Who can create a job or service request?',
      answer: 'Estate principals, family office representatives, personal assistants, and authorized household managers can create postings to hire staff or request services.',
      category: 'Jobs & Services',
      order: 22,
      isPublished: true
    },
    {
      id: '23',
      question: 'How do I create a job or service request?',
      answer: 'Simply select "Post a Job" or "Request a Service", then provide details such as: Role or service needed, Location, Schedule or timeline, Budget (optional), Specific requirements or preferences.',
      category: 'Jobs & Services',
      order: 23,
      isPublished: true
    },
    {
      id: '24',
      question: 'Can I keep my posting private or anonymous?',
      answer: 'Yes. You can choose to limit visibility or keep identifying details confidential while still receiving qualified inquiries.',
      category: 'Jobs & Services',
      order: 24,
      isPublished: true
    },
    {
      id: '25',
      question: 'How do candidates or providers respond?',
      answer: 'Professionals, businesses, and agencies can: Submit interest or proposals, Message you directly, Share their profile and relevant experience. You can review and respond at your discretion.',
      category: 'Jobs & Services',
      order: 25,
      isPublished: true
    },
    {
      id: '26',
      question: 'Can I invite specific individuals or agencies to apply?',
      answer: 'Yes. You may directly invite selected professionals, businesses, or agencies from the directory to respond to your posting.',
      category: 'Jobs & Services',
      order: 26,
      isPublished: true
    },
    {
      id: '27',
      question: 'How are candidates or providers vetted?',
      answer: 'All users on the platform are approved before joining. Many profiles include verified experience, references, or credentials relevant to estate-level service.',
      category: 'Jobs & Services',
      order: 27,
      isPublished: true
    },
    {
      id: '28',
      question: 'Is there support if I need help finding the right match?',
      answer: 'Yes. Depending on your membership, you may access concierge support to help refine your request and identify qualified candidates or providers.',
      category: 'Jobs & Services',
      order: 28,
      isPublished: true
    },
    {
      id: '29',
      question: 'How long do postings stay active?',
      answer: 'You can set a preferred timeframe or keep your posting active until the role or service is fulfilled. Listings can be edited, paused, or closed at any time.',
      category: 'Jobs & Services',
      order: 29,
      isPublished: true
    },
    {
      id: '30',
      question: 'Are payments handled through Summerland Estates?',
      answer: 'Summerland Estates facilitates connections but does not directly process payments. Terms, compensation, and agreements are handled privately between parties unless otherwise specified.',
      category: 'Jobs & Services',
      order: 30,
      isPublished: true
    },

    // Community Forum FAQs
    {
      id: '31',
      question: 'What is the Summerland Estates Community?',
      answer: 'The Community is a private, location-based forum where members connect, share insights, and exchange trusted recommendations within their local estate network.',
      category: 'Community',
      order: 31,
      isPublished: true
    },
    {
      id: '32',
      question: 'Who can access the community forum?',
      answer: 'Only approved Summerland Estates members can participate. Access is limited to maintain a discreet, high-quality environment.',
      category: 'Community',
      order: 32,
      isPublished: true
    },
    {
      id: '33',
      question: 'Is the community organized by city?',
      answer: 'Yes. Discussions are grouped by specific cities and regions, allowing members to connect with others operating within the same local estate landscape.',
      category: 'Community',
      order: 33,
      isPublished: true
    },
    {
      id: '34',
      question: 'What can I post in the forum?',
      answer: 'Members commonly share: Trusted service recommendations, Staffing referrals, Local insights and resources, Industry-related questions. All content should remain relevant to estate living and professional services.',
      category: 'Community',
      order: 34,
      isPublished: true
    },
    {
      id: '35',
      question: 'Can I promote my services or business in the community?',
      answer: 'Subtle, relevant participation is welcome, but overt self-promotion or solicitation is discouraged. The focus is on value-driven contributions and trusted engagement.',
      category: 'Community',
      order: 35,
      isPublished: true
    },
    {
      id: '36',
      question: 'Are conversations private?',
      answer: 'Yes. The forum is not publicly accessible, and members are expected to maintain confidentiality and discretion at all times.',
      category: 'Community',
      order: 36,
      isPublished: true
    },
    {
      id: '37',
      question: 'How is the community moderated?',
      answer: 'Our team actively monitors discussions to ensure they remain: Respectful, Relevant, Aligned with the standards of the platform. Posts may be removed if they do not meet these guidelines.',
      category: 'Community',
      order: 37,
      isPublished: true
    },
    {
      id: '38',
      question: 'Can I connect with other members directly?',
      answer: 'Yes. You may message or connect with other members based on your membership permissions and mutual interest.',
      category: 'Community',
      order: 38,
      isPublished: true
    },
    {
      id: '39',
      question: 'What if I encounter inappropriate content?',
      answer: 'You can report posts or users directly. Our team will review promptly to preserve the integrity of the community.',
      category: 'Community',
      order: 39,
      isPublished: true
    },
    {
      id: '40',
      question: 'How do I get the most value from the community?',
      answer: 'Engage thoughtfully—ask questions, share experiences, and contribute insights. The strongest outcomes come from trusted relationships built over time.',
      category: 'Community',
      order: 40,
      isPublished: true
    },

    // Events FAQs
    {
      id: '41',
      question: 'What types of events are featured?',
      answer: 'We feature curated events relevant to estate living, including: Private networking gatherings, Industry panels and discussions, Luxury brand experiences, Regional meetups for professionals and principals.',
      category: 'Events',
      order: 41,
      isPublished: true
    },
    {
      id: '42',
      question: 'Who can attend events?',
      answer: 'Most events are available to approved members, with some being invite-only or limited access depending on the host and format.',
      category: 'Events',
      order: 42,
      isPublished: true
    },
    {
      id: '43',
      question: 'How do I RSVP or attend an event?',
      answer: 'You can view event details and RSVP directly through the platform. Some events may require approval or confirmation prior to attendance.',
      category: 'Events',
      order: 43,
      isPublished: true
    },
    {
      id: '44',
      question: 'Can I host an event through Summerland Estates?',
      answer: 'Yes. Select members and partners may submit events for consideration. Approved events must align with the quality and discretion standards of the network.',
      category: 'Events',
      order: 44,
      isPublished: true
    },
    {
      id: '45',
      question: 'Are events in-person or virtual?',
      answer: 'We offer a mix of both, depending on the event type and location. Many are designed to foster local, in-person connections.',
      category: 'Events',
      order: 45,
      isPublished: true
    },
    {
      id: '46',
      question: 'Are events location-specific?',
      answer: 'Yes. Many events are curated by city or region, allowing members to connect within their local estate and service community.',
      category: 'Events',
      order: 46,
      isPublished: true
    },
    {
      id: '47',
      question: 'Is there a cost to attend events?',
      answer: 'Some events are complimentary, while others may require a fee depending on the host, venue, or experience offered. Details are provided within each listing.',
      category: 'Events',
      order: 47,
      isPublished: true
    },
    {
      id: '48',
      question: 'Can I bring a guest to an event?',
      answer: 'Guest access varies by event. Some allow approved guests, while others remain strictly members-only to preserve privacy and discretion.',
      category: 'Events',
      order: 48,
      isPublished: true
    },
    {
      id: '49',
      question: 'Will I receive reminders or updates about events?',
      answer: 'Yes. Members may receive notifications or updates regarding upcoming events, confirmations, or changes based on their preferences.',
      category: 'Events',
      order: 49,
      isPublished: true
    },
    {
      id: '50',
      question: 'What is the typical atmosphere of Summerland Estates events?',
      answer: 'Events are designed to be refined, intimate, and highly curated, prioritizing meaningful connections over large-scale attendance.',
      category: 'Events',
      order: 50,
      isPublished: true
    },

    // Articles FAQs
    {
      id: '51',
      question: 'What kind of articles are published?',
      answer: 'Our editorial content focuses on: Estate management insights, Staffing trends and best practices, Luxury lifestyle and operations, Industry news and developments.',
      category: 'Resources',
      order: 51,
      isPublished: true
    },
    {
      id: '52',
      question: 'Who writes the articles?',
      answer: 'Content is contributed by industry professionals, experienced operators, and the Summerland Estates editorial team.',
      category: 'Resources',
      order: 52,
      isPublished: true
    },
    {
      id: '53',
      question: 'How often is new content published?',
      answer: 'We regularly publish new articles to keep members informed on relevant trends and insights within the estate ecosystem.',
      category: 'Resources',
      order: 53,
      isPublished: true
    },
    {
      id: '54',
      question: 'Can members contribute articles?',
      answer: 'Yes. Qualified members may submit content or be invited to contribute based on their expertise and experience.',
      category: 'Resources',
      order: 54,
      isPublished: true
    },
    {
      id: '55',
      question: 'Is the content publicly accessible?',
      answer: 'Select content may be public, but much of our editorial and insights are reserved for members within the network.',
      category: 'Resources',
      order: 55,
      isPublished: true
    },
    {
      id: '56',
      question: 'Can I save or bookmark articles?',
      answer: 'Yes. Members can save articles for easy access and revisit content relevant to their work or interests.',
      category: 'Resources',
      order: 56,
      isPublished: true
    },
    {
      id: '57',
      question: 'Are articles tailored to different roles within the estate?',
      answer: 'Yes. Content is curated to serve a range of members, including: Estate principals, Managers and assistants, Household staff, Service providers and businesses.',
      category: 'Resources',
      order: 57,
      isPublished: true
    },
    {
      id: '58',
      question: 'Do articles include practical resources or templates?',
      answer: 'Select articles may include actionable insights, checklists, or guidance that can be applied directly within estate operations.',
      category: 'Resources',
      order: 58,
      isPublished: true
    },
    {
      id: '59',
      question: 'Can I share articles with others?',
      answer: 'Sharing options may be available depending on the content. Some articles are restricted to maintain member-only value and exclusivity.',
      category: 'Resources',
      order: 59,
      isPublished: true
    },
    {
      id: '60',
      question: 'How is content kept relevant and up to date?',
      answer: 'Our editorial team regularly reviews and updates content to reflect current standards, trends, and practices within the estate and luxury service industry.',
      category: 'Resources',
      order: 60,
      isPublished: true
    }
  ],
  cookieConfig: {
    enabled: true,
    title: 'Cookie Consent',
    message: 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
    acceptButtonText: 'Accept All',
    declineButtonText: 'Decline',
    privacyLinkText: 'Privacy Policy',
    position: 'bottom',
    theme: 'light'
  }
};

export const contentManager = {
  getContent(): ContentManagementState {
    if (typeof window === 'undefined') return defaultContent;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultContent));
      return defaultContent;
    }
    try {
      return { ...defaultContent, ...JSON.parse(stored) };
    } catch {
      return defaultContent;
    }
  },

  saveContent(content: ContentManagementState): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  },

  getPage(slug: string): ContentPage | undefined {
    const content = this.getContent();
    return content.pages.find(p => p.slug === slug && p.isPublished);
  },

  updatePage(page: ContentPage): void {
    const content = this.getContent();
    const index = content.pages.findIndex(p => p.id === page.id);
    if (index >= 0) {
      content.pages[index] = { ...page, lastUpdated: new Date().toISOString() };
    } else {
      content.pages.push({ ...page, lastUpdated: new Date().toISOString() });
    }
    this.saveContent(content);
  },

  deletePage(id: string): void {
    const content = this.getContent();
    content.pages = content.pages.filter(p => p.id !== id);
    this.saveContent(content);
  },

  getFAQs(category?: string): FAQItem[] {
    const content = this.getContent();
    let faqs = content.faqs.filter(f => f.isPublished).sort((a, b) => a.order - b.order);
    if (category) {
      faqs = faqs.filter(f => f.category === category);
    }
    return faqs;
  },

  getFAQCategories(): string[] {
    const content = this.getContent();
    const categories = new Set(content.faqs.map(f => f.category));
    return Array.from(categories);
  },

  updateFAQ(faq: FAQItem): void {
    const content = this.getContent();
    const index = content.faqs.findIndex(f => f.id === faq.id);
    if (index >= 0) {
      content.faqs[index] = faq;
    } else {
      content.faqs.push(faq);
    }
    this.saveContent(content);
  },

  deleteFAQ(id: string): void {
    const content = this.getContent();
    content.faqs = content.faqs.filter(f => f.id !== id);
    this.saveContent(content);
  },

  reorderFAQs(orderedIds: string[]): void {
    const content = this.getContent();
    orderedIds.forEach((id, index) => {
      const faq = content.faqs.find(f => f.id === id);
      if (faq) {
        faq.order = index + 1;
      }
    });
    this.saveContent(content);
  },

  getCookieConfig(): CookieConsentConfig {
    const content = this.getContent();
    return content.cookieConfig;
  },

  updateCookieConfig(config: CookieConsentConfig): void {
    const content = this.getContent();
    content.cookieConfig = config;
    this.saveContent(content);
  },

  exportData(): string {
    return JSON.stringify(this.getContent(), null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      this.saveContent(data);
      return true;
    } catch {
      return false;
    }
  },

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultContent));
  }
};
