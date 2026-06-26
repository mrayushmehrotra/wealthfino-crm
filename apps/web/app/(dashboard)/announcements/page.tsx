"use client"

import { motion } from "framer-motion"
import { IconPlus, IconSpeakerphone } from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"

const ANNOUNCEMENTS = [
  { title: "Q2 Performance Reviews", body: "Performance reviews for Q2 2026 will begin on July 1st. Please ensure all self-assessments are completed by June 30th.", author: "Krishna Pathak", date: "26 Jun 2026", tag: "HR", tagColor: "bg-[#EFF6FF] text-[#3B82F6]" },
  { title: "Office Holiday — July 4th", body: "The office will be closed on July 4th for the national holiday. Please plan your deliverables accordingly.", author: "Anita Singh", date: "24 Jun 2026", tag: "General", tagColor: "bg-[#DCFCE7] text-[#22C55E]" },
  { title: "New Leave Policy Update", body: "The updated leave policy is now in effect. Casual leaves have been increased from 10 to 12 days per year.", author: "Krishna Pathak", date: "20 Jun 2026", tag: "Policy", tagColor: "bg-[#FEF3C7] text-[#F59E0B]" },
]

export default function AnnouncementsPage() {
  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Announcements</h1>
          <p className="text-sm text-[#6B7280] mt-1">Company-wide updates and notices</p>
        </div>
        <motion.button
          className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconPlus size={16} />
          New Announcement
        </motion.button>
      </motion.div>

      <motion.div className="space-y-4" variants={staggerFast}>
        {ANNOUNCEMENTS.map((a) => (
          <motion.div
            key={a.title}
            variants={slideUp}
            whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow"
          >
            <div className="flex items-start gap-4">
              <motion.div
                className="h-10 w-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.1, rotate: 4 }}
              >
                <IconSpeakerphone size={20} className="text-[#22C55E]" stroke={1.8} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-semibold text-[#1A202C] text-base">{a.title}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.tagColor}`}
                  >
                    {a.tag}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed">{a.body}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-[#9CA3AF]">
                  <span>{a.author}</span>
                  <span>·</span>
                  <span>{a.date}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
