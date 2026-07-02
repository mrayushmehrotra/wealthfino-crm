import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt =
  "WealthFino CRM - financial services CRM for employee management, payroll, attendance, and performance"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(circle at top left, rgba(34, 197, 94, 0.32), transparent 34%), linear-gradient(135deg, #06111d 0%, #0b1726 42%, #101c2f 100%)",
        color: "white",
        position: "relative",
        padding: 72,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 72,
          width: 240,
          height: 240,
          borderRadius: 9999,
          background: "rgba(34, 197, 94, 0.12)",
          filter: "blur(12px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 72,
          width: 320,
          height: 320,
          borderRadius: 9999,
          border: "1px solid rgba(148, 163, 184, 0.14)",
          opacity: 0.35,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
              color: "#07111d",
            }}
          >
            W
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
              WealthFino CRM
            </div>
            <div style={{ fontSize: 18, color: "#b8c3d4" }}>
              Financial operations, workforce management, and payroll
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            Employee management CRM for financial teams
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "#d7e0ee",
              maxWidth: 860,
            }}
          >
            Attendance, leave, payroll, performance, reports, announcements, and
            day-to-day operations in one secure platform.
          </div>
        </div>
      </div>
    </div>,
    size
  )
}
