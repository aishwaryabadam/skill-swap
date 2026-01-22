import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { UserProfiles } from '@/entities';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await BaseCrudService.getById<UserProfiles>('userprofiles', id);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-12">
        {/* Back Button */}
        <Link to="/profiles">
          <Button variant="outline" className="mb-8 border-2 border-foreground text-foreground hover:bg-secondary h-11 px-6 font-paragraph">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profiles
          </Button>
        </Link>

        <div className="min-h-[600px]">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : !profile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <h2 className="font-heading text-3xl uppercase text-foreground mb-4">
                Profile Not Found
              </h2>
              <p className="font-paragraph text-lg text-secondary-foreground mb-8">
                The profile you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/profiles">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-paragraph">
                  Browse All Profiles
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Profile Header */}
              <div className="grid lg:grid-cols-3 gap-12 mb-16">
                {/* Profile Image */}
                <div className="lg:col-span-1">
                  <div className="w-full aspect-square bg-secondary rounded-sm overflow-hidden">
                    {profile.profilePicture ? (
                      <Image
                        src={profile.profilePicture}
                        alt={profile.fullName || 'User profile'}
                        className="w-full h-full object-cover"
                        width={500}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="font-heading text-9xl text-primary uppercase">
                          {profile.fullName?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="font-heading text-4xl md:text-5xl uppercase text-foreground mb-4">
                        {profile.fullName || 'Anonymous User'}
                      </h1>
                      <div className="flex items-center gap-3">
                        {profile.isAvailable !== undefined && (
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-paragraph ${
                            profile.isAvailable 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-neutralborder text-secondary-foreground'
                          }`}>
                            {profile.isAvailable ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                Unavailable
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="mb-8">
                      <h2 className="font-heading text-xl uppercase text-foreground mb-3">
                        About
                      </h2>
                      <p className="font-paragraph text-base text-secondary-foreground leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {profile.availabilityDetails && (
                    <div className="bg-secondary p-6 rounded-sm mb-8">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h3 className="font-heading text-lg uppercase text-foreground">
                          Availability
                        </h3>
                      </div>
                      <p className="font-paragraph text-base text-secondary-foreground">
                        {profile.availabilityDetails}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Section */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Skills to Teach */}
                {profile.skillsToTeach && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-primary p-8 rounded-sm"
                  >
                    <h2 className="font-heading text-2xl uppercase text-primary-foreground mb-4">
                      Can Teach
                    </h2>
                    <p className="font-paragraph text-base text-primary-foreground leading-relaxed">
                      {profile.skillsToTeach}
                    </p>
                  </motion.div>
                )}

                {/* Skills to Learn */}
                {profile.skillsToLearn && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-secondary p-8 rounded-sm"
                  >
                    <h2 className="font-heading text-2xl uppercase text-foreground mb-4">
                      Wants to Learn
                    </h2>
                    <p className="font-paragraph text-base text-secondary-foreground leading-relaxed">
                      {profile.skillsToLearn}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Contact CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-secondary p-8 rounded-sm text-center"
              >
                <h2 className="font-heading text-3xl uppercase text-foreground mb-4">
                  Interested in a Skill Swap?
                </h2>
                <p className="font-paragraph text-lg text-secondary-foreground mb-6 max-w-2xl mx-auto">
                  Connect with {profile.fullName?.split(' ')[0] || 'this user'} to discuss potential skill exchange opportunities.
                </p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-base font-paragraph">
                  <Mail className="mr-2 h-5 w-5" />
                  Send Swap Request
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
