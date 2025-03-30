import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const FAQ = () => {
  const faqs = [
    {
      question: "What is AI Diligence Pro?",
      answer: "AI Diligence Pro is an AI-powered platform that generates comprehensive due diligence reports for companies. Our platform leverages advanced AI technology to analyze company data and provide actionable insights in seconds, replacing the need for traditional registered investment advisors."
    },
    {
      question: "How accurate are the due diligence reports?",
      answer: "Our due diligence reports are generated using state-of-the-art AI models trained on vast amounts of financial and business data. While we strive for high accuracy, we recommend using our reports as a starting point for your research and decision-making process, complemented by your own analysis and judgment."
    },
    {
      question: "How long does it take to generate a report?",
      answer: "Reports are typically generated within seconds, depending on the complexity of the company being analyzed and current system load. This is significantly faster than traditional due diligence processes that can take days or weeks."
    },
    {
      question: "What information is included in a due diligence report?",
      answer: "Our comprehensive reports include company overview, business model analysis, market position, competitive landscape, financial analysis, risk assessment, growth opportunities, and investment considerations. The reports are designed to provide a holistic view of the company's current state and future prospects."
    },
    {
      question: "How do I access my saved reports?",
      answer: "Once you're logged in, you can access all your saved reports from the 'Reports' section in your dashboard. Reports are stored securely in your account and can be accessed anytime."
    },
    {
      question: "Can I export or share my reports?",
      answer: "Yes, all reports can be exported as PDF documents or shared directly via email. You can also generate shareable links to your reports for team collaboration."
    },
    {
      question: "What data sources do you use for the reports?",
      answer: "Our AI system analyzes data from various public sources including company filings, news articles, market reports, and industry analyses. We do not use proprietary or confidential information unless explicitly provided by the user."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security very seriously. All user data and generated reports are encrypted and stored securely. We do not share your data with third parties without your explicit consent. Please refer to our Privacy Policy for more details."
    },
    {
      question: "What subscription plans do you offer?",
      answer: "We offer various subscription plans including Free, Standard, and Premium tiers. Each plan offers different features and report generation limits. You can view detailed plan information on our Pricing page."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription at any time from the 'Settings' section in your account. Your access will continue until the end of your current billing period."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes, we offer a limited free trial that allows you to generate a sample report to experience our platform's capabilities before subscribing to a paid plan."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team through the 'Contact' page on our website, or directly via email at support@aidiligencepro.com. We typically respond within 24 hours."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - AI Diligence Pro</title>
        <meta name="description" content="Find answers to commonly asked questions about AI Diligence Pro's due diligence report generation platform." />
      </Helmet>

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about our AI-powered due diligence platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
              <CardDescription>
                Browse through our most frequently asked questions below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Contact our support team.
            </p>
            <div className="flex justify-center">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
