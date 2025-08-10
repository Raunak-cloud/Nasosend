"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  Shield,
  Edit3,
  Save,
  X,
  Calendar,
  Clock,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    bio: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    gender: "male",
    emergencyContact: "",
    emergencyName: "",
    emergencyRelation: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        displayName:
          userProfile.verification?.fullName || userProfile.displayName || "",
        email: userProfile.email || "",
        bio: userProfile.bio || "",
        address: userProfile.address || "",
        city: userProfile.city || "",
        country: userProfile.country || "Australia",
        postalCode: userProfile.postalCode || "",
        gender: userProfile.gender || "male",
        emergencyContact:
          userProfile.emergencyContact ||
          userProfile.verification?.emergencyContact ||
          "",
        emergencyName:
          userProfile.emergencyName ||
          userProfile.verification?.emergencyName ||
          "",
        emergencyRelation: userProfile.emergencyRelation || "",
      });
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Enhanced Avatar Component using initials and gender-based colors
  const EnhancedAvatar = ({ name, gender, size = "lg" }) => {
    const getInitials = (name) => {
      if (!name) return "U";
      const names = name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const sizeClasses = {
      sm: "w-12 h-12 text-lg",
      md: "w-16 h-16 text-xl",
      lg: "w-24 h-24 text-2xl",
      xl: "w-32 h-32 text-4xl",
    };

    const gradients = {
      male: "bg-gradient-to-br from-blue-500 to-blue-600",
      female: "bg-gradient-to-br from-pink-500 to-rose-500",
    };

    return (
      <div
        className={`${sizeClasses[size]} ${gradients[gender]} rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-white ring-opacity-20`}
      >
        {getInitials(name)}
      </div>
    );
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        email: profileData.email,
        bio: profileData.bio,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        postalCode: profileData.postalCode,
        gender: profileData.gender,
        emergencyContact: profileData.emergencyContact,
        emergencyName: profileData.emergencyName,
        emergencyRelation: profileData.emergencyRelation,
        updatedAt: new Date(),
      });

      if (profileData.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName,
        });
      }

      setIsEditing(false);
      // Success notification (you can replace this with a toast)
      alert("Profile updated successfully! ✨");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "contact", label: "Contact & Address", icon: MapPin },
    { id: "emergency", label: "Emergency Contact", icon: Heart },
    ...(userProfile?.role === "traveler"
      ? [{ id: "verification", label: "Verification", icon: Shield }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/10"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative z-10 px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                  <EnhancedAvatar
                    name={profileData.displayName || "User"}
                    gender={profileData.gender}
                    size="xl"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center md:text-left text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {profileData.displayName || "Welcome!"}
                  </h1>

                  <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-blue-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Member since{" "}
                        {userProfile?.createdAt
                          ?.toDate?.()
                          ?.toLocaleDateString() || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  isEditing ? handleSaveProfile() : setIsEditing(true)
                }
                disabled={isSaving}
                className={`group relative px-8 py-3 bg-white text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isEditing ? "bg-green-500 text-white" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "text-blue-600 border-blue-600 bg-blue-50/50"
                      : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {activeTab === "personal" && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Personal Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            displayName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={user.phoneNumber}
                          disabled
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Phone number cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Gender
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["male", "female"].map((gender) => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() =>
                              isEditing &&
                              setProfileData({ ...profileData, gender })
                            }
                            disabled={!isEditing}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              profileData.gender === gender
                                ? gender === "male"
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-pink-500 bg-pink-50 text-pink-700"
                                : "border-gray-200 hover:border-gray-300"
                            } ${
                              !isEditing
                                ? "opacity-60 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <EnhancedAvatar
                                name="A"
                                gender={gender}
                                size="sm"
                              />
                              <span className="font-medium capitalize">
                                {gender}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Contact & Address
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                      placeholder="123 Main Street, Apartment 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            city: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                        placeholder="Sydney"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Country
                      </label>
                      <select
                        value={profileData.country}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            country: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                      >
                        <option value="Australia">Australia</option>
                        <option value="Nepal">Nepal</option>
                        <option value="USA">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="India">India</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={profileData.postalCode}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            postalCode: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                        placeholder="2000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Emergency Contact
                  </h2>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">
                        Important Safety Information
                      </p>
                      <p className="text-amber-800 text-sm mt-1">
                        Emergency contact information is crucial for traveler
                        safety and will only be used in genuine emergencies.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={profileData.emergencyName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            emergencyName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                        placeholder="Full name of emergency contact"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Relationship
                      </label>
                      <select
                        value={profileData.emergencyRelation}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            emergencyRelation: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                      >
                        <option value="">Select relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="child">Child</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Emergency Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.emergencyContact}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            emergencyContact: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                        placeholder="+61 XXX XXX XXX"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Include country code for international numbers
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "verification" &&
              userProfile?.role === "traveler" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Account Verification
                    </h2>
                  </div>

                  {userProfile?.verified ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-green-900 mb-1">
                            Verification Complete ✅
                          </h3>
                          <p className="text-green-700 text-lg">
                            Your account is verified and you can post trips with
                            confidence.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : userProfile?.verificationPending ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-8 border border-yellow-200">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-yellow-900 mb-1">
                            Verification Pending ⏳
                          </h3>
                          <p className="text-yellow-700 text-lg">
                            Your verification is under review. This usually
                            takes 24-48 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-8 border border-red-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-red-900 mb-1">
                              Not Verified ❌
                            </h3>
                            <p className="text-red-700 text-lg">
                              Complete verification to start posting trips and
                              gain traveler trust.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push("/traveler/verification")}
                          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-all duration-200 hover:scale-105"
                        >
                          Start Verification
                        </button>
                      </div>
                    </div>
                  )}

                  {userProfile?.verification && (
                    <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
                      <h4 className="font-bold text-gray-900 mb-6 text-xl">
                        Verification Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <dt className="text-sm font-semibold text-gray-600 mb-1">
                              Full Name
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {userProfile.verification.fullName || "N/A"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-semibold text-gray-600 mb-1">
                              Flight Date
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {userProfile.verification.flightDate || "N/A"}
                            </dd>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <dt className="text-sm font-semibold text-gray-600 mb-1">
                              Flight Number
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {userProfile.verification.flightNumber || "N/A"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-semibold text-gray-600 mb-1">
                              Submitted
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {userProfile.verification.submittedAt
                                ?.toDate?.()
                                ?.toLocaleDateString() || "N/A"}
                            </dd>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Enhanced Cancel Button */}
      {isEditing && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={() => {
              setIsEditing(false);
              setProfileData({
                displayName: userProfile?.displayName || "",
                email: userProfile?.email || "",
                bio: userProfile?.bio || "",
                address: userProfile?.address || "",
                city: userProfile?.city || "",
                country: userProfile?.country || "Australia",
                postalCode: userProfile?.postalCode || "",
                gender: userProfile?.gender || "male",
                emergencyContact: userProfile?.emergencyContact || "",
                emergencyName: userProfile?.emergencyName || "",
                emergencyRelation: userProfile?.emergencyRelation || "",
              });
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel Changes
          </button>
        </div>
      )}
    </div>
  );
}
