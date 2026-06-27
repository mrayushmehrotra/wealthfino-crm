"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import logoSrc from "@/app/logo.png"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "login") {
      console.log("Login:", { email, password })
    } else {
      console.log("Signup:", { name, email, password })
    }
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-black text-white">
      
      {/* Top right toggle button */}
      <Button
        variant="ghost"
        className="absolute right-4 top-4 md:right-8 md:top-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "Create account" : "Login"}
      </Button>

      {/* Left panel (Dark side) */}
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r overflow-hidden">
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
            <Image src={logoSrc} alt="WealthFino" width={20} height={20} className="object-contain" />
          </div>
          WealthFino CRM
        </div>
        
     
      </div>

      {/* Right panel (Form side) */}
      <div className="lg:p-8 flex items-center justify-center h-full bg-black">
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
                
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label className="sr-only text-zinc-300" htmlFor="name">Full Name</Label>
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
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700 h-10"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="sr-only text-zinc-300" htmlFor="email">Email</Label>
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
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700 h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="sr-only text-zinc-300" htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700 h-10"
                  />
                </div>

                <Button className="w-full bg-white text-black hover:bg-zinc-200 h-10 font-medium">
                  {mode === "login" ? "Sign In with Email" : "Sign In with Email"}
                </Button>
              </form>

        

            </motion.div>
          </AnimatePresence>

          <p className="px-8 text-center text-sm text-zinc-500">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
          
        </div>
      </div>
    </div>
  )
}
