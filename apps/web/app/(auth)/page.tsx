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
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* Top right toggle button */}
      <Button
        variant="ghost"
        className="absolute right-4 top-4 md:right-8 md:top-8"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "Create account" : "Login"}
      </Button>

      {/* Left panel (Dark side) */}
      <div className="relative hidden h-full flex-col bg-[#0D1B2A] p-10 text-white lg:flex dark:border-r">
        {/* Abstract pattern or subtle gradient */}
        <div className="absolute inset-0 bg-[#0D1B2A]" />
        
        {/* Logo area */}
        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]">
            <Image src={logoSrc} alt="WealthFino" width={20} height={20} className="object-contain" />
          </div>
          WealthFino CRM
        </div>
        
        {/* Testimonial area */}
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This CRM has saved me countless hours of work and helped me deliver stunning results to my clients faster than ever before.&rdquo;
            </p>
            <footer className="text-sm text-[#8A9BA8]">Sofia Davis, Wealth Manager</footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel (Form side) */}
      <div className="lg:p-8 flex items-center justify-center h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" 
                ? "Enter your email below to sign in to your account" 
                : "Enter your details below to create your account"}
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
                    <Label className="sr-only" htmlFor="name">Full Name</Label>
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
                      className="bg-transparent"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="sr-only" htmlFor="email">Email</Label>
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
                    className="bg-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="sr-only" htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-transparent"
                  />
                </div>

                <Button className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white">
                  {mode === "login" ? "Sign In with Email" : "Sign Up with Email"}
                </Button>
              </form>

              <div className="relative mt-6 mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button variant="outline" type="button" className="w-full bg-transparent">
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
                </svg>
                GitHub
              </Button>
            </motion.div>
          </AnimatePresence>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
          
        </div>
      </div>
    </div>
  )
}
