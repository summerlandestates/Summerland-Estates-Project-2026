import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { contentManager, FAQItem } from '@/lib/contentManagement';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};


export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadFAQs();
  }, []);

  const loadFAQs = () => {
    const allFAQs = contentManager.getFAQs();
    const allCategories = contentManager.getFAQCategories();
    setFaqs(allFAQs);
    setCategories(allCategories);
    setLoading(false);
  };

  const filteredFAQs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  const faqsByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredFAQs.filter(f => f.category === category);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="faqs" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead
        title="FAQs - Summerland Estates"
        description="Frequently asked questions about Summerland Estates — membership, professionals, placements, and how our private estate staffing network works."
        canonical="/faqs"
        schema={faqSchema}
      />
      <NavBar currentPage="faqs" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-5xl font-heading font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Summerland Estates
            </p>
          </motion.div>

          {/* Category Filter with Animation */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
                activeCategory === 'all'
                  ? 'bg-[#A89F91] text-white shadow-md transform scale-105'
                  : 'bg-muted hover:bg-muted/80 hover:scale-105'
              }`}
            >
              All Questions
            </button>
            {categories.map((category, index) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
                  activeCategory === category
                    ? 'bg-[#A89F91] text-white shadow-md transform scale-105'
                    : 'bg-muted hover:bg-muted/80 hover:scale-105'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* FAQs by Category with Transitions */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeCategory}
              className="space-y-8"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
            >
              {activeCategory === 'all' ? (
                // Show all categories
                categories.map((category) => (
                  <motion.div key={category} variants={itemVariants}>
                    <Card className="p-6 bg-card text-card-foreground overflow-hidden">
                      <motion.div 
                        className="flex items-center gap-2 mb-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <HelpCircle className="w-5 h-5 text-[#A89F91]" />
                        <h2 className="text-xl font-heading font-bold">{category}</h2>
                      </motion.div>
                      <Accordion type="single" collapsible className="w-full">
                        {faqsByCategory[category]?.map((faq, index) => (
                          <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <AccordionItem value={faq.id} className="border-b border-muted/50 last:border-0">
                              <AccordionTrigger className="text-left font-medium py-4 hover:no-underline transition-all duration-200 hover:text-[#A89F91]">
                                {faq.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {faq.answer}
                                </motion.div>
                              </AccordionContent>
                            </AccordionItem>
                          </motion.div>
                        ))}
                      </Accordion>
                    </Card>
                  </motion.div>
                ))
              ) : (
                // Show single category
                <motion.div variants={itemVariants}>
                  <Card className="p-6 bg-card text-card-foreground overflow-hidden">
                    <motion.div 
                      className="flex items-center gap-2 mb-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HelpCircle className="w-5 h-5 text-[#A89F91]" />
                      <h2 className="text-xl font-heading font-bold">{activeCategory}</h2>
                    </motion.div>
                    <Accordion type="single" collapsible className="w-full">
                      {faqsByCategory[activeCategory]?.map((faq, index) => (
                        <motion.div
                          key={faq.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <AccordionItem value={faq.id} className="border-b border-muted/50 last:border-0">
                            <AccordionTrigger className="text-left font-medium py-4 hover:no-underline transition-all duration-200 hover:text-[#A89F91]">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                {faq.answer}
                              </motion.div>
                            </AccordionContent>
                          </AccordionItem>
                        </motion.div>
                      ))}
                    </Accordion>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* No FAQs Message */}
          {faqs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-8 bg-card text-card-foreground text-center">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-heading font-bold mb-2">No FAQs Available</h3>
                <p className="text-muted-foreground">
                  FAQs will be added soon. Please check back later or contact us for assistance.
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}