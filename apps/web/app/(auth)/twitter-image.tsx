import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "WealthFino CRM"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #07111d 0%, #0b1726 46%, #11233a 100%)",
        color: "white",
        padding: 64,
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 36,
          borderRadius: 32,
          border: "1px solid rgba(148, 163, 184, 0.18)",
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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#22c55e",
              color: "#07111d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            W
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>WealthFino CRM</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            Finance team CRM built for operations, payroll, and performance
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, color: "#cbd5e1" }}>
            Secure employee management, attendance, leave, reporting, and task
            workflows in one system.
          </div>
        </div>
      </div>
    </div>,
    size
  )
}
