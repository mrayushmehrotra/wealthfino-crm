"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IconPlus, IconSpeakerphone } from "@tabler/icons-react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth, useAnnouncements } from "@/hooks/use-data"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"

export default function AnnouncementsPage() {
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tag, setTag] = useState("General")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const { data: user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const queryClient = useQueryClient()
  const { data: ANNOUNCEMENTS, refetch } = useAnnouncements()

  useEffect(() => {
    fetch("/api/announcements/read", { method: "POST" }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !body) {
      setError("Title and content are required")
      return
    }
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, tag }),
      })
      if (!res.ok) throw new Error("Failed to create announcement")
      setShowModal(false)
      setTitle("")
      setBody("")
      setTag("General")
      refetch()
      queryClient.invalidateQueries({ queryKey: ["unreadAnnouncements"] })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

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
        {isAdmin && (
          <motion.button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <IconPlus size={16} />
            New Announcement
          </motion.button>
        )}
      </motion.div>

      <motion.div className="space-y-4" variants={staggerFast}>
        {ANNOUNCEMENTS.map((a) => (
          <motion.div
            key={a.id}
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
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.tagColor || "bg-[#DBEAFE] text-[#1D4ED8]"}`}
                  >
                    {a.tag || "General"}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-wrap">{a.body}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-[#9CA3AF]">
                  <span>{a.author}</span>
                  <span>·</span>
                  <span>{a.date}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {ANNOUNCEMENTS.length === 0 && (
          <div className="text-center py-12 text-[#9CA3AF] text-sm bg-white rounded-xl border border-[#E5E7EB]">
            No announcements yet.
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#1A202C]">New Announcement</h2>
                <button onClick={() => setShowModal(false)} className="text-[#6B7280] hover:text-[#1A202C] text-xl leading-none">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-[#FEE2E2] text-[#EF4444] text-sm font-medium px-4 py-3 rounded-lg border border-[#FECACA]">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                    placeholder="E.g. Company Holiday on Friday"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Tag</label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                  >
                    <option value="General">General</option>
                    <option value="Important">Important</option>
                    <option value="Event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Content</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                    placeholder="Write your announcement here..."
                    required
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-semibold text-[#6B7280] hover:text-[#1A202C] transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-[#9CA3AF] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {submitting ? "Posting..." : "Post Announcement"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
