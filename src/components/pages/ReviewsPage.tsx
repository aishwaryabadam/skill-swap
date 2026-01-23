import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Trash2 } from 'lucide-react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { UserProfiles } from '@/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

interface Review {
  _id: string;
  rating?: number;
  comment?: string;
  reviewerId?: string;
  revieweeId?: string;
  sessionId?: string;
  _createdDate?: Date;
  _updatedDate?: Date;
}

export default function ReviewsPage() {
  const { member } = useMember();
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [givenReviews, setGivenReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewerProfiles, setReviewerProfiles] = useState<Record<string, UserProfiles>>({});
  const [revieweeProfiles, setRevieweeProfiles] = useState<Record<string, UserProfiles>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfiles[]>([]);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    revieweeId: '',
    revieweeName: '',
    sessionId: ''
  });

  useEffect(() => {
    loadReviews();
  }, [member]);

  const loadReviews = async () => {
    if (!member?._id) return;

    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<Review>('reviews', {}, { limit: 1000 });
      const profilesResult = await BaseCrudService.getAll<UserProfiles>('userprofiles', {}, { limit: 1000 });

      // Filter reviews - use member's _id
      const received = result.items.filter(review => review.revieweeId === member._id);
      const given = result.items.filter(review => review.reviewerId === member._id);

      setReceivedReviews(received);
      setGivenReviews(given);
      setAvailableProfiles(profilesResult.items.filter(p => p._id !== member._id));

      // Load reviewer profiles for received reviews
      const reviewerProfs: Record<string, UserProfiles> = {};
      for (const review of received) {
        if (review.reviewerId && !reviewerProfs[review.reviewerId]) {
          try {
            const profile = await BaseCrudService.getById<UserProfiles>('userprofiles', review.reviewerId);
            reviewerProfs[review.reviewerId] = profile;
          } catch (error) {
            console.error('Error loading profile:', error);
          }
        }
      }
      setReviewerProfiles(reviewerProfs);

      // Load reviewee profiles for given reviews
      const revieweeProfs: Record<string, UserProfiles> = {};
      for (const review of given) {
        if (review.revieweeId && !revieweeProfs[review.revieweeId]) {
          try {
            const profile = await BaseCrudService.getById<UserProfiles>('userprofiles', review.revieweeId);
            revieweeProfs[review.revieweeId] = profile;
          } catch (error) {
            console.error('Error loading profile:', error);
          }
        }
      }
      setRevieweeProfiles(revieweeProfs);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      rating: 5,
      comment: '',
      revieweeId: '',
      revieweeName: '',
      sessionId: ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveReview = async () => {
    if (!member?._id || !formData.revieweeId) {
      alert('Please select a tutor to review');
      return;
    }

    try {
      setIsSaving(true);
      await BaseCrudService.create('reviews', {
        _id: crypto.randomUUID(),
        rating: formData.rating,
        comment: formData.comment,
        reviewerId: member._id,
        revieweeId: formData.revieweeId,
        sessionId: formData.sessionId || undefined
      });

      await loadReviews();
      setIsDialogOpen(false);
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await BaseCrudService.delete('reviews', reviewId);
      await loadReviews();
      alert('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-primary text-primary' : 'text-neutralborder'}`}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  const averageRating = calculateAverageRating(receivedReviews);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-primary py-16">
        <div className="max-w-[100rem] mx-auto px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="font-heading text-4xl md:text-5xl uppercase text-primary-foreground mb-4">
                Reviews & Ratings
              </h1>
              <p className="font-paragraph text-lg text-primary-foreground">
                Build trust through community feedback
              </p>
            </div>
            <Button
              onClick={handleOpenDialog}
              className="bg-background text-foreground hover:bg-secondary h-12 px-8 font-paragraph"
            >
              <Plus className="mr-2 h-4 w-4" />
              Leave Review
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16">
        {/* Your Rating Summary */}
        {receivedReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-secondary p-8 rounded-sm mb-12"
          >
            <h2 className="font-heading text-2xl uppercase text-foreground mb-6">
              Your Rating Summary
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="font-heading text-sm uppercase text-secondary-foreground mb-2">
                  Average Rating
                </p>
                <p className="font-heading text-5xl text-primary mb-3">{averageRating}</p>
                {renderStars(Math.round(parseFloat(averageRating as string)))}
              </div>
              <div>
                <p className="font-heading text-sm uppercase text-secondary-foreground mb-2">
                  Total Reviews
                </p>
                <p className="font-heading text-5xl text-primary">{receivedReviews.length}</p>
              </div>
              <div>
                <p className="font-heading text-sm uppercase text-secondary-foreground mb-2">
                  Trust Score
                </p>
                <p className="font-heading text-5xl text-primary">{Math.round(parseFloat(averageRating as string) * 20)}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Received Reviews */}
        <div className="mb-12">
          <h2 className="font-heading text-3xl uppercase text-foreground mb-8">
            Reviews You Received
          </h2>
          {receivedReviews.length === 0 ? (
            <div className="bg-secondary p-8 rounded-sm text-center">
              <p className="font-paragraph text-lg text-secondary-foreground">
                No reviews yet. Complete skill-sharing sessions to receive reviews!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {receivedReviews.map((review, index) => {
                const reviewer = reviewerProfiles[review.reviewerId || ''];
                return (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-secondary p-8 rounded-sm border-2 border-neutralborder"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {reviewer?.profilePicture && (
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10">
                            <Image
                              src={reviewer.profilePicture}
                              alt={reviewer.fullName || 'Reviewer'}
                              className="w-full h-full object-cover"
                              width={64}
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-heading text-xl uppercase text-foreground">
                            {reviewer?.fullName || 'Anonymous'}
                          </h3>
                          <p className="font-paragraph text-sm text-secondary-foreground">
                            {review._createdDate ? format(new Date(review._createdDate), 'MMM dd, yyyy') : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      {renderStars(review.rating || 0)}
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
          )}
        </div>

        {/* Given Reviews */}
        <div>
          <h2 className="font-heading text-3xl uppercase text-foreground mb-8">
            Reviews You Gave
          </h2>
          {givenReviews.length === 0 ? (
            <div className="bg-secondary p-8 rounded-sm text-center">
              <p className="font-paragraph text-lg text-secondary-foreground">
                You haven't left any reviews yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {givenReviews.map((review, index) => {
                const reviewee = revieweeProfiles[review.revieweeId || ''];
                return (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-secondary p-8 rounded-sm border-2 border-neutralborder"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {reviewee?.profilePicture && (
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10">
                            <Image
                              src={reviewee.profilePicture}
                              alt={reviewee.fullName || 'Tutor'}
                              className="w-full h-full object-cover"
                              width={64}
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-heading text-xl uppercase text-foreground mb-2">
                            {reviewee?.fullName || 'Unknown Tutor'}
                          </h3>
                          <p className="font-paragraph text-sm text-secondary-foreground">
                            {review._createdDate ? format(new Date(review._createdDate), 'MMM dd, yyyy') : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteReview(review._id)}
                        variant="outline"
                        className="border-2 border-destructive text-destructive hover:bg-destructive/10 h-10 px-4 font-paragraph"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mb-4">
                      {renderStars(review.rating || 0)}
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
          )}
        </div>
      </section>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl uppercase">
              Leave a Review
            </DialogTitle>
            <DialogDescription className="font-paragraph text-base">
              Share your experience and help build trust in our community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Tutor Selection */}
            <div>
              <Label htmlFor="revieweeId" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Select Tutor
              </Label>
              <select
                id="revieweeId"
                value={formData.revieweeId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedProfile = availableProfiles.find(p => p._id === selectedId);
                  setFormData(prev => ({
                    ...prev,
                    revieweeId: selectedId,
                    revieweeName: selectedProfile?.fullName || ''
                  }));
                }}
                className="w-full font-paragraph h-11 px-3 border border-neutralborder rounded-sm"
              >
                <option value="">Choose a tutor...</option>
                {availableProfiles.map(profile => (
                  <option key={profile._id} value={profile._id}>
                    {profile.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <Label htmlFor="rating" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Rating (1-5 Stars)
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="p-2 hover:bg-secondary rounded-sm transition-colors"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= formData.rating ? 'fill-primary text-primary' : 'text-neutralborder'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="comment" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Review Comment (Optional)
              </Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience..."
                className="font-paragraph min-h-24"
              />
            </div>

            {/* Session ID */}
            <div>
              <Label htmlFor="sessionId" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Session ID (Optional)
              </Label>
              <Input
                id="sessionId"
                value={formData.sessionId}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionId: e.target.value }))}
                placeholder="Link to specific session"
                className="font-paragraph h-11"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-2 border-foreground text-foreground hover:bg-secondary h-11 font-paragraph"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveReview}
                disabled={isSaving}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-paragraph"
              >
                {isSaving ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
