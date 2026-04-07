import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  subject: z.enum(["General", "Bug Report", "Account Issue", "Partnership", "Other"], {
    message: "Please select a subject",
  }),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().refine(
    (val) => !val || /^(\+91)?[6-9]\d{9}$/.test(val.replace(/\s/g, "")),
    "Please enter a valid Indian phone number"
  ),
  originCity: z.string().optional(),
  destinationCountry: z.string().optional(),
  intakePeriod: z.string().optional(),
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

// Signup Step 1: Profile (name, photos, bio)
export const signupStep1Schema = z.object({
  firstName: z.string().min(2, "Name must be at least 2 characters").max(50),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(200),
  photoCount: z.number().min(2, "Upload at least 2 photos").max(6, "Maximum 6 photos"),
});

// Signup Step 2: Personal Details (DOB, gender, religion, languages)
export const signupStep2Schema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required").refine(
    (val) => {
      if (!val) return false;
      const dob = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age >= 16;
    },
    "You must be at least 16 years old"
  ),
  gender: z.string().min(1, "Please select your gender"),
  religion: z.string().optional(),
  languages: z.array(z.string()).min(1, "Please select at least one language"),
});

// Signup Step 3: Destination
export const signupStep3Schema = z.object({
  originCity: z.string().min(1, "Please select your city"),
  destinationCountry: z.string().min(1, "Please select your destination"),
  intakePeriod: z.string().min(1, "Please select your intake period"),
  destinationCity: z.string().optional(),
  university: z.string().optional(),
  courseField: z.string().optional(),
});

// Signup Step 4: Personality
export const signupStep4Schema = z.object({
  hobbies: z.array(z.string()).min(3, "Pick at least 3 hobbies").max(5, "Maximum 5 hobbies"),
});
