/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

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
