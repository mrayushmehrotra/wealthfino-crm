"use client"

import { motion } from "framer-motion"
import { IconMail, IconPhone, IconBrandSlack } from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"
import { useFaqs } from "@/hooks/use-data"

export default function SupportPage() {
  const { data: FAQS } = useFaqs()

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-[#1A202C]">Help & Support</h1>
        <p className="text-sm text-[#6B7280] mt-1">Find answers or reach out to us</p>
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-4" variants={staggerContainer}>
        {[
          { label: "Email Support", value: "hr@wealthfino.com", icon: IconMail, bg: "bg-[#EFF6FF]", color: "text-[#3B82F6]" },
          { label: "Phone", value: "+91 98765 43210", icon: IconPhone, bg: "bg-[#DCFCE7]", color: "text-[#22C55E]" },
          { label: "Slack", value: "#help-support", icon: IconBrandSlack, bg: "bg-[#F5F3FF]", color: "text-[#8B5CF6]" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col items-center text-center gap-3"
          >
            <motion.div
              className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center`}
              whileHover={{ scale: 1.1, rotate: 4 }}
            >
              <Icon size={22} className={color} stroke={1.8} />
            </motion.div>
            <div>
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
                {label}
              </p>
              <p className="text-sm font-medium text-[#1A202C] mt-0.5">{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <h2 className="font-semibold text-[#1A202C] mb-5">
          Frequently Asked Questions
        </h2>
        <motion.div className="space-y-4" variants={staggerFast}>
          {FAQS.map(({ q, a }) => (
            <motion.div
              key={q}
              variants={fadeInUp}
              className="border-b border-[#F3F4F6] pb-4 last:border-0 last:pb-0"
            >
              <p className="font-semibold text-[#1A202C] text-sm mb-1">{q}</p>
              <p className="text-sm text-[#6B7280]">{a}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
