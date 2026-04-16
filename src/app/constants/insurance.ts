export const INSURANCE_LIMITS = {
  PKV_INCOME_THRESHOLD: 74400,
};


export const INSURANCE_PLANS = {
   
      INSURBE_STUDENT_CLASSIC: 117,
      INSURBE_STUDENT_BONUS: 15,
      INSURBE_STUDENT_OTTONOVA: 117,
      INSURBE_STUDENT_MAWISTA: 28,

       TK_STUDENT_MIN_PRICE: 132.61, // absolute minimum (compliance)
   
};

export const TK_CONFIG = {
  name: "TK Public Insurance",

  // pricing
  minPrice: 132.61,
  priceLabel: "Starting from",
  isApprox: true,

  // bonus
  bonus: 400,
  bonusNote:
    "Bonus depends on participation in TK programs and conditions",

  // coverage
  coverage: "EU & partner countries only",
  hasWorldwideCoverage: false,

  // benefits flags
  includesPrivateRoom: false,
  includesChiefDoctor: false,

  // notes
  priceDisclaimer:
    "Depends on income and number of children",

  eligibilityNote:
    "PhD students are usually not eligible for student health insurance (KvdS)",
};

