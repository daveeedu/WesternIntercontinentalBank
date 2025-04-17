"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserTransferForm from "../../components/ui/UserTransferForm";
import TransactionTable from "../../components/ui/TransactionTable";
import UserLocation from "../../components/ui/userLocation";
import { showToast } from "../../components/layout/Toast";
import { ArrowLeftCircle, CheckCircle } from "lucide-react";
import {
  Home,
  CreditCard,
  Send,
  Wallet,
  ArrowUpDown,
  Bell,
  User,
  ChevronDown,
  Calendar,
  PlusCircle,
  Download,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { FaCopy } from "react-icons/fa";
import axios from "axios";
import { FloatingCustomerCareButton } from "../../components/layout/CustomerCare";

export default function UserCard() {
  const SERVER_NAME = process.env.NEXT_PUBLIC_SERVER_NAME;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [user, setUser] = useState({});
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: "8734 5621 9048 2376",
    balance: "€12,450.82",
    savingsBalance: "€5,382.65",
    currency: "EUR",
    accountStatus: "Active",
  });
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [step, setStep] = useState(1);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // handle final submission here
      setShowSuccessModal(true);
      setStep(1);
      setShowForm(false);
    }
  };

  const [selectedCardType, setSelectedCardType] = useState(null);

  const [firstName, setFirstName] = useState(() => {});

  const [quickAccounts, setQuickAccounts] = useState([
    {
      name: "Sarah Johnson",
      accountNumber: "****3842",
      lastTransfer: "€250.00",
    },
    {
      name: "David Miller",
      accountNumber: "****9572",
      lastTransfer: "€125.00",
    },
    {
      name: "Savings Account",
      accountNumber: "****7601",
      lastTransfer: "€800.00",
    },
  ]);

  // Get token from localStorage (either adminToken or token)
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const handleFormClose = () => {
    setShowForm(false); // Hides the UserTransferForm completely
  };

  const getUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const res = await axios.get(`${SERVER_NAME}user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data.user);
      setError("");
    } catch (error) {
      setUser(null);
      setError(error.response?.data?.message || "User not found");
    }
  };

  // Fetch transactions for the logged-in user
  const fetchTransactions = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const res = await axios.get(`${SERVER_NAME}transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions(res.data.transactions);
      setLoading(false);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch transactions."
      );
      setLoading(false);
    }
  };

  // Poll for real-time updates
  useEffect(() => {
    getUser();
    fetchTransactions();
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarOpen &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".mobile-menu-button")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Function to get initials from firstName and lastName
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0) : "";
    const lastInitial = lastName ? lastName.charAt(0) : "";
    return `${firstInitial}${lastInitial}`.toUpperCase(); // Convert to uppercase
  };

  const initials = getInitials(user.firstName, user.lastName);
  const [showCardForm, setShowCardForm] = useState(false);

  const [copiedId, setCopiedId] = useState(null); // Track which Account Number was copied

  // Function to copy the account number to the clipboard
  const copyToClipboard = (accountNumber) => {
    navigator.clipboard
      .writeText(accountNumber)
      .then(() => {
        setCopiedId(accountNumber); // Set the copied account number
        setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

  const handleClick = () => {
    showToast("Please Contact The Customer Care", "warning");
  };

  return (
    <>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center relative w-full max-w-md mx-auto">
            <CheckCircle size={50} className="text-green-500 mx-auto" />
            <p className="text-lg font-semibold mt-4 text-gray-900">
              Form Submitted Successfully
            </p>
            <p className="text-sm text-gray-500">
              Your virtual debit card request has been submitted successfully.
              You will receive a confirmation email shortly.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setFormData({
                  accountNumber: "",
                  recipientName: "",
                  bankName: "",
                  amount: "",
                  description: "",
                  currency: "USD",
                  otp: "",
                });
              }}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

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
            <h1 className="text-xl font-bold text-primary-700">W.I.B</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              {initials}
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
              Western Intercontinental{" "}
              <span className="text-primary-500">Bank</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Online Banking</p>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {user.firstName} {user.lastName}{" "}
                </p>
                <p className="text-xs text-gray-500">Personal Account</p>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-700 hover:bg-blue-50"
              onClick={() => setSidebarOpen(false)}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </Link>
            <Link
            href="/account"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-700 hover:bg-blue-50 border-l-4 "
            onClick={() => setSidebarOpen(false)}
          >
            <Wallet size={18} />
           <span>Accounts</span>
          </Link>
        
            <Link
              href="/cards"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium  text-primary-700  bg-primary-50 border-l-4 border-primary-600 "
              onClick={() => setSidebarOpen(false)}
            >
              <CreditCard size={18} />
              <span>Cards</span>
            </Link>
            {/* / */}
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
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
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
        <div className="flex-1  flex flex-col overflow-auto md:overflow-auto lg:overflow-hidden">
          <header className="hidden md:block bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Virtual Cards
                </h2>
              </div>
              <div className="flex items-center gap-6">
                {/* <button className="relative">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"></span>
                      </button> */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {initials}
                  </div>
                  <span className="text-sm font-medium">
                    {user.firstName} {user.lastName}{" "}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </header>
          <div className="bg-white min-h-screen text-white flex items-center justify-center p-4 sm:p-6 md:p-8">
  <div className="w-full max-w-3xl">
    {!showForm ? (
      <>
        {/* Intro Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-600 mb-2">
            Virtual Debit Card
          </h1>
          <h4 className="text-lg sm:text-xl text-zinc-600">
            Specially designed for your online transactions.
          </h4>
        </div>

        <div className="border rounded-2xl p-6 sm:p-8">
          <div className="bg-gray-50 mx-auto flex w-fit p-6 rounded-full">
            <CreditCard size={54} color="#7b68c5" />
          </div>
          <p className="text-zinc-900 my-8 text-center text-base sm:text-lg">
            The Western Intercontinental Bank Virtual Debit Card is a digital payment card designed to facilitate frequent online shoppers with a secure and flexible alternative to physical payment cards. The virtual card is instantly issued upon request.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 px-6 py-3 mx-auto block rounded-lg font-medium text-sm sm:text-base"
          >
            Request New Virtual Card
          </button>
        </div>
      </>
    ) : (
      <div className="bg-white border rounded-2xl overflow-hidden">
        {/* Form Header */}
        <div className="border-b border-gray-700 px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex items-center justify-between">
          <button
            onClick={() => {
              if (step === 1) {
                setShowForm(false);
              } else {
                setStep(1);
              }
            }}
            className="flex items-center text-zinc-800 hover:text-zinc-900 gap-1 text-sm sm:text-base"
          >
            <ArrowLeftCircle size={20} /> Back
          </button>
          <h2 className="text-lg sm:text-xl font-semibold text-primary-600">
            {step === 1 ? "Cardholder Information" : "Security & Preferences"}
          </h2>
        </div>

        {/* Step Indicator */}
        <div className="px-4 sm:px-6 md:px-8 pt-4">
          <div className="flex items-center">
            <div className="flex-1 h-1 bg-primary-100 rounded-full mr-2">
              <div
                className={`h-1 ${step === 2 ? "w-full" : "w-1/2"} bg-primary-600 rounded-full transition-all duration-300`}
              />
            </div>
            <span className="text-sm text-zinc-900">Step {step} of 2</span>
          </div>
        </div>

        {/* Form Content */}
        <form className="p-4 sm:p-6 md:p-8 space-y-6" onSubmit={handleNext}>
          {step === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Cardholder Name", type: "text", placeholder: "John Doe" },
                { label: "Phone Number", type: "tel", placeholder: "123-456-7890" },
                { label: "Email", type: "email", placeholder: "email@example.com" },
                { label: "Address", type: "text", placeholder: "123 Main St" },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="block mb-1 text-zinc-900">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full p-3 rounded-lg text-zinc-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-zinc-900">Security Question</label>
                  <select className="w-full p-3 rounded-lg text-zinc-800 border border-gray-700">
                    <option>First pet's name?</option>
                    <option>Mother's maiden name?</option>
                    <option>Favorite teacher?</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-zinc-900">Answer</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg bg-white text-zinc-900 border border-gray-700"
                    placeholder="Type your answer"
                    required
                  />
                </div>
              </div>

              {/* Card Type Buttons */}
              <div>
                <label className="block mb-2 text-zinc-900">Choose Card Type</label>
                <div className="flex flex-wrap gap-3">
                  {["Visa", "MasterCard", "Discover"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedCardType(type)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedCardType === type
                          ? "bg-primary-600 text-white"
                          : "bg-white border text-zinc-900 border-gray-900 hover:bg-primary-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 form-checkbox text-primary-600"
                  required
                />
                <label htmlFor="terms" className="text-sm text-zinc-900">
                  I agree to the{" "}
                  <a href="#" className="text-primary-600 hover:underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </>
          )}

          {/* Submit/Next Button */}
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 py-3 rounded-lg font-semibold transition text-white"
          >
            {step === 1 ? "Next" : "Submit Application"}
          </button>
        </form>
      </div>
    )}
  </div>
</div>

          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"></div>
          )}
        </div>
      </div>
    </>
  );
}
