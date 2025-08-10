// components/PhoneInput.js
import { useState, useEffect, useRef } from "react";

const countryCodes = [
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+977", country: "NP", flag: "🇳🇵", name: "Nepal" },
];

export default function PhoneInput({ value, onChange, error }) {
  const [countryCode, setCountryCode] = useState("+61");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    onChange(`${countryCode}${phoneNumber}`);
  }, [countryCode, phoneNumber, onChange]);

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="w-full">
      <div className="flex gap-2 w-full">
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 h-12"
          >
            <span className="text-base sm:text-xl">
              {countryCodes.find((c) => c.code === countryCode)?.flag}
            </span>
            <span className="font-medium text-sm sm:text-base">
              {countryCode}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showDropdown && (
            <div
              className="absolute top-full left-0 mt-1 w-52 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg"
              style={{ zIndex: 9999 }}
            >
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setCountryCode(country.code);
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="text-base sm:text-xl">{country.flag}</span>
                  <span className="font-medium text-sm sm:text-base">
                    {country.code}
                  </span>
                  <span className="text-gray-600 text-sm truncate">
                    {country.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="Phone number"
          className={`flex-1 min-w-0 px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base h-12 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          maxLength={15}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
