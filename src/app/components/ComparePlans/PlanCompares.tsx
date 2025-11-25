'use client';

import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';

export default function PlansCompare() {
  const plans = [
    {
      id: 'barmer',
      name: 'BARMER',
      logo: 'BARMER',
      logoColor: 'bg-lime-500',
      price: '~€ 650',
      processingSpeed: 'Fast',
      highlight: 'Excellent coverage for families',
      hasRecommendation: false
    },
    {
      id: 'tk',
      name: 'TK',
      logo: 'TK',
      logoColor: 'bg-cyan-500',
      price: '~€ 650',
      processingSpeed: 'Faster',
      highlight: 'Great digital services and best insurance for students',
      hasRecommendation: true
    },
    {
      id: 'dak',
      name: 'DAK',
      logo: 'DAK',
      logoColor: 'bg-orange-500',
      price: '~€ 650',
      processingSpeed: 'Fastest',
      highlight: 'Excellent customer support in English',
      hasRecommendation: true
    }
  ];

  const features = [
    { label: '24/7 medical assistance/emergency call centre', values: [true, true, true] },
    { label: 'English support', values: [true, true, true] },
    { label: 'Digital services', values: [true, true, true] },
    { label: 'Transport costs to nearest suitable hospital', values: [true, true, true] },
    { label: 'Repatriation costs up to €25,000 in the event of death', values: [true, true, true] },
    { label: 'Medically prescribed medicines and dressings', values: [true, true, true] }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-16  ">
      <div className="w-full mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-0 border-b border-gray-200">
            <div className="col-span-1 p-6 bg-gray-50"></div>
            {plans.map((plan) => (
              <div key={plan.id} className="col-span-1 p-6 flex flex-col items-center justify-center bg-white">
                <div className={`${plan.logoColor} text-white font-bold text-sm px-4 py-2 rounded mb-2`}>
                  {plan.logo}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              </div>
            ))}
          </div>

          {/* Monthly Premiums Row */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="col-span-1 p-6 bg-gray-50">
              <h4 className="font-bold text-gray-900 mb-1">Monthly premiums</h4>
              <p className="text-xs text-gray-600">Per person <span className="font-semibold">excluding USA/Canada</span></p>
            </div>
            {plans.map((plan) => (
              <div key={plan.id} className="col-span-1 p-6 text-center">
                <p className="text-2xl font-bold text-gray-900 mb-1">{plan.price}</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
            ))}
          </motion.div>

          {/* Feature Rows */}
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={rowVariants}
              className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
            >
              <div className="col-span-1 p-6 bg-gray-50">
                <p className="text-sm text-gray-900">{feature.label}</p>
              </div>
              {feature.values.map((value, planIdx) => (
                <div key={planIdx} className="col-span-1 p-6 flex items-center justify-center">
                  {value ? (
                    <Check className="w-6 h-6 text-cyan-500" strokeWidth={3} />
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </div>
              ))}
            </motion.div>
          ))}

          {/* We Recommend Row */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="col-span-1 p-6 bg-gray-50 flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">We recommend:</p>
              <p className="text-sm text-gray-600">an insurance card</p>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            {plans.map((plan) => (
              <div key={plan.id} className="col-span-1 p-6 flex items-center justify-center">
                {plan.hasRecommendation ? (
                  <Check className="w-6 h-6 text-cyan-500" strokeWidth={3} />
                ) : (
                  <span className="text-gray-900 font-bold">–</span>
                )}
              </div>
            ))}
          </motion.div>

          {/* Processing Speed Row */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="col-span-1 p-6 bg-gray-50">
              <p className="text-sm text-gray-900">Processing speed</p>
            </div>
            {plans.map((plan) => (
              <div key={plan.id} className="col-span-1 p-6 text-center">
                <p className="text-sm font-semibold text-gray-900">{plan.processingSpeed}</p>
              </div>
            ))}
          </motion.div>

          {/* Highlight Row */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="col-span-1 p-6 bg-gray-50">
              <p className="text-sm text-gray-900">Highlight</p>
            </div>
            {plans.map((plan) => (
              <div key={plan.id} className="col-span-1 p-6">
                <p className="text-sm text-gray-700 text-center">{plan.highlight}</p>
              </div>
            ))}
          </motion.div>

          {/* Policy Wording Row 1 */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="col-span-1 p-6 bg-gray-50">
              <p className="text-sm text-gray-900">Policy wording</p>
            </div>
            {plans.map((plan) => (
              <div key={plan.id} className="col-span-1 p-6 text-center">
                <span className="inline-block bg-gray-100 text-gray-900 text-xs font-semibold px-3 py-1 rounded">
                  EN
                </span>
              </div>
            ))}
          </motion.div>

          {/* Excess Worldwide Row */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="col-span-1 p-6 bg-gray-50">
              <p className="text-sm text-gray-900">Excess worldwide incl. USA/Canada</p>
              <p className="text-xs text-gray-600">(per insurance year)</p>
            </div>
            {plans.map((plan) => (
              <div key={plan.id} className="col-span-1 p-6 text-center">
                <p className="text-sm font-semibold text-gray-900">€500</p>
              </div>
            ))}
          </motion.div>

          {/* Policy Wording Row 2 */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="col-span-1 p-6 bg-gray-50">
              <p className="text-sm text-gray-900">Policy wording</p>
            </div>
            {plans.map((plan) => (
              <div key={plan.id} className="col-span-1 p-6 text-center">
                <span className="inline-block bg-gray-100 text-gray-900 text-xs font-semibold px-3 py-1 rounded">
                  EN
                </span>
              </div>
            ))}
          </motion.div>

          {/* Sign Up Buttons Row */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 gap-0 bg-gray-50">
            <div className="col-span-1 p-6"></div>
            {plans.map((plan) => (
              <div key={plan.id} className="col-span-1 p-6 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-primary hover:bg-primary/10 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors"
                >
                  SIGN UP
                </motion.button>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}