"use client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/authOptions";
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Settings,
  User,
  LogOut,
  Shield,
  Bell,
  Search,
  ChevronRight,
  Calendar,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex ">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-primary flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">InsurBe</h2>
              <p className="text-xs text-gray-500">Insurance Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <a
            href="#dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-primary text-white font-semibold shadow-md transition-all hover:shadow-lg"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>

          <a
            href="#policies"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all group"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>My Policies</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="#documents"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all group"
          >
            <FileText className="w-5 h-5" />
            <span>Documents</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="#profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all group"
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <a
            href="#settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all group"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </nav>

        {/* User Info at Bottom */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-primary flex items-center justify-center text-white font-bold">
              {session.user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session.user?.email}
              </p>
              <p className="text-xs text-gray-500">Premium Member</p>
            </div>
          </div>
          <Link href="/login">
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
              }}
              className="w-full cursor-pointer mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex flex-col h-screen w-full">
        {/* Header - Fixed at top */}
        <header className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6  flex-shrink-0 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                Welcome back,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-primary">
                  {session.user?.email?.split("@")[0]}
                </span>
              </h1>
              <p className="text-gray-600 text-sm">
                Here's what's happening with your insurance today
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all bg-white"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-white transition-all">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Active Policies */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-primary flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  +12%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">3</h3>
              <p className="text-sm text-gray-600">Active Policies</p>
            </div>

            {/* Total Coverage */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-primary flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">€150K</h3>
              <p className="text-sm text-gray-600">Total Coverage</p>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-primary flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  New
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
              <p className="text-sm text-gray-600">Documents</p>
            </div>       
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Policies */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Policies
                </h2>
                <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition">
                  View all →
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: "Private Health Insurance",
                    status: "Active",
                    color: "from-purple-500 to-primary",
                    amount: "€420/mo",
                  },
                  {
                    name: "Public Health Insurance",
                    status: "Active",
                    color: "from-purple-500 to-primary",
                    amount: "€280/mo",
                  },
                  {
                    name: "Expat Health Insurance",
                    status: "Pending",
                    color: "from-purple-500 to-primary",
                    amount: "€150/mo",
                  },
                ].map((policy, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${policy.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                    >
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {policy.name}
                      </h3>
                      <p className="text-sm text-gray-600">{policy.amount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          policy.status === "Active"
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {policy.status}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Documents
                </h2>
                <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition">
                  View all →
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: "Policy Certificate.pdf",
                    date: "2 days ago",
                    size: "1.2 MB",
                  },
                  {
                    name: "Coverage Details.pdf",
                    date: "5 days ago",
                    size: "850 KB",
                  },
                  {
                    name: "Payment Receipt.pdf",
                    date: "1 week ago",
                    size: "320 KB",
                  },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-primary flex items-center justify-center flex-shrink-0 shadow-md">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {doc.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {doc.date} • {doc.size}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
