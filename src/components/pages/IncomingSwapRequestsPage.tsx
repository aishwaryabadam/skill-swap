import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Calendar, Clock, MessageSquare } from 'lucide-react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { SwapRequests, UserProfiles } from '@/entities';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

interface SwapRequestWithSender extends SwapRequests {
  senderProfile?: UserProfiles;
}

export default function IncomingSwapRequestsPage() {
  const { member } = useMember();
  const [requests, setRequests] = useState<SwapRequestWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SwapRequestWithSender | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({
    date: '',
    time: '',
    location: '',
    notes: ''
  });
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    loadIncomingRequests();
  }, [member]);

  const loadIncomingRequests = async () => {
    if (!member?._id) return;

    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<SwapRequests>('swaprequests', {}, { limit: 1000 });
      
      // Filter for incoming requests (where user is the recipient)
      const incomingRequests = result.items.filter(req => req.recipientProfileId === member._id);
      
      // Load sender profiles for each request
      const requestsWithProfiles = await Promise.all(
        incomingRequests.map(async (req) => {
          try {
            const senderProfile = await BaseCrudService.getById<UserProfiles>('userprofiles', req.senderProfileId!);
            return { ...req, senderProfile };
          } catch {
            return req;
          }
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error loading incoming requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRequest = (request: SwapRequestWithSender) => {
    setSelectedRequest(request);
    setMeetingDetails({
      date: '',
      time: '',
      location: '',
      notes: ''
    });
    setIsDetailsDialogOpen(true);
  };

  const handleSaveConfirmation = async () => {
    if (!selectedRequest) return;

    try {
      setIsConfirming(true);
      
      // Update the swap request status to 'confirmed'
      await BaseCrudService.update<SwapRequests>('swaprequests', {
        _id: selectedRequest._id,
        status: 'confirmed',
        message: `Meeting confirmed - ${meetingDetails.date} at ${meetingDetails.time} in ${meetingDetails.location}. ${meetingDetails.notes}`
      });

      // Reload requests
      await loadIncomingRequests();
      setIsDetailsDialogOpen(false);
      alert('Swap request confirmed! Meeting details saved.');
    } catch (error) {
      console.error('Error confirming request:', error);
      alert('Failed to confirm request. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this swap request?')) return;

    try {
      await BaseCrudService.update<SwapRequests>('swaprequests', {
        _id: requestId,
        status: 'rejected'
      });

      await loadIncomingRequests();
      alert('Swap request rejected.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary text-primary-foreground';
      case 'rejected':
        return 'bg-destructive text-destructiveforeground';
      case 'pending':
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

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
          >
            <h1 className="font-heading text-4xl md:text-5xl uppercase text-primary-foreground mb-4">
              Incoming Swap Requests
            </h1>
            <p className="font-paragraph text-lg text-primary-foreground">
              Review and manage skill swap requests from other members
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-secondary p-12 rounded-sm"
          >
            <h2 className="font-heading text-3xl uppercase text-foreground mb-4">
              No Incoming Requests
            </h2>
            <p className="font-paragraph text-lg text-secondary-foreground">
              You don't have any incoming swap requests yet. Share your profile with others to start receiving requests!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {requests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-secondary p-8 rounded-sm border-2 border-neutralborder"
              >
                <div className="grid md:grid-cols-4 gap-8">
                  {/* Sender Profile Image */}
                  <div className="md:col-span-1">
                    <div className="w-full aspect-square bg-primary/10 rounded-sm overflow-hidden">
                      {request.senderProfile?.profilePicture ? (
                        <Image
                          src={request.senderProfile.profilePicture}
                          alt={request.senderProfile.fullName || 'Sender'}
                          className="w-full h-full object-cover"
                          width={300}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-heading text-6xl text-primary uppercase">
                            {request.senderProfile?.fullName?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="md:col-span-3">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-heading text-2xl uppercase text-foreground mb-2">
                          {request.senderProfile?.fullName || 'Anonymous User'}
                        </h3>
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-sm font-paragraph ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sender Skills */}
                    {request.senderProfile && (
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {request.senderProfile.skillsToTeach && (
                          <div className="bg-background p-4 rounded-sm">
                            <p className="font-heading text-sm uppercase text-foreground mb-2">Can Teach</p>
                            <p className="font-paragraph text-sm text-secondary-foreground">
                              {request.senderProfile.skillsToTeach}
                            </p>
                          </div>
                        )}
                        {request.senderProfile.skillsToLearn && (
                          <div className="bg-background p-4 rounded-sm">
                            <p className="font-heading text-sm uppercase text-foreground mb-2">Wants to Learn</p>
                            <p className="font-paragraph text-sm text-secondary-foreground">
                              {request.senderProfile.skillsToLearn}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Request Message */}
                    {request.message && (
                      <div className="bg-background p-4 rounded-sm mb-6">
                        <p className="font-heading text-sm uppercase text-foreground mb-2">Message</p>
                        <p className="font-paragraph text-sm text-secondary-foreground">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {/* Sent Date */}
                    <div className="flex items-center gap-2 text-sm text-secondary-foreground mb-6">
                      <Clock className="h-4 w-4" />
                      <span className="font-paragraph">
                        Sent {request.sentAt ? format(new Date(request.sentAt), 'MMM dd, yyyy') : 'Recently'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleConfirmRequest(request)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 font-paragraph"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm & Schedule
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request._id)}
                          variant="outline"
                          className="border-2 border-destructive text-destructive hover:bg-destructive/10 h-11 px-6 font-paragraph"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {request.status === 'confirmed' && (
                      <div className="bg-primary/10 p-4 rounded-sm">
                        <p className="font-paragraph text-sm text-primary">
                          ✓ This request has been confirmed. Meeting details have been saved.
                        </p>
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <div className="bg-destructive/10 p-4 rounded-sm">
                        <p className="font-paragraph text-sm text-destructive">
                          ✗ This request has been rejected.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Meeting Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl uppercase">
              Schedule Meeting
            </DialogTitle>
            <DialogDescription className="font-paragraph text-base">
              Confirm the swap request and add meeting details with {selectedRequest?.senderProfile?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Date */}
            <div>
              <Label htmlFor="date" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Meeting Date
              </Label>
              <Input
                id="date"
                type="date"
                value={meetingDetails.date}
                onChange={(e) => setMeetingDetails(prev => ({ ...prev, date: e.target.value }))}
                className="font-paragraph h-11"
              />
            </div>

            {/* Time */}
            <div>
              <Label htmlFor="time" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Meeting Time
              </Label>
              <Input
                id="time"
                type="time"
                value={meetingDetails.time}
                onChange={(e) => setMeetingDetails(prev => ({ ...prev, time: e.target.value }))}
                className="font-paragraph h-11"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Location
              </Label>
              <Input
                id="location"
                value={meetingDetails.location}
                onChange={(e) => setMeetingDetails(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Coffee Shop, Online, Park"
                className="font-paragraph h-11"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={meetingDetails.notes}
                onChange={(e) => setMeetingDetails(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional details or instructions..."
                className="font-paragraph min-h-24"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDetailsDialogOpen(false)}
                className="flex-1 border-2 border-foreground text-foreground hover:bg-secondary h-11 font-paragraph"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveConfirmation}
                disabled={isConfirming || !meetingDetails.date || !meetingDetails.time || !meetingDetails.location}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-paragraph"
              >
                {isConfirming ? 'Confirming...' : 'Confirm Meeting'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
