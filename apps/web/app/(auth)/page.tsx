"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { IconMail, IconLock, IconUser, IconTrendingUp } from "@tabler/icons-react"

interface AuthPageProps {
  defaultTab?: "login" | "signup"
}

const AuthPage: React.FC<AuthPageProps> = ({ defaultTab = "login" }) => {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login:", { email: loginEmail, password: loginPassword })
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Signup:", {
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    })
  }

  return (
    <div className="w-full max-w-md relative z-10">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className="bg-green-600 p-3 rounded-xl shadow-lg"
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ rotate: 4, scale: 1.05 }}
          >
            <IconTrendingUp className="w-8 h-8 text-white" stroke={1.8} />
          </motion.div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">WealthFino CRM</h1>
        <p className="text-gray-600 mt-2">Manage your wealth, grow your business</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      >
        <Card className="border-border shadow-xl backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={defaultTab}
              className="w-full"
              onValueChange={(v) => setActiveTab(v as "login" | "signup")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" forceMount>
                <AnimatePresence mode="wait">
                  {activeTab === "login" && (
                    <motion.form
                      key="login"
                      onSubmit={handleLogin}
                      className="space-y-4"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <IconMail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <IconLock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="remember"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-600"
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            Remember me
                          </label>
                        </div>
                        <a
                          href="#"
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Forgot password?
                        </a>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          Sign In
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="signup" forceMount>
                <AnimatePresence mode="wait">
                  {activeTab === "signup" && (
                    <motion.form
                      key="signup"
                      onSubmit={handleSignup}
                      className="space-y-4"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                    >
                      {[
                        {
                          id: "signup-name",
                          label: "Full Name",
                          type: "text",
                          placeholder: "John Doe",
                          icon: IconUser,
                          value: signupName,
                          onChange: setSignupName,
                          delay: 0.05,
                        },
                        {
                          id: "signup-email",
                          label: "Email",
                          type: "email",
                          placeholder: "you@example.com",
                          icon: IconMail,
                          value: signupEmail,
                          onChange: setSignupEmail,
                          delay: 0.1,
                        },
                        {
                          id: "signup-password",
                          label: "Password",
                          type: "password",
                          placeholder: "••••••••",
                          icon: IconLock,
                          value: signupPassword,
                          onChange: setSignupPassword,
                          delay: 0.15,
                        },
                        {
                          id: "signup-confirm-password",
                          label: "Confirm Password",
                          type: "password",
                          placeholder: "••••••••",
                          icon: IconLock,
                          value: signupConfirmPassword,
                          onChange: setSignupConfirmPassword,
                          delay: 0.2,
                        },
                      ].map(
                        ({
                          id,
                          label,
                          type,
                          placeholder,
                          icon: Icon,
                          value,
                          onChange,
                          delay,
                        }) => (
                          <motion.div
                            key={id}
                            className="space-y-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay }}
                          >
                            <Label htmlFor={id}>{label}</Label>
                            <div className="relative">
                              <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id={id}
                                type={type}
                                placeholder={placeholder}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                className="pl-10"
                                required
                              />
                            </div>
                          </motion.div>
                        )
                      )}

                      <motion.div
                        className="flex items-start space-x-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-600"
                          required
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          I agree to the{" "}
                          <a
                            href="#"
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="#"
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            Privacy Policy
                          </a>
                        </label>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          Create Account
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  {
                    label: "Google",
                    svg: (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "GitHub",
                    svg: (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    ),
                  },
                ].map(({ label, svg }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button variant="outline" type="button" className="w-full">
                      {svg}
                      {label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.p
        className="text-center text-sm text-gray-600 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        © 2024 WealthFino CRM. All rights reserved.
      </motion.p>
    </div>
  )
}

export default AuthPage
