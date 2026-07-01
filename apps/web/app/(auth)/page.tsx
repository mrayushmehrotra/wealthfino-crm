"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import logoSrc from "@/app/logo.png"
import { IconEye } from "@tabler/icons-react"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [passwordMode, setPasswordMode] = useState<"text" | "password">(
    "password"
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [pendingMessage, setPendingMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setPendingMessage("")
    setLoading(true)

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup"
      const body =
        mode === "login" ? { email, password } : { name, email, password }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || "Something went wrong")
      }

      if (data.pending) {
        setPendingMessage(data.message)
        return
      }

      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative container h-screen flex-col items-center justify-center bg-black p-4 text-white md:grid md:p-2 lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Top right toggle button */}
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-zinc-400 hover:bg-zinc-800 hover:text-white md:top-8 md:right-8"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "Create account" : "Login"}
      </Button>

      {/* Left panel (Dark side) */}
      <div className="relative hidden h-full flex-col overflow-hidden p-10 text-white lg:flex dark:border-r">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/auth_screen_video.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#0D1B2A]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/90 via-[#0D1B2A]/40 to-[#0D1B2A]/20" />

        {/* Logo area */}
        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]">
            <Image
              src={logoSrc}
              alt="WealthFino"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          WealthFino CRM
        </div>

        {/* Center Content */}
        <div className="relative z-20 m-auto flex max-w-lg flex-col items-start justify-center pt-20">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">
            Next-Generation Employee Management
          </h2>
          <p className="text-lg leading-relaxed text-zinc-300">
            Streamline your workforce, automate payroll, and track performance
            with the most powerful CRM built specifically for modern financial
            teams.
          </p>
        </div>
      </div>

      {/* Right panel (Form side) */}
      <div className="flex h-full items-center justify-center bg-black lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm text-zinc-400">
              {mode === "login"
                ? "Enter your email below to sign in to your account"
                : "Enter your email below to create your account"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-center text-sm text-red-400">
                    {error}
                  </div>
                )}

                {pendingMessage && (
                  <div className="rounded-lg border border-green-900 bg-green-950/50 p-3 text-center text-sm text-green-400">
                    {pendingMessage}
                  </div>
                )}

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label className="sr-only text-zinc-300" htmlFor="name">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="name"
                      autoCorrect="off"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-10 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="sr-only text-zinc-300" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="sr-only text-zinc-300" htmlFor="password">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Password"
                      type={passwordMode}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 border-zinc-800 bg-zinc-950 pr-10 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPasswordMode(
                          passwordMode === "password" ? "text" : "password"
                        )
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <IconEye size={18} />
                    </button>
                  </div>
                </div>

                <Button
                  disabled={loading}
                  className="h-10 w-full bg-white font-medium text-black hover:bg-zinc-200"
                >
                  {loading
                    ? "Please wait..."
                    : mode === "login"
                      ? "Sign In with Email"
                      : "Sign Up with Email"}
                </Button>
              </form>
            </motion.div>
          </AnimatePresence>

          <p className="px-8 text-center text-sm text-zinc-500">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-white"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-white"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
