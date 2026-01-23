/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: chatmessages
 * Interface for ChatMessages
 */
export interface ChatMessages {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  senderId?: string;
  /** @wixFieldType text */
  recipientId?: string;
  /** @wixFieldType text */
  content?: string;
  /** @wixFieldType datetime */
  timestamp?: Date | string;
  /** @wixFieldType boolean */
  isRead?: boolean;
}


/**
 * Collection ID: reviews
 * Interface for Reviews
 */
export interface Reviews {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  rating?: number;
  /** @wixFieldType text */
  comment?: string;
  /** @wixFieldType text */
  reviewerId?: string;
  /** @wixFieldType text */
  revieweeId?: string;
  /** @wixFieldType text */
  sessionId?: string;
}


/**
 * Collection ID: sessions
 * Interface for Sessions
 */
export interface Sessions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType url */
  googleMeetLink?: string;
  /** @wixFieldType datetime */
  scheduledDateTime?: Date | string;
  /** @wixFieldType text */
  hostId?: string;
  /** @wixFieldType text */
  participantId?: string;
  /** @wixFieldType text */
  sessionStatus?: string;
}


/**
 * Collection ID: swaprequests
 * Interface for SwapRequests
 */
export interface SwapRequests {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  senderProfileId?: string;
  /** @wixFieldType text */
  recipientProfileId?: string;
  /** @wixFieldType text */
  message?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType datetime */
  sentAt?: Date | string;
}


/**
 * Collection ID: userprofiles
 * Interface for UserProfiles
 */
export interface UserProfiles {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  fullName?: string;
  /** @wixFieldType text */
  githubId?: string;
  /** @wixFieldType url */
  linkedinUrl?: string;
  /** @wixFieldType text */
  instagramId?: string;
  /** @wixFieldType text */
  bio?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  profilePicture?: string;
  /** @wixFieldType text */
  skillsToTeach?: string;
  /** @wixFieldType text */
  skillsToLearn?: string;
  /** @wixFieldType boolean */
  isAvailable?: boolean;
  /** @wixFieldType text */
  availabilityDetails?: string;
}
