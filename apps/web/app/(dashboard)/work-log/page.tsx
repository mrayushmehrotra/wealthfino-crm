"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { IconChevronLeft, IconChevronRight, IconCheck, IconLoader2, IconBriefcase, IconCloudUpload } from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
} from "@/lib/animation-variants"

// Generate work hours: 9 AM to 7 PM (10 hours)
const WORK_HOURS = Array.from({ length: 10 }, (_, i) => i + 9)

export default function WorkLogPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [logs, setLogs] = useState<Record<number, { task: string, status: string }>>({})
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [isLoading, setIsLoading] = useState(false)
  
  const dateStr = date.toISOString().split("T")[0]
  const isToday = new Date().toISOString().split("T")[0] === dateStr

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    
    let loadedLogs: Record<number, { task: string, status: string }> = {}
    
    // First try from localStorage if it's today
    if (isToday) {
      const stored = localStorage.getItem(`work_log_${dateStr}`)
      if (stored) {
        try {
          // ensure backwards compatibility with older localstorage format
          const parsed = JSON.parse(stored)
          for (const key in parsed) {
             if (typeof parsed[key] === 'string') {
               loadedLogs[key as unknown as number] = { task: parsed[key], status: "Not Yet Started" }
             } else {
               loadedLogs[key as unknown as number] = parsed[key]
             }
          }
        } catch (e) {
          console.error(e)
        }
      }
    }

    // Always fetch from DB to see if there's existing saved data
    try {
      const res = await fetch(`/api/work-log?date=${dateStr}`)
      const data = await res.json()
      if (data.success) {
        data.data.forEach((log: any) => {
          const hour = new Date(log.startTime).getHours()
          // Only overwrite if it wasn't already loaded from localStorage (or if not today)
          if (!loadedLogs[hour] || !isToday) {
            loadedLogs[hour] = { task: log.task, status: log.status || "Not Yet Started" }
          }
        })
      }
    } catch (e) {
      console.error(e)
    } 

    setLogs(loadedLogs)
    setIsLoading(false)
  }, [dateStr, isToday])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const updateLog = (hour: number, updates: { task?: string, status?: string }) => {
    const current = logs[hour] || { task: "", status: "Not Yet Started" }
    const newLogs = { ...logs, [hour]: { ...current, ...updates } }
    setLogs(newLogs)
    
    // Save to localStorage if it's today
    if (isToday) {
      localStorage.setItem(`work_log_${dateStr}`, JSON.stringify(newLogs))
      // Clear the sync flag so any edits made after 9 PM will automatically trigger a new sync
      localStorage.removeItem(`work_log_sync_${dateStr}`)
    }
  }

  const syncToDatabase = async () => {
    if (Object.keys(logs).length === 0) return
    setSavingState("saving")
    
    const logsArray = Object.entries(logs).map(([hourStr, data]) => {
      const hour = parseInt(hourStr)
      const startTime = new Date(date)
      startTime.setHours(hour, 0, 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setHours(hour + 1, 0, 0, 0)
      
      return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        task: data.task,
        status: data.status
      }
    })

    try {
      const res = await fetch("/api/work-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          logs: logsArray
        })
      })
      
      if (res.ok) {
        setSavingState("saved")
        setTimeout(() => setSavingState("idle"), 3000)
      } else {
        setSavingState("error")
      }
    } catch (e) {
      setSavingState("error")
    }
  }

  // Check time every minute for auto-sync at or after 9 PM (21:00)
  useEffect(() => {
    if (!isToday) return
    
    const checkTime = () => {
      const now = new Date()
      // If it is 9 PM or later and we haven't synced recently
      if (now.getHours() >= 21) {
        const lastSync = localStorage.getItem(`work_log_sync_${dateStr}`)
        if (lastSync !== "true") {
          syncToDatabase().then(() => {
            localStorage.setItem(`work_log_sync_${dateStr}`, "true")
          })
        }
      }
    }
    
    checkTime() // check on mount
    const interval = setInterval(checkTime, 60 * 1000) // check every minute
    return () => clearInterval(interval)
  }, [isToday, logs, dateStr])

  const prevDay = () => setDate(d => {
    const nd = new Date(d)
    nd.setDate(nd.getDate() - 1)
    return nd
  })

  const nextDay = () => setDate(d => {
    const nd = new Date(d)
    nd.setDate(nd.getDate() + 1)
    return nd
  })

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12}:00 ${ampm}`
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Daily Work Log</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Data is saved locally and auto-syncs to the database after 9:00 PM.
          </p>
        </div>
        
        <button
          onClick={syncToDatabase}
          disabled={savingState === "saving"}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            savingState === "saved" ? "bg-green-100 text-green-700" :
            savingState === "error" ? "bg-red-100 text-red-700" :
            "bg-[#22C55E] hover:bg-[#16A34A] text-white"
          }`}
        >
          {savingState === "saving" ? <IconLoader2 size={16} className="animate-spin" /> : 
           savingState === "saved" ? <IconCheck size={16} /> :
           <IconCloudUpload size={16} />}
          {savingState === "saving" ? "Syncing..." : 
           savingState === "saved" ? "Synced" : 
           "Force Sync to DB"}
        </button>
      </motion.div>

      <motion.div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden" variants={fadeInUp}>
        {/* Header / Date Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <button 
            onClick={prevDay}
            className="p-2 rounded-lg hover:bg-[#E5E7EB] text-[#4B5563] transition-colors"
          >
            <IconChevronLeft size={20} />
          </button>
          <div className="font-semibold text-[#1A202C] flex items-center gap-2">
            <IconBriefcase size={18} className="text-[#22C55E]" />
            {date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <button 
            onClick={nextDay}
            className="p-2 rounded-lg hover:bg-[#E5E7EB] text-[#4B5563] transition-colors"
          >
            <IconChevronRight size={20} />
          </button>
        </div>

        {/* Hourly Inputs */}
        <div className="p-6 relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
              <IconLoader2 className="animate-spin text-[#22C55E]" size={32} />
            </div>
          )}
          
          <div className="space-y-4">
            {WORK_HOURS.map(hour => (
              <div key={hour} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 group">
                <div className="w-28 flex-shrink-0 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#E5E7EB] group-hover:bg-[#22C55E] transition-colors" />
                  <span className="text-sm font-medium text-[#4B5563]">
                    {formatHour(hour)} - {formatHour(hour + 1)}
                  </span>
                </div>
                <div className="flex-grow flex flex-col sm:flex-row gap-3 relative">
                  <input
                    type="text"
                    value={logs[hour]?.task || ""}
                    onChange={(e) => updateLog(hour, { task: e.target.value })}
                    placeholder={isToday ? "What did you work on?" : "No task recorded"}
                    disabled={!isToday && !logs[hour]?.task} // disable empty inputs on past/future dates for clarity
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#1A202C] text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] transition-all group-hover:border-[#D1D5DB] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {(isToday || logs[hour]?.task) && (
                    <select
                      value={logs[hour]?.status || "Not Yet Started"}
                      onChange={(e) => updateLog(hour, { status: e.target.value })}
                      disabled={!isToday && !logs[hour]?.task}
                      className={`w-full sm:w-40 flex-shrink-0 bg-[#F9FAFB] border border-[#E5E7EB] text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        logs[hour]?.status === "Done" ? "text-green-700 font-medium" : 
                        logs[hour]?.status === "In Progress" ? "text-blue-700 font-medium" : 
                        logs[hour]?.status === "Pending" ? "text-yellow-700 font-medium" : 
                        "text-[#6B7280]"
                      }`}
                    >
                      <option value="Not Yet Started">Not Yet Started</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
