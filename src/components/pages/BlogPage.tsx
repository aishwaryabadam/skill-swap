import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

interface BlogPost {
  _id: string;
  title?: string;
  content?: string;
  author?: string;
  category?: string;
  publishDate?: Date | string;
  featuredImage?: string;
  externalUrl?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<BlogPost>('blogposts', {}, { limit: 100 });
      setPosts(result.items || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean))) as string[];
  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.category === selectedCategory)
    : posts;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-primary py-20 md:py-32">
        <div className="max-w-[120rem] mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl md:text-7xl uppercase text-primary-foreground mb-6 tracking-wider">
              Learning Hub
            </h1>
            <p className="font-paragraph text-xl text-primary-foreground max-w-2xl leading-relaxed">
              Discover insights, tips, and strategies to maximize your skill exchange experience and accelerate your learning journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full max-w-[120rem] mx-auto px-4 md:px-8 py-20">
        {/* Category Filter */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="font-heading text-2xl uppercase text-foreground mb-6 tracking-wider">
              Filter by Category
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setSelectedCategory(null)}
                variant={selectedCategory === null ? 'default' : 'outline'}
                className={`h-11 px-6 font-paragraph ${
                  selectedCategory === null
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-2 border-neutralborder text-foreground hover:bg-secondary'
                }`}
              >
                All Posts
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`h-11 px-6 font-paragraph ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border-2 border-neutralborder text-foreground hover:bg-secondary'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-secondary p-12 rounded-2xl"
          >
            <h2 className="font-heading text-3xl uppercase text-foreground mb-4">
              No Posts Found
            </h2>
            <p className="font-paragraph text-lg text-secondary-foreground">
              Check back soon for more insights and tips!
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white border-2 border-neutralborder rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary flex flex-col"
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="w-full h-48 bg-secondary overflow-hidden relative">
                    <Image
                      src={post.featuredImage}
                      alt={post.title || 'Blog post'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Category Badge */}
                  {post.category && (
                    <div className="mb-3">
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-heading uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-heading text-xl uppercase text-foreground mb-3 tracking-wider group-hover:text-primary transition-colors line-clamp-2">
                    {post.title || 'Untitled'}
                  </h3>

                  {/* Excerpt */}
                  <p className="font-paragraph text-secondary-foreground text-sm mb-6 line-clamp-3 flex-grow">
                    {post.content || 'No description available'}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-neutralborder">
                    {post.author && (
                      <div className="flex items-center gap-2 text-xs text-secondary-foreground">
                        <User className="w-4 h-4" />
                        <span className="font-paragraph">{post.author}</span>
                      </div>
                    )}
                    {post.publishDate && (
                      <div className="flex items-center gap-2 text-xs text-secondary-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="font-paragraph">
                          {format(new Date(post.publishDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Read More Button */}
                  <Button 
                    onClick={() => {
                      if (post.externalUrl) {
                        window.open(post.externalUrl, '_blank');
                      }
                    }}
                    disabled={!post.externalUrl}
                    className={`w-full h-11 font-paragraph group-hover:shadow-lg transition-all ${
                      post.externalUrl 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer' 
                        : 'bg-secondary text-secondary-foreground cursor-not-allowed opacity-50'
                    }`}
                  >
                    Read More
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
