// components/OTPInput.js
import { useRef, useEffect } from "react";

export default function OTPInput({ value, onChange, error }) {
  const inputRefs = useRef([]);

  const handleChange = (index, val) => {
    if (val.length > 1) {
      val = val.slice(0, 1);
    }

    const newOTP = value.split("");
    newOTP[index] = val;
    onChange(newOTP.join(""));

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    onChange(pastedData);
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="w-full px-4">
      <div className="flex gap-1 sm:gap-2 justify-center max-w-xs mx-auto">
        {[...Array(6)].map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`flex-1 aspect-square max-w-12 h-10 sm:h-12 text-center text-base sm:text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-center text-red-500 px-4">{error}</p>
      )}
    </div>
  );
}
