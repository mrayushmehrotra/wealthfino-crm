"use client"

import { atom } from "jotai"

export const calendarMonthState = atom<number>(new Date().getMonth())
export const calendarYearState = atom<number>(new Date().getFullYear())
export const calendarSelectedEmployeeIdState = atom<string>("")
export const calendarSelectedDayState = atom<number | null>(null)
