'use client';

import Image from 'next/image';
import React from 'react';

const AboutUs = () => {
  return (
    <section className="bg-gradient-to-br from-white via-[#fbefff] to-white py-20 px-4 md:px-16">
      {/* Section Title */}
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
        Insurbe’s Journey
      </h2>

      {/* 2020 Card */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between mb-24 gap-10">
        {/* Left Text */}
        <div className="max-w-lg">
          <div className="inline-block px-3 py-1 rounded-full border text-sm text-gray-600 mb-4">
            The Birth
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            2020: Foundation and Vision
          </h3>
          <p className="text-gray-600 mb-6">
            Insurbe was founded with a vision to simplify the insurance process for individuals and families.
          </p>
          <div className="flex gap-4">
            <button className="bg-primary text-white px-6 py-2 rounded-md shadow-sm">
              Contact us
            </button>
            <button className="border px-6 py-2 rounded-md shadow-sm">
              Get Started
            </button>
          </div>
        </div>

        {/* Right Image with Floating Card */}
        <div className="relative">
          <Image
            src="/contact/contact1.png"
            alt="Teamwork"
            width={400}
            height={300}
            className="rounded-2xl object-cover"
          />
          <div className="absolute -bottom-6 -right-6 bg-white shadow-md p-4 rounded-xl w-56">
            <Image
              src="/icons/gift-icon.svg" // replace with your icon path
              alt="Gift"
              width={30}
              height={30}
            />
            <p className="font-medium mt-2">Private Pension Scheme</p>
            <button className="mt-2 text-sm text-white bg-primary px-4 py-1.5 rounded-md">
              Check it Out →
            </button>
          </div>
        </div>
      </div>

      {/* 2021 Card */}
      <div className="bg-primary text-white rounded-3xl p-10 flex flex-col lg:flex-row justify-between items-center mb-24 gap-10">
        {/* Left Content - Cards */}
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          <Image
            src="/images/stats-image.png"
            alt="Stats"
            width={120}
            height={120}
            className="rounded-xl"
          />
          <Image
            src="/images/reports-image.png"
            alt="Reports"
            width={120}
            height={120}
            className="rounded-xl"
          />
          <Image
            src="/images/analytics-image.png"
            alt="Analytics"
            width={120}
            height={120}
            className="rounded-xl"
          />
        </div>

        {/* Right Text */}
        <div className="max-w-lg">
          <div className="inline-block px-3 py-1 rounded-full border text-sm mb-4">
            First Launch
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            2021: Platform Launch
          </h3>
          <p className="text-gray-100 mb-6">
            Introduced the first iteration of our platform, enabling easier comparisons of health, life, and property insurance.
          </p>
          <button className="bg-white text-primary px-6 py-2 rounded-md shadow-sm">
            Get Started →
          </button>
        </div>
      </div>

      {/* Meet the Team */}
      <div className="text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-2">Meet the Team</h3>
        <p className="text-gray-600 mb-10">
          We’re a passionate team of innovators, problem-solvers, and customer advocates.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Image
            src="/images/team1.png"
            alt="Team Member 1"
            width={250}
            height={250}
            className="rounded-xl"
          />
          <Image
            src="/images/team2.png"
            alt="Team Member 2"
            width={250}
            height={250}
            className="rounded-xl"
          />
          <Image
            src="/images/team3.png"
            alt="Team Member 3"
            width={250}
            height={250}
            className="rounded-xl"
          />
          <Image
            src="/images/team4.png"
            alt="Team Member 4"
            width={250}
            height={250}
            className="rounded-xl"
          />
        </div>
      </div>
      
    </section>
  );
};

export default AboutUs;
