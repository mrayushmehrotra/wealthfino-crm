"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { fadeInUp, staggerContainer, slideUp } from "@/lib/animation-variants"

export default function SettingsPage() {
  const { data: queryData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json()
    },
  })

  const user = queryData?.data || {}
  const fullName = user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : "Pending Setup"
  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-[#1A202C]">Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">Manage your account and preferences</p>
      </motion.div>

      {[
        {
          title: "Profile",
          fields: [
            { label: "Full Name", placeholder: fullName, type: "text" },
            { label: "Email", placeholder: user.email || "Loading...", type: "email" },
            { label: "Role", placeholder: user.role || "Loading...", type: "text" },
          ],
        },
        {
          title: "Security",
          fields: [
            { label: "Current Password", placeholder: "••••••••", type: "password" },
            { label: "New Password", placeholder: "••••••••", type: "password" },
            { label: "Confirm New Password", placeholder: "••••••••", type: "password" },
          ],
        },
      ].map(({ title, fields }) => (
        <motion.div
          key={title}
          variants={slideUp}
          className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        >
          <h2 className="font-semibold text-[#1A202C] mb-5">{title}</h2>
          <div className="space-y-4">
            {fields.map(({ label, placeholder, type }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-[#1A202C] mb-1.5 uppercase tracking-wide">
                  {label}
                </label>
                <motion.input
                  type={type}
                  defaultValue={type !== "password" ? placeholder : ""}
                  placeholder={type === "password" ? placeholder : ""}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] transition-colors"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            ))}
          </div>
          <motion.button
            className="mt-5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Save Changes
          </motion.button>
        </motion.div>
      ))}
    </motion.div>
  )
}
