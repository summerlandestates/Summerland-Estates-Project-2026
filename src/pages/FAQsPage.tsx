import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I create a profile?',
    answer: 'Click on "Join" in the navigation menu and choose whether you\'re a professional or service provider. Fill out the required information and submit your profile for review. Once approved, your profile will be visible in our directory.'
  },
  {
    question: 'What types of profiles can I create?',
    answer: 'You can create two types of profiles: Professional (for estate staff like managers, chefs, housekeepers, etc.) or Service Provider (for businesses offering estate services like landscaping, pool maintenance, cleaning, etc.).'
  },
  {
    question: 'How much does it cost to list my profile?',
    answer: 'We offer various pricing tiers depending on your needs. Basic listings are free, while premium features like enhanced visibility, booking systems, and priority placement require a subscription. Visit our Pricing page for detailed information.'
  },
  {
    question: 'How do I verify my profile?',
    answer: 'Profile verification involves submitting documentation such as certifications, licenses, references, and undergoing a background check. Verified profiles receive a badge and are prioritized in search results.'
  },
  {
    question: 'Can I edit my profile after it\'s published?',
    answer: 'Yes, you can edit your profile at any time by logging into your account. Changes to basic information are immediate, while changes to verification status may require re-review.'
  },
  {
    question: 'How does the messaging system work?',
    answer: 'Businesses and professionals can send messages to estate managers, chiefs of staff, and assistants filtered by location. Recipients must have messaging enabled on their profiles to receive messages.'
  },
  {
    question: 'What is the Collective?',
    answer: 'The Collective is our community feature where you can join your local neighborhood group, share information, post alerts, access a marketplace, and connect with nearby estate staff and residents.'
  },
  {
    question: 'How do I join my community in the Collective?',
    answer: 'You can only join a community that matches the city listed on your profile. If a community doesn\'t exist for your city, you can create one and become the first member.'
  },
  {
    question: 'Can I save profiles I\'m interested in?',
    answer: 'Yes, click the heart icon on any profile to save it to your "Saved Profiles" page. You can compare up to 5 saved profiles side-by-side to help make hiring decisions.'
  },
  {
    question: 'How does the profile comparison feature work?',
    answer: 'Select 2-5 profiles from your saved profiles and click "Compare." You\'ll see a detailed comparison showing similarities, differences, strengths, and considerations for each profile.'
  },
  {
    question: 'What are the Estate Management Tools?',
    answer: 'We provide free downloadable templates for budgeting, vendor comparison, training manuals, emergency procedures, inventory management, and more to help you run your estate efficiently.'
  },
  {
    question: 'How do I post a job?',
    answer: 'Click on "Jobs" in the navigation menu and fill out the job posting form. You\'ll need to create an account to post jobs. Your listing will be visible to all professionals in our directory.'
  },
  {
    question: 'Are background checks required?',
    answer: 'Background checks are not required but highly recommended. Profiles that have completed background checks receive verification badges and are more likely to be contacted by employers.'
  },
  {
    question: 'How do I contact someone whose profile I\'m interested in?',
    answer: 'Each profile has a "Contact" button that allows you to send a direct message. Some profiles may also display phone numbers or email addresses for direct contact.'
  },
  {
    question: 'What if I have a complaint about a profile or service?',
    answer: 'Please contact us immediately through our Contact page with details about your concern. We take all complaints seriously and will investigate promptly.'
  }
];

export default function FAQsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="faqs" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about our directory
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      <Footer />
    </div>
  );
}
