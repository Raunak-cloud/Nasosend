import React from "react";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/nasosend.png"
                alt="Nasosend Logo"
                width={88}
                height={68}
              />
              <h3 className="text-2xl font-bold">Nasosend</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Connecting Australia and Nepal through trusted crowdshipping. Send
              items quickly, safely, and affordably with verified travelers.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                support@nasosend.com
              </div>

              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Sydney, Australia
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <div className="space-y-3 text-sm">
              <a
                href="/how-it-works"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                How it Works
              </a>

              <a
                href="/safety"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Safety Guidelines
              </a>
            </div>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <div className="space-y-3 text-sm">
              <a
                href="/sender/dashboard"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Send an Item
              </a>
              <a
                href="/traveler/dashboard"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Become a Traveler
              </a>
              <a
                href="/blogs"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Blog
              </a>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="space-y-3 text-sm">
              <a
                href="/support"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Contact Us
              </a>

              <a
                href="/report-bugs"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Report bugs
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-300 mb-4 md:mb-0">
              <a href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
              <a href="/refund" className="hover:text-white transition-colors">
                Refund Policy
              </a>
            </div>
            <div className="text-sm text-gray-300">
              <p>&copy; 2025 Nasosend. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
