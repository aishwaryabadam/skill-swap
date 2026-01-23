import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Link as LinkIcon, Trash2, Edit, Clock, CheckCircle } from 'lucide-react';
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
import { format, isPast, isFuture } from 'date-fns';

interface Session {
  _id: string;
  googleMeetLink?: string;
  scheduledDateTime?: Date | string;
  hostId?: string;
  participantId?: string;
  sessionStatus?: string;
  _createdDate?: Date;
  _updatedDate?: Date;
}

export default function SessionsPage() {
  const { member } = useMember();
  const [sessions, setSession] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, UserProfiles>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    googleMeetLink: '',
    scheduledDateTime: '',
    participantId: '',
    sessionStatus: 'scheduled'
  });

  useEffect(() => {
    loadSessions();
  }, [member]);

  const loadSessions = async () => {
    if (!member?.loginEmail) return;

    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<Session>('sessions', {}, { limit: 1000 });
      
      // Filter sessions where user is host or participant
      const userSessions = result.items.filter(session =>
        session.hostId === member.loginEmail || session.participantId === member.loginEmail
      );

      setSession(userSessions);

      // Load participant profiles
      const profiles: Record<string, UserProfiles> = {};
      for (const session of userSessions) {
        const participantId = session.participantId || session.hostId;
        if (participantId && !profiles[participantId]) {
          try {
            const profile = await BaseCrudService.getById<UserProfiles>('userprofiles', participantId);
            profiles[participantId] = profile;
          } catch (error) {
            console.error('Error loading profile:', error);
          }
        }
      }
      setParticipantProfiles(profiles);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (session?: Session) => {
    if (session) {
      setIsEditMode(true);
      setSelectedSession(session);
      setFormData({
        googleMeetLink: session.googleMeetLink || '',
        scheduledDateTime: session.scheduledDateTime ? new Date(session.scheduledDateTime).toISOString().slice(0, 16) : '',
        participantId: session.participantId || '',
        sessionStatus: session.sessionStatus || 'scheduled'
      });
    } else {
      setIsEditMode(false);
      setSelectedSession(null);
      setFormData({
        googleMeetLink: '',
        scheduledDateTime: '',
        participantId: '',
        sessionStatus: 'scheduled'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveSession = async () => {
    if (!member?.loginEmail || !formData.googleMeetLink || !formData.scheduledDateTime || !formData.participantId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);

      if (isEditMode && selectedSession) {
        // Update existing session
        await BaseCrudService.update<Session>('sessions', {
          _id: selectedSession._id,
          googleMeetLink: formData.googleMeetLink,
          scheduledDateTime: new Date(formData.scheduledDateTime),
          participantId: formData.participantId,
          sessionStatus: formData.sessionStatus
        });
      } else {
        // Create new session
        await BaseCrudService.create('sessions', {
          _id: crypto.randomUUID(),
          googleMeetLink: formData.googleMeetLink,
          scheduledDateTime: new Date(formData.scheduledDateTime),
          hostId: member.loginEmail,
          participantId: formData.participantId,
          sessionStatus: formData.sessionStatus
        });
      }

      await loadSessions();
      setIsDialogOpen(false);
      alert(isEditMode ? 'Session updated successfully!' : 'Session created successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await BaseCrudService.delete('sessions', sessionId);
      await loadSessions();
      alert('Session deleted successfully!');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary text-primary-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructiveforeground';
      case 'scheduled':
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const upcomingSessions = sessions.filter(s => {
    if (s.sessionStatus === 'completed' || s.sessionStatus === 'cancelled') return false;
    return s.scheduledDateTime ? isFuture(new Date(s.scheduledDateTime)) : false;
  });

  const completedSessions = sessions.filter(s => 
    s.sessionStatus === 'completed' || (s.scheduledDateTime && isPast(new Date(s.scheduledDateTime)))
  );

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-primary to-primary/90 py-20 shadow-lg">
        <div className="max-w-[120rem] mx-auto px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="font-heading text-5xl md:text-6xl uppercase text-primary-foreground mb-4 tracking-wider">
                My Sessions
              </h1>
              <p className="font-paragraph text-lg text-primary-foreground/90">
                Manage your upcoming sessions and completed history
              </p>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-background text-foreground hover:bg-secondary h-12 px-8 font-paragraph shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Sessions Content */}
      <section className="w-full max-w-[120rem] mx-auto px-8 md:px-16 py-20">
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-gradient-to-br from-secondary to-secondary/50 p-16 rounded-2xl border-2 border-neutralborder"
          >
            <Calendar className="w-16 h-16 text-primary mx-auto mb-6 opacity-50" />
            <h2 className="font-heading text-4xl uppercase text-foreground mb-4">
              No Sessions Yet
            </h2>
            <p className="font-paragraph text-lg text-secondary-foreground mb-10 max-w-md mx-auto">
              Create a new session to schedule a skill-sharing meeting with Google Meet.
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-paragraph shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Session
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Upcoming Sessions */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Clock className="w-8 h-8 text-primary" />
                <h2 className="font-heading text-3xl md:text-4xl uppercase text-foreground">
                  Upcoming Sessions
                </h2>
                <span className="ml-auto bg-primary text-primary-foreground px-4 py-2 rounded-full font-heading text-sm">
                  {upcomingSessions.length}
                </span>
              </div>
              
              {upcomingSessions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-secondary/50 p-8 rounded-xl border border-neutralborder"
                >
                  <p className="font-paragraph text-lg text-secondary-foreground">
                    No upcoming sessions scheduled. Create one to get started!
                  </p>
                </motion.div>
              ) : (
                <div className="grid gap-6">
                  {upcomingSessions.map((session, index) => {
                    const otherUserId = session.hostId === member?.loginEmail ? session.participantId : session.hostId;
                    const otherUser = otherUserId ? participantProfiles[otherUserId] : null;

                    return (
                      <SessionCard
                        key={session._id}
                        session={session}
                        otherUser={otherUser}
                        member={member}
                        index={index}
                        onEdit={handleOpenDialog}
                        onDelete={handleDeleteSession}
                        getStatusColor={getStatusColor}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed Sessions */}
            <div className="pt-8 border-t-2 border-neutralborder">
              <div className="flex items-center gap-3 mb-8">
                <CheckCircle className="w-8 h-8 text-primary" />
                <h2 className="font-heading text-3xl md:text-4xl uppercase text-foreground">
                  Completed History
                </h2>
                <span className="ml-auto bg-primary text-primary-foreground px-4 py-2 rounded-full font-heading text-sm">
                  {completedSessions.length}
                </span>
              </div>
              
              {completedSessions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-secondary/50 p-8 rounded-xl border border-neutralborder"
                >
                  <p className="font-paragraph text-lg text-secondary-foreground">
                    No completed sessions yet. Your history will appear here.
                  </p>
                </motion.div>
              ) : (
                <div className="grid gap-6">
                  {completedSessions.map((session, index) => {
                    const otherUserId = session.hostId === member?.loginEmail ? session.participantId : session.hostId;
                    const otherUser = otherUserId ? participantProfiles[otherUserId] : null;

                    return (
                      <SessionCard
                        key={session._id}
                        session={session}
                        otherUser={otherUser}
                        member={member}
                        index={index}
                        onEdit={handleOpenDialog}
                        onDelete={handleDeleteSession}
                        getStatusColor={getStatusColor}
                        isCompleted
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Session Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl uppercase">
              {isEditMode ? 'Edit Session' : 'Create New Session'}
            </DialogTitle>
            <DialogDescription className="font-paragraph text-base">
              {isEditMode ? 'Update your session details' : 'Schedule a new skill-sharing session with Google Meet'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Participant ID */}
            <div>
              <Label htmlFor="participantId" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Participant Email/ID
              </Label>
              <Input
                id="participantId"
                value={formData.participantId}
                onChange={(e) => setFormData(prev => ({ ...prev, participantId: e.target.value }))}
                placeholder="Enter participant email or ID"
                className="font-paragraph h-11"
              />
            </div>

            {/* Google Meet Link */}
            <div>
              <Label htmlFor="googleMeetLink" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Google Meet Link
              </Label>
              <Input
                id="googleMeetLink"
                value={formData.googleMeetLink}
                onChange={(e) => setFormData(prev => ({ ...prev, googleMeetLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
                className="font-paragraph h-11"
              />
            </div>

            {/* Scheduled Date & Time */}
            <div>
              <Label htmlFor="scheduledDateTime" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Scheduled Date & Time
              </Label>
              <Input
                id="scheduledDateTime"
                type="datetime-local"
                value={formData.scheduledDateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDateTime: e.target.value }))}
                className="font-paragraph h-11"
              />
            </div>

            {/* Session Status */}
            <div>
              <Label htmlFor="sessionStatus" className="font-heading text-sm uppercase text-foreground mb-2 block">
                Status
              </Label>
              <select
                id="sessionStatus"
                value={formData.sessionStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionStatus: e.target.value }))}
                className="w-full font-paragraph h-11 px-3 border border-neutralborder rounded-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
                onClick={handleSaveSession}
                disabled={isSaving}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-paragraph"
              >
                {isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

// SessionCard Component
function SessionCard({ 
  session, 
  otherUser, 
  member, 
  index, 
  onEdit, 
  onDelete, 
  getStatusColor,
  isCompleted = false 
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
        isCompleted 
          ? 'bg-gradient-to-br from-secondary/50 to-secondary/30 border-neutralborder/50' 
          : 'bg-gradient-to-br from-secondary to-secondary/70 border-primary/20 hover:border-primary/40'
      }`}
    >
      <div className="grid md:grid-cols-4 gap-8">
        {/* Participant Profile */}
        <div className="md:col-span-1">
          <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl overflow-hidden shadow-md">
            {otherUser?.profilePicture ? (
              <Image
                src={otherUser.profilePicture}
                alt={otherUser.fullName || 'Participant'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                width={300}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/70">
                <span className="font-heading text-6xl text-primary-foreground uppercase">
                  {otherUser?.fullName?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Session Details */}
        <div className="md:col-span-3">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-heading text-2xl md:text-3xl uppercase text-foreground mb-3">
                {otherUser?.fullName || 'Session'}
              </h3>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-heading tracking-wider ${getStatusColor(session.sessionStatus)}`}>
                {session.sessionStatus?.charAt(0).toUpperCase() + session.sessionStatus?.slice(1) || 'Scheduled'}
              </span>
            </div>
          </div>

          {/* Session Info */}
          <div className="space-y-5 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-heading text-xs uppercase text-foreground/70 tracking-wider">Scheduled Date & Time</p>
                <p className="font-paragraph text-base text-foreground font-medium">
                  {session.scheduledDateTime ? format(new Date(session.scheduledDateTime), 'MMM dd, yyyy - HH:mm') : 'Not set'}
                </p>
              </div>
            </div>

            {session.googleMeetLink && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-heading text-xs uppercase text-foreground/70 tracking-wider">Google Meet Link</p>
                  <a
                    href={session.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-paragraph text-base text-primary hover:underline break-all font-medium"
                  >
                    {session.googleMeetLink}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => onEdit(session)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 font-paragraph font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => onDelete(session._id)}
              variant="outline"
              className="border-2 border-destructive text-destructive hover:bg-destructive/10 h-11 px-6 font-paragraph font-medium transition-all"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
