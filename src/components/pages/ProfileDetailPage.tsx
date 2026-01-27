import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar, CheckCircle, XCircle, MessageCircle, Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { BaseCrudService } from '@/integrations';
import { UserProfiles, Reviews } from '@/entities';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Image } from '@/components/ui/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMember } from '@/integrations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { member, isAuthenticated } = useMember();
  const [profile, setProfile] = useState<UserProfiles | null>(null);
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [reviewerProfiles, setReviewerProfiles] = useState<Record<string, UserProfiles>>({});
  const [sessionModes, setSessionModes] = useState<{ online: boolean; offline: boolean }>({ online: false, offline: false });

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await BaseCrudService.getById<UserProfiles>('userprofiles', id);
      setProfile(data);
      
      // Load reviews for this profile (where they are the reviewee)
      const reviewsResult = await BaseCrudService.getAll<Reviews>('reviews', {}, { limit: 1000 });
      const profileReviews = reviewsResult.items.filter(review => review.revieweeId === id);
      setReviews(profileReviews);

      // Load reviewer profiles for display
      const profiles: Record<string, UserProfiles> = {};
      for (const review of profileReviews) {
        if (review.reviewerId && !profiles[review.reviewerId]) {
          try {
            const reviewerProfile = await BaseCrudService.getById<UserProfiles>('userprofiles', review.reviewerId);
            profiles[review.reviewerId] = reviewerProfile;
          } catch (error) {
            console.error('Error loading reviewer profile:', error);
          }
        }
      }
      setReviewerProfiles(profiles);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSwapRequest = async () => {
    if (!isAuthenticated || !member?._id || !id) return;
    if (!sessionModes.online && !sessionModes.offline) {
      alert('Please select at least one session mode');
      return;
    }

    try {
      setIsSending(true);
      const modes = [];
      if (sessionModes.online) modes.push('Online');
      if (sessionModes.offline) modes.push('In-Person');
      const modesString = modes.join(' & ');

      await BaseCrudService.create('swaprequests', {
        _id: crypto.randomUUID(),
        senderProfileId: member._id,
        recipientProfileId: id,
        message: `${message || ''}\n\nPreferred Session Mode(s): ${modesString}`,
        status: 'pending',
        sentAt: new Date(),
      });
      
      setIsDialogOpen(false);
      setMessage('');
      setSessionModes({ online: false, offline: false });
      alert('Swap request sent successfully!');
    } catch (error) {
      console.error('Error sending swap request:', error);
      alert('Failed to send swap request. Please try again.');
    } finally {
      setIsSending(false);
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

                  {profile.availabilityDays && (
                    <div className="bg-secondary p-6 rounded-sm mb-8">
                      <h3 className="font-heading text-lg uppercase text-foreground mb-3">
                        Available Days
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.availabilityDays.split(',').map(day => (
                          <span key={day.trim()} className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-sm font-paragraph">
                            {day.trim()}
                          </span>
                        ))}
                      </div>
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

              {/* Reviews Section */}
              {reviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-12"
                >
                  <h2 className="font-heading text-3xl uppercase text-foreground mb-6">
                    Reviews & Ratings
                  </h2>
                  
                  {/* Average Rating */}
                  <div className="bg-secondary p-6 rounded-sm mb-8">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-heading text-sm uppercase text-secondary-foreground mb-2">
                          Average Rating
                        </p>
                        <p className="font-heading text-5xl text-primary">
                          {(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-6 w-6 ${
                              star <= Math.round(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
                                ? 'fill-primary text-primary'
                                : 'text-neutralborder'
                            }`}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="font-heading text-sm uppercase text-secondary-foreground mb-2">
                          Total Reviews
                        </p>
                        <p className="font-heading text-4xl text-primary">{reviews.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {reviews.map((review, index) => {
                      const reviewer = reviewerProfiles[review.reviewerId || ''];
                      return (
                        <motion.div
                          key={review._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                          className="bg-secondary p-6 rounded-sm border-2 border-neutralborder"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              {reviewer?.profilePicture && (
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                                  <Image
                                    src={reviewer.profilePicture}
                                    alt={reviewer.fullName || 'Reviewer'}
                                    className="w-full h-full object-cover"
                                    width={48}
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-heading text-sm uppercase text-foreground">
                                  {reviewer?.fullName || 'Anonymous Reviewer'}
                                </p>
                                <p className="font-paragraph text-sm text-secondary-foreground">
                                  {review._createdDate ? new Date(review._createdDate).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Rating Stars */}
                          <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (review.rating || 0)
                                    ? 'fill-primary text-primary'
                                    : 'text-neutralborder'
                                }`}
                              />
                            ))}
                          </div>

                          {review.comment && (
                            <p className="font-paragraph text-base text-secondary-foreground leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

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
                {isAuthenticated ? (
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button 
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-base font-paragraph"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Send Swap Request
                    </Button>
                    <Link to={`/chat/${id}`}>
                      <Button 
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-base font-paragraph"
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Send Message
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="font-paragraph text-base text-secondary-foreground">
                    Sign in to send a swap request or message
                  </p>
                )}
              </motion.div>

              {/* Swap Request Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-2xl uppercase">
                      Send Swap Request
                    </DialogTitle>
                    <DialogDescription className="font-paragraph text-base">
                      Send a message to {profile.fullName} to propose a skill swap.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Session Mode Selection */}
                    <div>
                      <Label className="font-heading text-sm uppercase text-foreground mb-3 block tracking-wider">
                        Preferred Session Mode(s) (Select at least 1)
                      </Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="online-request" 
                            checked={sessionModes.online}
                            onCheckedChange={(checked) => setSessionModes(prev => ({ ...prev, online: checked as boolean }))}
                          />
                          <Label htmlFor="online-request" className="font-paragraph text-sm cursor-pointer">
                            Online Session
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="offline-request" 
                            checked={sessionModes.offline}
                            onCheckedChange={(checked) => setSessionModes(prev => ({ ...prev, offline: checked as boolean }))}
                          />
                          <Label htmlFor="offline-request" className="font-paragraph text-sm cursor-pointer">
                            In-Person Meeting
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-paragraph text-sm text-foreground block mb-2">
                        Message (Optional)
                      </label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell them about your skills and what you'd like to learn..."
                        className="font-paragraph text-base"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1 border-2 border-foreground text-foreground hover:bg-secondary h-11 font-paragraph"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSendSwapRequest}
                        disabled={isSending || (!sessionModes.online && !sessionModes.offline)}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-paragraph disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? 'Sending...' : 'Send Request'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
