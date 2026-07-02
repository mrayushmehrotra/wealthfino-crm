import { jsPDF } from "jspdf"

export async function downloadHtmlAsPdf(url: string, filename: string) {
  const res = await fetch(url)
  const html = await res.text()

  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = "820px"
  container.style.background = "#fff"
  container.innerHTML = html
  document.body.appendChild(container)

  await document.fonts.ready

  const imgs = container.querySelectorAll("img")
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

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    width: 820,
  })

  document.body.removeChild(container)

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
