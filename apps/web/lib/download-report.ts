import { jsPDF } from "jspdf"

export async function downloadHtmlAsPdf(url: string, filename: string) {
  const res = await fetch(url)
  const html = await res.text()

  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.left = "-9999px"
  iframe.style.top = "0"
  iframe.style.width = "820px"
  iframe.style.height = "1px"
  iframe.style.border = "none"
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument!
  doc.open()
  doc.write(html)
  doc.close()

  await new Promise<void>((resolve) => {
    if (doc.readyState === "complete") resolve()
    else doc.addEventListener("readystatechange", () => {
      if (doc.readyState === "complete") resolve()
    })
  })

  await doc.fonts.ready

  const imgs = doc.querySelectorAll("img")
  await Promise.all(
    Array.from(imgs).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve()
          else { img.onload = () => resolve(); img.onerror = () => resolve() }
        }),
    ),
  )

  const { default: html2canvas } = await import("html2canvas")

  const canvas = await html2canvas(doc.body, {
    scale: 2,
    useCORS: true,
    logging: false,
    width: 820,
  })

  document.body.removeChild(iframe)

  const imgData = canvas.toDataURL("image/png")
  const imgWidth = 210
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const pdf = new jsPDF("p", "mm", "a4")
  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
  heightLeft -= 297

  while (heightLeft > 0) {
    position -= 297
    pdf.addPage()
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= 297
  }

  pdf.save(filename)
}
