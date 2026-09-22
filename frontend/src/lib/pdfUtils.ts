import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface DownloadPdfOptions {
  fileName?: string
  elementId?: string
}

/**
 * Captures an HTML element and downloads it as a clean, stand-alone PDF document.
 */
export async function downloadElementAsPdf(
  element: HTMLElement | null,
  fileName = 'invoice.pdf'
): Promise<void> {
  if (!element) {
    console.error('downloadElementAsPdf: element not found')
    return
  }

  // Ensure high quality scale without distorting layout
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  // Calculate proportional height
  const imgWidth = pdfWidth - 20 // 10mm margins on left and right
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // If content fits on one page, place with top margin
  if (imgHeight <= pdfHeight - 20) {
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
  } else {
    // Multi-page slicing if invoice is long
    let heightLeft = imgHeight
    let position = 10

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= (pdfHeight - 20)

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }
  }

  pdf.save(fileName)
}
