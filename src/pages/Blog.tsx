import { Calendar, Clock, ArrowRight } from 'lucide-react';

const featuredPost = {
  title: 'The Future of Due Diligence: AI-Powered Analysis',
  excerpt: 'Discover how artificial intelligence is transforming the due diligence process and making it more efficient and accurate than ever before.',
  image: 'https://images.unsplash.com/photo-1486406146923-c433d7b6b3b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  date: 'March 15, 2024',
  readTime: '5 min read',
  category: 'Technology'
};

const posts = [
  {
    title: 'Key Metrics to Consider in Financial Due Diligence',
    excerpt: 'Learn about the essential financial metrics that every investor should analyze during the due diligence process.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    date: 'March 10, 2024',
    readTime: '4 min read',
    category: 'Finance'
  },
  {
    title: 'Market Analysis: A Comprehensive Guide',
    excerpt: 'A detailed guide to conducting thorough market analysis and understanding industry trends.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    date: 'March 5, 2024',
    readTime: '6 min read',
    category: 'Analysis'
  },
  {
    title: 'Risk Assessment in Investment Decisions',
    excerpt: 'Understanding how to identify and evaluate risks in potential investment opportunities.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    date: 'March 1, 2024',
    readTime: '5 min read',
    category: 'Risk Management'
  }
];

const categories = [
  'All',
  'Technology',
  'Finance',
  'Analysis',
  'Risk Management',
  'Case Studies'
];

export const Blog = () => {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Insights & Resources
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Stay informed with the latest insights on due diligence, investment analysis, and market trends.
        </p>
      </section>

      {/* Featured Post */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="grid md:grid-cols-2">
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-primary font-semibold">{featuredPost.category}</span>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <a href="#" className="inline-flex items-center text-primary font-semibold hover:text-primary/80">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  index === 0
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-primary font-semibold">{post.category}</span>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <a href="#" className="inline-flex items-center text-primary font-semibold hover:text-primary/80">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 opacity-90">
              Subscribe to our newsletter for the latest insights and updates.
            </p>
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg text-gray-900"
              />
              <button
                type="submit"
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}; 