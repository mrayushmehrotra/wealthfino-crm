"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { IconPlus, IconFolder, IconFileTypePdf, IconFileTypeXls, IconFileTypeDoc } from "@tabler/icons-react"
import type { ElementType } from "react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"


const TYPE_ICONS: Record<string, ElementType> = { pdf: IconFileTypePdf, xls: IconFileTypeXls, doc: IconFileTypeDoc }
const TYPE_COLORS: Record<string, string> = { pdf: "text-[#EF4444] bg-[#FEE2E2]", xls: "text-[#22C55E] bg-[#DCFCE7]", doc: "text-[#3B82F6] bg-[#EFF6FF]" }

export default function DocumentsPage() {
  const { data: queryData } = useQuery({
    queryKey: ["DOCS"],
    queryFn: async () => {
      const res = await fetch("/api/documents")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })
  
  const DOCS: Record<string, unknown>[] = queryData?.data || []

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Documents</h1>
          <p className="text-sm text-[#6B7280] mt-1">Company file storage</p>
        </div>
        <motion.button
          className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconPlus size={16} /> Upload Document
        </motion.button>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <IconFolder size={18} className="text-[#F59E0B]" />
          <span className="font-semibold text-[#1A202C] text-sm">
            All Files ({DOCS.length})
          </span>
        </div>
        <motion.div className="divide-y divide-[#F3F4F6]" variants={staggerFast}>
          {DOCS.map((doc) => {
            const Icon = TYPE_ICONS[doc.type] ?? IconFolder
            const style = TYPE_COLORS[doc.type] ?? "text-[#6B7280] bg-[#F3F4F6]"
            return (
              <motion.div
                key={doc.name}
                variants={fadeInUp}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-colors"
              >
                <motion.div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${style}`}
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon size={20} stroke={1.8} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1A202C] text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {doc.size} · {doc.uploaded} · {doc.by}
                  </p>
                </div>
                <motion.button
                  className="text-xs font-semibold text-[#22C55E] hover:underline shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Download
                </motion.button>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
