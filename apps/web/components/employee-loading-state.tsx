import { IconLoader2 } from "@tabler/icons-react"

export function EmployeeLoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7]">
        <IconLoader2 size={28} className="animate-spin text-[#22C55E]" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-[#1A202C]">{label}</p>
        <p className="text-sm text-[#6B7280]">
          Please wait while the employee data is loaded.
        </p>
      </div>
    </div>
  )
}
