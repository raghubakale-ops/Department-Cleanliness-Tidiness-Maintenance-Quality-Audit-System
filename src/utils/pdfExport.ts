import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReportToPdf(
  element: HTMLElement,
  filename: string,
  onProgress?: (status: string) => void
): Promise<boolean> {
  try {
    if (onProgress) onProgress('Preparing document...');

    // Temporarily ensure background is white and element is fully expanded
    const originalBackground = element.style.backgroundColor;
    element.style.backgroundColor = '#ffffff';

    if (onProgress) onProgress('Rendering high-resolution pages...');

    const canvas = await html2canvas(element, {
      scale: 2, // 2x retina scale for crisp text and signatures
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024 // standard desktop A4 render width
    });

    element.style.backgroundColor = originalBackground;

    if (onProgress) onProgress('Generating PDF file...');

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210; // A4 width mm
    const pageHeight = 297; // A4 height mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Multi-page support
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    if (onProgress) onProgress('Downloading PDF...');
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return false;
  }
}
