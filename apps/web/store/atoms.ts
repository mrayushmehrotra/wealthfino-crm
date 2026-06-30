import { atom } from "recoil"

export const calendarMonthState = atom<number>({
  key: "calendarMonthState",
  default: new Date().getMonth(),
})

export const calendarYearState = atom<number>({
  key: "calendarYearState",
  default: new Date().getFullYear(),
})

export const calendarSelectedEmployeeIdState = atom<string>({
  key: "calendarSelectedEmployeeIdState",
  default: "",
})

export const calendarSelectedDayState = atom<number | null>({
  key: "calendarSelectedDayState",
  default: null,
})
