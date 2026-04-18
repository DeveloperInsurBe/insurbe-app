"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Mail, User, CheckCircle, Clock } from "lucide-react";

export default function PrivateFAQ() {
 const faqs = [
  {
    question: "Who should consider private health insurance in Germany?",
    answer:
      "Private health insurance (PKV) is ideal for employed professionals earning above the compulsory insurance threshold, as well as self-employed individuals and freelancers. It offers flexible coverage options, faster access to care, and premium medical services.",
  },
  {
    question: "How does InsurBe help with choosing the right private health insurance?",
    answer:
      "InsurBe compares leading private health insurance providers and helps you select a plan based on your income, age, health profile, and long-term goals. Our platform simplifies complex policy details so you can make an informed decision with confidence.",
  },
  {
    question: "Am I eligible to switch from public to private health insurance?",
    answer:
      "If your annual income exceeds the legal threshold or you are self-employed, you may be eligible to switch to private health insurance. InsurBe guides you through eligibility checks and ensures a smooth transition.",
  },
  {
    question: "How quickly can private health insurance be activated?",
    answer:
      "Most private health insurance applications are processed within 24–48 hours once all documents are submitted. In some cases, coverage can begin even sooner, depending on the insurer and health assessment.",
  },
  {
    question: "Does InsurBe provide support after I switch to private insurance?",
    answer:
      "Yes. InsurBe offers continued support even after your policy is active. From plan upgrades and family coverage to questions about benefits or future changes, our team is here to assist you throughout your insurance journey.",
  },
];


  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    comment: "",
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you can add API call to save appointment data
    console.log("Appointment data:", formData);
    
    // Show success message
    setShowSuccess(true);
    
    // Reset form and close modal after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", date: "", time: "", comment: "" });
    }, 1000);
  };

  return (
    <>
      <section className="py-10 md:py-16 px-4 sm:px-8 lg:px-18 overflow-hidden">
        <div className="max-w-4xl mx-auto grid items-start px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center pb-2"
          >
            <button className="rounded-2xl bg-[rgba(130,36,227,0.10)] text-primary px-4 py-1 font-semibold">
              FAQs
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 ">
            Frequently {" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
             asked questions
            </span>
          </h2>
          </motion.div>

          <div className="space-y-4 mt-10">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="py-4 cursor-pointer bg-[#FFFFFF33]"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm md:text-[17px] font-semibold">
                    {faq.question}
                  </h3>
                  <span className="w-6 h-6 block relative">
                    <Image
                      src={
                        openIndex === index
                          ? "/icons/Minus.svg"
                          : "/icons/Plus.svg"
                      }
                      alt={openIndex === index ? "Collapse" : "Expand"}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </span>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.p
                      key="answer"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-gray-700 mt-2 overflow-hidden"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center pt-14"
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-primary hover:text-white border-2 border-primary cursor-pointer px-6 py-3 rounded-full font-bold text-primary transition"
            >
              Book a Free call now
            </button>
          </motion.div>
        </div>
      </section>

     {/* Appointment Modal */}
<AnimatePresence>
  {isModalOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={() => setIsModalOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-lg md:max-w-xl lg:max-w-2xl relative overflow-hidden my-auto"
      >
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mb-3 sm:mb-4" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">
                Success!
              </h3>
              <p className="text-sm sm:text-base text-gray-600 text-center px-4 sm:px-6">
                We will connect with you shortly
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 cursor-pointer text-gray-400 hover:text-gray-600 transition z-20"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 pr-8">
            Book an Appointment
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Fill in your details and we'll get back to you soon
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Date and Time Fields - Side by Side on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Date Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Preferred Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Time Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Preferred Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  <select
                    required
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none"
                  >
                    <option value="">Select a time</option>
                    <option value="09:00 - 10:00">09:00 – 10:00</option>
                    <option value="10:00 - 11:00">10:00 – 11:00</option>
                    <option value="11:00 - 12:00">11:00 – 12:00</option>
                    <option value="14:00 - 15:00">14:00 – 15:00</option>
                    <option value="15:00 - 16:00">15:00 – 16:00</option>
                    <option value="16:00 - 17:00">16:00 – 17:00</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Comment Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                placeholder="Tell us anything important before the call..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-primary cursor-pointer text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-primary/90 transition shadow-lg mt-2"
            >
              Submit Appointment
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </>
  );
}
