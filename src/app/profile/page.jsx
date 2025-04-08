"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Bell,
  HelpCircle,
  LogOut,
  Home,
  Wallet,
  CreditCard,
  Send,
  ArrowUpDown,
  Edit,
  Menu,
  X,
  Copy,
  Check,
  Shield,
  CreditCard as CardIcon,
  Banknote,
  Clock,
  Camera,
} from "lucide-react";
import axios from "axios";
import { showToast } from "../../components/layout/Toast";
import { FloatingCustomerCareButton } from "../../components/layout/CustomerCare";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [lastLogin, setLastLogin] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Function to get initials from firstName and lastName
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0) : "";
    const lastInitial = lastName ? lastName.charAt(0) : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  useEffect(() => {
    // Retrieve the last login time from local storage
    const lastLoginTime = localStorage.getItem("lastLoginTime");

    if (lastLoginTime) {
      const currentTime = new Date();
      const previousTime = new Date(lastLoginTime);
      const timeDifference = currentTime - previousTime;

      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      let timeAgo = "";
      if (days > 0) {
        timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
      } else if (hours > 0) {
        timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else if (minutes > 0) {
        timeAgo = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      } else {
        timeAgo = `${seconds} second${seconds > 1 ? "s" : ""} ago`;
      }

      setLastLogin(timeAgo);
    }
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data.user);
      setPreviewUrl(res.data.user?.profileImage || "https://via.placeholder.com/100");
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch user data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size should be less than 5MB", "error");
        return;
      }
      
      // Check file type
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        showToast("Only JPEG/JPG/PNG images are allowed", "error");
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}user/upload-profile-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Profile image updated successfully", "success");
      setUser(response.data.user);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload image. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

  const handleClick = () => {
    showToast("Please Contact The Customer Care", "warning");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <FloatingCustomerCareButton />
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="mobile-menu-button mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold text-primary-700">
            W.I.B<span className="text-primary-500"></span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar fixed inset-0 z-40 md:relative md:z-0 md:w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-700">
            Western Intercontinental Bank<span className="text-primary-500"></span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Online Banking</p>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <div>
              <p className="font-medium text-sm">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">Personal Account</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            onClick={() => setSidebarOpen(false)}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          <a
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleClick()}
          >
            <Wallet size={18} />
            <span>Accounts</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleClick()}
          >
            <CreditCard size={18} />
            <span>Cards</span>
          </a>
          {/* <Link
            href="/transfers"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            onClick={() => setSidebarOpen(false)}
          >
            <Send size={18} />
            <span>Transfers</span>
          </Link> */}
          <Link
            href="/history"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            onClick={() => setSidebarOpen(false)}
          >
            <ArrowUpDown size={18} />
            <span>Transaction History</span>
          </Link>

          <div className="px-4 mt-6 mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Settings
            </p>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-700 bg-blue-50 border-l-4 border-primary-600"
            onClick={() => setSidebarOpen(false)}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            onClick={() => setSidebarOpen(false)}
          >
            <HelpCircle size={18} />
            <span>Help Center</span>
          </Link>
          <a
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 mt-6 cursor-pointer"
            onClick={() => logout()}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Profile Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 m-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
              {/* Profile Image and Upload Prompt */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-1 right-0 bg-white p-1 rounded-full shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                    title="Change photo"
                  >
                    <Camera className="text-primary-700 w-5 h-5" />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/jpeg, image/jpg, image/png"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="flex flex-col justify-center">
                  {selectedFile ? (
                    <>
                      <p className="text-primary-500 font-semibold text-base">
                        Ready to upload
                      </p>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="text-xs px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400"
                        >
                          {isUploading ? "Uploading..." : "Upload"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(user?.profileImage || "https://via.placeholder.com/100");
                          }}
                          className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-primary-500 font-semibold text-base">
                        Upload your photo
                      </p>
                      <p className="text-sm text-gray-600 max-w-xs">
                        JPG, JPEG or PNG. Max size: 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="b w-full sm:w-fit md:flex lg:flex gap-14 space-y-4 lg:items-center sm:ml-auto sm:flex items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">Personal Account</p>
                </div>
                <button className="flex items-center mr-auto gap-2 px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-blue-100">
                  <Edit size={16} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg overflow-hidden">
  <h3 className="text-sm font-medium text-gray-500">Email</h3>
  <p className="text-gray-900 font-semibold break-all truncate">
    {user?.email}
  </p>
</div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">
                Account Number
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-semibold">
                  {user?.accountNumber}
                </p>
                <button
                  onClick={() => copyToClipboard(user?.accountNumber)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  {copiedId === user?.accountNumber ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">FAT ID</h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-semibold">{user?.fatId}</p>
                <button
                  onClick={() => copyToClipboard(user?.fatId)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  {copiedId === user?.fatId ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Balance</h3>
              <p className="text-gray-900 font-semibold">
                €{user?.balance?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">
                Account Status
              </h3>
              <p className="text-gray-900 font-semibold flex items-center gap-2">
                <Shield size={16} className="text-green-500" />
                Active
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
              <p className="text-gray-900 font-semibold flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                {lastLogin}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"></div>
      )}
    </div>
  );
}