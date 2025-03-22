import { Helmet } from 'react-helmet-async';
import { Users, Target, Award, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const values = [
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, delivering the highest quality due diligence reports to our clients.'
  },
  {
    icon: Award,
    title: 'Innovation',
    description: 'We continuously innovate and improve our AI-powered analysis to stay ahead of market trends.'
  },
  {
    icon: Heart,
    title: 'Integrity',
    description: 'We maintain the highest standards of integrity and transparency in our business practices.'
  }
];

const team = [
  {
    name: 'John Smith',
    role: 'CEO & Founder',
    bio: 'Former investment banker with 15+ years of experience in due diligence.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    name: 'Sarah Johnson',
    role: 'CTO',
    bio: 'AI and machine learning expert with a PhD in Computer Science.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    name: 'Michael Chen',
    role: 'Head of Research',
    bio: 'Financial analyst with expertise in market research and data analysis.',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

export const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Aidiligence Pro</title>
        <meta 
          name="description" 
          content="Learn about Aidiligence Pro, our mission, values, and the team behind our AI-powered due diligence platform." 
        />
      </Helmet>
      
      <div className="space-y-24">
        {/* Hero Section */}
        <section className="text-center py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Aidiligence Pro
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Revolutionizing due diligence with AI-powered analysis and comprehensive reporting.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  Founded in 2023, Aidiligence Pro emerged from a simple observation: the due diligence process needed to be faster, more accurate, and more accessible. Our team of financial experts and AI specialists came together to create a solution that would transform how businesses evaluate investment opportunities.
                </p>
                <p className="text-muted-foreground">
                  Today, we're proud to serve clients worldwide, helping them make informed decisions with confidence through our cutting-edge AI technology and expert analysis.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    alt="Team collaboration"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-muted-foreground">
                To democratize access to professional-grade due diligence by leveraging artificial intelligence and expert knowledge, making informed investment decisions accessible to businesses of all sizes.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <div className="text-center p-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                        <value.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="overflow-hidden shadow-md">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-primary mb-2">{member.role}</p>
                    <p className="text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground p-12 text-center shadow-lg">
              <CardContent className="pt-0">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Due Diligence Process?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of businesses that trust Aidiligence Pro for their investment decisions.
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/due-diligence">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}; 