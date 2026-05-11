export const validateTkForm = (formData: any) => {
  const errors: string[] = [];

  /**
   * PERSONAL DETAILS
   */
  if (!formData.personal.firstName) {
    errors.push("First name is required");
  }

  if (!formData.personal.lastName) {
    errors.push("Last name is required");
  }

  if (!formData.personal.email) {
    errors.push("Email is required");
  }

  if (!formData.selectPlan.institutionName) {
    errors.push("University name is required");
  }

  /**
   * STUDENT DETAILS
   */
  if (!formData.selectPlan.dob) {
    errors.push("Date of birth is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};