import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, X } from 'lucide-react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { UserProfiles } from '@/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MyProfilePage() {
  const { member } = useMember();
  const [profile, setProfile] = useState<UserProfiles | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    profilePicture: '',
    skillsToTeach: '',
    skillsToLearn: '',
    isAvailable: true,
    availabilityDetails: '',
    availabilityDays: '',
    instagramId: '',
    linkedinUrl: '',
    githubId: '',
    _id: ''
  });

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getSelectedDays = () => {
    return formData.availabilityDays ? formData.availabilityDays.split(',').map(d => d.trim()) : [];
  };

  const toggleDay = (day: string) => {
    const selected = getSelectedDays();
    const updated = selected.includes(day)
      ? selected.filter(d => d !== day)
      : [...selected, day];
    setFormData(prev => ({ ...prev, availabilityDays: updated.join(',') }));
  };

  useEffect(() => {
    loadProfile();
  }, [member]);

  const loadProfile = async () => {
    if (!member?._id) return;

    try {
      setIsLoading(true);
      // Try to fetch the profile using member._id directly
      const userProfile = await BaseCrudService.getById<UserProfiles>('userprofiles', member._id);
      
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          fullName: userProfile.fullName || '',
          bio: userProfile.bio || '',
          profilePicture: userProfile.profilePicture || '',
          skillsToTeach: userProfile.skillsToTeach || '',
          skillsToLearn: userProfile.skillsToLearn || '',
          isAvailable: userProfile.isAvailable ?? true,
          availabilityDetails: userProfile.availabilityDetails || '',
          availabilityDays: userProfile.availabilityDays || '',
          instagramId: userProfile.instagramId || '',
          linkedinUrl: userProfile.linkedinUrl || '',
          githubId: userProfile.githubId || '',
          _id: userProfile._id
        });
      } else {
        // Profile doesn't exist yet, initialize with member data
        setFormData(prev => ({
          ...prev,
          fullName: member.profile?.nickname || member.contact?.firstName || '',
          _id: member._id
        }));
      }
    } catch (error) {
      // Profile doesn't exist yet, that's okay
      setFormData(prev => ({
        ...prev,
        fullName: member.profile?.nickname || member.contact?.firstName || '',
        _id: member._id
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!member?._id) return;

    try {
      setIsSaving(true);

      const profileData = {
        fullName: formData.fullName,
        bio: formData.bio,
        profilePicture: formData.profilePicture,
        skillsToTeach: formData.skillsToTeach,
        skillsToLearn: formData.skillsToLearn,
        isAvailable: formData.isAvailable,
        availabilityDetails: formData.availabilityDetails,
        availabilityDays: formData.availabilityDays,
        instagramId: formData.instagramId,
        linkedinUrl: formData.linkedinUrl,
        githubId: formData.githubId
      };

      if (profile) {
        await BaseCrudService.update<UserProfiles>('userprofiles', {
          _id: profile._id,
          ...profileData
        });
      } else {
        await BaseCrudService.create('userprofiles', {
          _id: member._id,
          ...profileData
        });
      }

      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        profilePicture: profile.profilePicture || '',
        skillsToTeach: profile.skillsToTeach || '',
        skillsToLearn: profile.skillsToLearn || '',
        isAvailable: profile.isAvailable ?? true,
        availabilityDetails: profile.availabilityDetails || '',
        availabilityDays: profile.availabilityDays || '',
        instagramId: profile.instagramId || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubId: profile.githubId || '',
        _id: profile._id
      });
    }
    setIsEditing(false);
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
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="font-heading text-4xl md:text-5xl uppercase text-primary-foreground mb-4">
                My Profile
              </h1>
              <p className="font-paragraph text-lg text-primary-foreground">
                Manage your skills and availability
              </p>
            </div>
            {!isEditing && !isLoading && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-background text-foreground hover:bg-secondary h-12 px-8 font-paragraph"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="font-paragraph text-lg text-secondary-foreground">Loading profile...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {isEditing ? (
              /* Edit Mode */
              <div className="max-w-4xl mx-auto">
                <div className="bg-secondary p-8 rounded-sm mb-8">
                  <h2 className="font-heading text-2xl uppercase text-foreground mb-6">
                    Edit Profile Information
                  </h2>

                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="fullName" className="font-heading text-sm uppercase text-foreground mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="font-paragraph h-12"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <Label htmlFor="bio" className="font-heading text-sm uppercase text-foreground mb-2 block">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        className="font-paragraph min-h-32"
                        placeholder="Tell others about yourself..."
                      />
                    </div>

                    {/* Profile Picture URL */}
                    <div>
                      <Label htmlFor="profilePicture" className="font-heading text-sm uppercase text-foreground mb-2 block">
                        Profile Picture URL
                      </Label>
                      <Input
                        id="profilePicture"
                        value={formData.profilePicture}
                        onChange={(e) => setFormData(prev => ({ ...prev, profilePicture: e.target.value }))}
                        className="font-paragraph h-12"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* Skills to Teach */}
                    <div>
                      <Label htmlFor="skillsToTeach" className="font-heading text-sm uppercase text-foreground mb-2 block">
                        Skills I Can Teach
                      </Label>
                      <Textarea
                        id="skillsToTeach"
                        value={formData.skillsToTeach}
                        onChange={(e) => setFormData(prev => ({ ...prev, skillsToTeach: e.target.value }))}
                        className="font-paragraph min-h-24"
                        placeholder="e.g., Web Development, Guitar, Spanish Language..."
                      />
                    </div>

                    {/* Skills to Learn */}
                    <div>
                      <Label htmlFor="skillsToLearn" className="font-heading text-sm uppercase text-foreground mb-2 block">
                        Skills I Want to Learn
                      </Label>
                      <Textarea
                        id="skillsToLearn"
                        value={formData.skillsToLearn}
                        onChange={(e) => setFormData(prev => ({ ...prev, skillsToLearn: e.target.value }))}
                        className="font-paragraph min-h-24"
                        placeholder="e.g., Photography, Cooking, Public Speaking..."
                      />
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center justify-between p-4 bg-background rounded-sm">
                      <div>
                        <Label htmlFor="isAvailable" className="font-heading text-sm uppercase text-foreground mb-1 block">
                          Available for Skill Swaps
                        </Label>
                        <p className="font-paragraph text-sm text-secondary-foreground">
                          Let others know if you're currently accepting swap requests
                        </p>
                      </div>
                      <Switch
                        id="isAvailable"
                        checked={formData.isAvailable}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
                      />
                    </div>

                    {/* Availability Days */}
                    <div>
                      <Label className="font-heading text-sm uppercase text-foreground mb-3 block">
                        Available Days of the Week
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {DAYS_OF_WEEK.map(day => (
                          <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`px-4 py-3 rounded-sm font-paragraph text-sm font-medium transition-colors border-2 ${
                              getSelectedDays().includes(day)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-foreground border-neutralborder hover:border-primary'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Availability Details */}
                    <div>
                      <Label htmlFor="availabilityDetails" className="font-heading text-sm uppercase text-foreground mb-2 block">
                        Availability Details
                      </Label>
                      <Textarea
                        id="availabilityDetails"
                        value={formData.availabilityDetails}
                        onChange={(e) => setFormData(prev => ({ ...prev, availabilityDetails: e.target.value }))}
                        className="font-paragraph min-h-24"
                        placeholder="e.g., 9 AM - 5 PM, Evening sessions available..."
                      />
                    </div>

                    {/* Social Media Section */}
                    <div className="border-t-2 border-neutralborder pt-6 mt-6">
                      <h3 className="font-heading text-lg uppercase text-foreground mb-6">Social Media & Links</h3>
                      
                      {/* Instagram ID */}
                      <div className="mb-6">
                        <Label htmlFor="instagramId" className="font-heading text-sm uppercase text-foreground mb-2 block">
                          Instagram ID
                        </Label>
                        <Input
                          id="instagramId"
                          value={formData.instagramId}
                          onChange={(e) => setFormData(prev => ({ ...prev, instagramId: e.target.value }))}
                          className="font-paragraph h-12"
                          placeholder="@yourusername"
                        />
                      </div>

                      {/* LinkedIn URL */}
                      <div className="mb-6">
                        <Label htmlFor="linkedinUrl" className="font-heading text-sm uppercase text-foreground mb-2 block">
                          LinkedIn URL
                        </Label>
                        <Input
                          id="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                          className="font-paragraph h-12"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>

                      {/* GitHub ID */}
                      <div>
                        <Label htmlFor="githubId" className="font-heading text-sm uppercase text-foreground mb-2 block">
                          GitHub ID
                        </Label>
                        <Input
                          id="githubId"
                          value={formData.githubId}
                          onChange={(e) => setFormData(prev => ({ ...prev, githubId: e.target.value }))}
                          className="font-paragraph h-12"
                          placeholder="yourusername"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-paragraph"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-2 border-foreground text-foreground hover:bg-secondary h-12 px-8 font-paragraph"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Profile Image */}
                <div className="lg:col-span-1">
                  <div className="w-full aspect-square bg-secondary rounded-sm overflow-hidden">
                    {formData.profilePicture ? (
                      <Image
                        src={formData.profilePicture}
                        alt={formData.fullName || 'Your profile'}
                        className="w-full h-full object-cover"
                        width={500}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="font-heading text-9xl text-primary uppercase">
                          {formData.fullName?.charAt(0) || member?.profile?.nickname?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="lg:col-span-2">
                  <h2 className="font-heading text-4xl md:text-5xl uppercase text-foreground mb-4">
                    {formData.fullName || member?.profile?.nickname || 'Your Name'}
                  </h2>

                  <div className="mb-6">
                    <span className={`inline-block px-4 py-2 rounded-sm text-sm font-paragraph ${
                      formData.isAvailable 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-neutralborder text-secondary-foreground'
                    }`}>
                      {formData.isAvailable ? 'Available for Swaps' : 'Currently Unavailable'}
                    </span>
                  </div>

                  {formData.bio && (
                    <div className="mb-8">
                      <h3 className="font-heading text-xl uppercase text-foreground mb-3">
                        About Me
                      </h3>
                      <p className="font-paragraph text-base text-secondary-foreground leading-relaxed">
                        {formData.bio}
                      </p>
                    </div>
                  )}

                  {formData.availabilityDetails && (
                    <div className="bg-secondary p-6 rounded-sm mb-8">
                      <h3 className="font-heading text-lg uppercase text-foreground mb-3">
                        My Availability
                      </h3>
                      <p className="font-paragraph text-base text-secondary-foreground">
                        {formData.availabilityDetails}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {formData.skillsToTeach && (
                      <div className="bg-primary p-6 rounded-sm">
                        <h3 className="font-heading text-lg uppercase text-primary-foreground mb-3">
                          I Can Teach
                        </h3>
                        <p className="font-paragraph text-base text-primary-foreground">
                          {formData.skillsToTeach}
                        </p>
                      </div>
                    )}

                    {formData.skillsToLearn && (
                      <div className="bg-secondary p-6 rounded-sm">
                        <h3 className="font-heading text-lg uppercase text-foreground mb-3">
                          I Want to Learn
                        </h3>
                        <p className="font-paragraph text-base text-secondary-foreground">
                          {formData.skillsToLearn}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Social Media Links */}
                  {(formData.instagramId || formData.linkedinUrl || formData.githubId) && (
                    <div className="mt-8 pt-8 border-t-2 border-neutralborder">
                      <h3 className="font-heading text-lg uppercase text-foreground mb-4">
                        Connect With Me
                      </h3>
                      <div className="flex gap-4 flex-wrap">
                        {formData.instagramId && (
                          <a
                            href={`https://instagram.com/${formData.instagramId.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-secondary rounded-sm text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-paragraph text-sm"
                          >
                            Instagram: {formData.instagramId}
                          </a>
                        )}
                        {formData.linkedinUrl && (
                          <a
                            href={formData.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-secondary rounded-sm text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-paragraph text-sm"
                          >
                            LinkedIn Profile
                          </a>
                        )}
                        {formData.githubId && (
                          <a
                            href={`https://github.com/${formData.githubId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-secondary rounded-sm text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-paragraph text-sm"
                          >
                            GitHub: {formData.githubId}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {!formData.skillsToTeach && !formData.skillsToLearn && !formData.bio && (
                    <div className="bg-secondary p-8 rounded-sm text-center">
                      <p className="font-paragraph text-lg text-secondary-foreground mb-4">
                        Your profile is incomplete. Add your skills and bio to get started!
                      </p>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-paragraph"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Complete Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
}
