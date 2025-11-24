import React from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

const LEFT_IMAGE_SRC = "/img/servicemodal.png";

export default function WorkingProfessionalsInsuranceModal({
  open,
  onClose,
}: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex rounded-3xl bg-white shadow-2xl max-w-3xl w-full mx-4 overflow-hidden animate-fadeIn relative">
        {/* Left side image */}
        <div className="hidden md:block w-1/3 h-full">
          <img
            src={LEFT_IMAGE_SRC}
            alt="Professional workspace"
            className="w-full h-full object-cover"
            style={{ minHeight: "400px", maxHeight: "600px" }}
          />
        </div>
        {/* Right side: Form */}
        <div className="flex flex-col flex-1 h-full p-10">
          {/* Close Button */}
          <button
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
          <div className="w-full max-w-md flex flex-col">
            <div className="flex justify-end">
              {/* <span className="bg-[#f2ebff] rounded-full px-3 py-1 text-sm font-medium text-[#6b36cd]">
                1/3
              </span> */}
            </div>
            <div className="mb-3 flex">
              <span className="inline-block bg-[#531D6F1A] text-primary px-3 py-1 rounded-full font-semibold text-sm">
                Begin your Journey
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-start">
              Working Professionals Insurance
            </h2>
            <p className="text-gray-500 mb-6 text-start">
              Find what&apos;s best for you based on your profile
            </p>
            <form className="flex flex-col gap-5">
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-start ">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Your Name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#c59eec]"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-start">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#c59eec]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white font-semibold py-2 rounded-md hover:bg-primary/90 transition-all"
              >
                Next
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
