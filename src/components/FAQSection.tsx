import { useState, useEffect } from 'react';
import { contentManager, FAQItem } from '@/lib/contentManagement';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

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

interface FAQSectionProps {
  category: string;
  title?: string;
  subtitle?: string;
  maxItems?: number;
  className?: string;
}

export default function FAQSection({ 
  category, 
  title = "Frequently Asked Questions", 
  subtitle,
  maxItems,
  className = ""
}: FAQSectionProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, [category]);

  const loadFAQs = () => {
    setLoading(true);
    const allFAQs = contentManager.getFAQs(category);
    const filteredFAQs = maxItems ? allFAQs.slice(0, maxItems) : allFAQs;
    setFaqs(filteredFAQs);
    setLoading(false);
  };

  if (loading) {
    return (
      <section className={`py-16 ${className}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-muted/50">
              <Accordion type="single" collapsible className="space-y-0">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    variants={itemVariants}
                    custom={index}
                  >
                    <AccordionItem 
                      value={faq.id} 
                      className="border-b border-muted/50 last:border-0"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5 text-base font-semibold transition-all duration-300 ease-in-out hover:text-[#A89F91] [&[data-state=open]>svg]:rotate-180 [&[data-state=open]]:text-[#A89F91]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed transition-all duration-300 ease-in-out">
                        <div className="prose prose-sm max-w-none">
                          {faq.answer.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-2 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </Card>
          </AnimatePresence>
        </motion.div>

        {maxItems && faqs.length >= maxItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <a
              href="/faqs"
              className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              View All FAQs
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
