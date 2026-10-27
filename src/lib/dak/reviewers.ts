import { randomBytes } from "crypto";

/** Random password shown to the admin once; only the hash is stored. */
export const generateReviewerPassword = () => randomBytes(12).toString("base64url");
