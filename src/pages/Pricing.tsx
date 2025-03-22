import { Helmet } from 'react-helmet-async';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Starter',
    price: '$499',
    period: 'month',
    description: 'Perfect for individual investment advisors',
    features: [
      'Up to 50 reports per month',
      'Basic financial analysis',
      'Market data access',
      'Email support',
      'Standard report templates',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$999',
    period: 'month',
    description: 'Ideal for growing investment firms',
    features: [
      'Unlimited reports',
      'Advanced financial analysis',
      'Real-time market data',
      'Priority email support',
      'Custom report templates',
      'Team collaboration',
      'API access',
      'Advanced analytics',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'month',
    description: 'For large investment organizations',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantees',
      'Advanced security features',
      'Custom training',
      'White-label options',
      'On-premise deployment',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  {
    question: "What's included in the free trial?",
    answer: "The free trial includes full access to all features of the Professional plan for 14 days. No credit card required to start."
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service."
  }
];

export const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing | Aidiligence Pro</title>
        <meta 
          name="description" 
          content="Explore our flexible pricing plans for AI-powered due diligence reports. Choose the plan that best fits your investment needs." 
        />
      </Helmet>
      
      <div className="space-y-24">
        {/* Hero Section */}
        <section className="text-center py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose the plan that best fits your needs. All plans include a 14-day free trial.
            </p>
          </div>
        </section>

        {/* Pricing Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card 
                  key={index}
                  className={`relative hover:shadow-md transition-shadow ${
                    plan.popular ? 'border-primary shadow-md' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary hover:bg-primary">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-4 mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== 'Custom' && (
                        <span className="text-muted-foreground">/{plan.period}</span>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link to={plan.cta === 'Contact Sales' ? '/contact' : '/due-diligence'}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Still have questions?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our team is here to help you choose the right plan for your needs.
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}; 