"use client"
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import Link from "next/link";
import { Filter, FileText, Banknote, ChevronRight, } from "react-feather"; 
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
  Search,
  BanknoteIcon,
} from "lucide-react";
import { FloatingCustomerCareButton } from "../../components/layout/CustomerCare";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function UserCard() {
    const SERVER_NAME = process.env.NEXT_PUBLIC_SERVER_NAME;
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [user, setUser] = useState({ firstName: "", lastName: "" });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getInitials = (firstName, lastName) => {
      const firstInitial = firstName ? firstName.charAt(0) : "";
      const lastInitial = lastName ? lastName.charAt(0) : "";
      return `${firstInitial}${lastInitial}`.toUpperCase(); // Convert to uppercase
    };

    const initials = getInitials(user.firstName, user.lastName);
  
    // Fetch Transactions
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${SERVER_NAME}transactions`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
  
        setTransactions(res.data.transactions);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch transactions.");
        setLoading(false);
      }
    };
  
    // Fetch User data
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
  
    const getAuthToken = () => {
      return localStorage.getItem("token");
    };
  
    useEffect(() => {
      getUser();
      fetchTransactions();  // Fetch transactions data on component mount
    }, []);
  
    // Prepare data for the chart
    const getChartData = () => {
        const transactionAmounts = transactions.map((transaction) => transaction.amount);
        const transactionDates = transactions.map((transaction) => {
          const date = new Date(transaction.date);
          return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        });
      
        return {
          labels: transactionDates,
          datasets: [
            {
              label: "Transaction Amounts",
              data: transactionAmounts,
              borderColor: "rgba(75, 192, 192, 1)",  // Line color
              backgroundColor: "rgba(75, 192, 192, 0.2)",  // Fill color
              fill: true,  // Fill the area under the line
              tension: 0,  // Set to 0 for sharp lines (zigzag)
            },
          ],          
        };
      };
  
    // Chart options
    const chartOptions = {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Transaction History",
          },
        },
        scales: {
          y: {
            beginAtZero: true,  // Ensures the Y-axis starts from 0 for better visibility
          },
        },
      };
      

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    // Redirect or perform any other necessary logout action
  };

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Floating Customer Care Button */}
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
            {/* <button className="relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"></span>
            </button> */}
            <Link
            href="/profile" className="w-8 h-8 cursor-pointer rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              <span>{initials}</span>
            </Link>
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
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
              onClick={() => setSidebarOpen(false)}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </Link>
            <Link
            href="/account"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-700 hover:bg-gray-50  bg-primary-50 border-l-4 border-primary-600  "
            onClick={() => setSidebarOpen(false)}
          >
            <Wallet size={18} />
           <span>Accounts</span>
          </Link>
        
            <Link
              href="/cards"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium  text-gray-700 hover:bg-gray-50  "
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
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Desktop Header */}
          <header className="hidden md:block bg-white border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800"></h2>
              <div className="flex items-center gap-2">
              <Link
                href="/profile" className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-medium">
                  <span>{initials}</span>
                </Link>
                <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                {/* <ChevronDown size={16} className="text-gray-400" /> */}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">My Accounts</h1>
              <button className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                <FileText size={18} />
                Download Summary
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative w-full sm:w-1/2">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by account name or number"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">
                <Filter size={16} />
                Filters
              </button>
            </div>

            {/* Transaction Chart */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <Line data={getChartData()} options={chartOptions} />
              )}
            </div>

            {/* Accounts List */}
            <div className="bg-white rounded-xl shadow border border-gray-200 divide-y">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center px-4 py-4 hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary-100 text-primary-600 p-2 rounded-full">
                  <ArrowUpDown size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.accountNumber} • {transaction.type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{transaction.amount}</p>
                <p className="text-sm text-gray-500">Date: {transaction.date}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4">No transactions available.</p>
        )}
      </div>
          </div>
        </div>
      </div>
    </>
  );
}

