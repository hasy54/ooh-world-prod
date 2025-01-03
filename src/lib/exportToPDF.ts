import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Media } from '@/components/columns'

interface ExportOptions {
  clientName: string;
  campaignName: string;
  bgColor: string;
  fontColor: string;
  logoPath: string;
  hiddenFields: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

export async function exportToPDF(content: any[], options: ExportOptions): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 10;

  const addPage = () => {
    pdf.addPage();
    addFooter();
  };

  const addLogo = () => {
    if (options.logoPath) {
      try {
        pdf.addImage(options.logoPath, 'PNG', margin, margin, 50, 30);
      } catch (error) {
        console.error('Error adding logo:', error);
        pdf.setFontSize(12);
        pdf.text('Company Logo', margin, margin + 10);
      }
    }
  };

  const addFooter = () => {
    const footerText = 'Made with Studiooh';
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    const textWidth = pdf.getStringUnitWidth(footerText) * 10 / pdf.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    pdf.text(footerText, x, pageHeight - 10);
  };

  // Title slide
  addLogo();
  pdf.setFontSize(24);
  pdf.setTextColor(options.fontColor);
  pdf.text('Media Presentation', margin, 60);
  pdf.setFontSize(14);
  pdf.text(`Client: ${options.clientName}`, margin, 70);
  pdf.text(`Campaign: ${options.campaignName}`, margin, 80);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 90);
  addFooter();

  // Media slides
  content.forEach((slide, index) => {
    if (slide.type === 'media') {
      addPage();
      addLogo();

      pdf.setFontSize(18);
      pdf.setTextColor(options.fontColor);
      pdf.text(slide.content.name, margin, 50);

      const imageWidth = 158; // Maintain the same width as in PPT (6.22 inches * 25.4 mm/inch)
      const imageHeight = 89; // Adjusted for 16:9 aspect ratio
      const imageX = pageWidth - imageWidth - margin;
      const imageY = 60;

      if (Array.isArray(slide.content.image_urls) && slide.content.image_urls.length > 0) {
        try {
          pdf.addImage(slide.content.image_urls[0], 'JPEG', imageX, imageY, imageWidth, imageHeight);
        } catch (error) {
          console.error('Error adding media image:', error);
          pdf.setFontSize(12);
          pdf.text('Media Image', imageX, imageY + 20);
        }
      } else if (slide.content.image) {
        try {
          pdf.addImage(slide.content.image, 'JPEG', imageX, imageY, imageWidth, imageHeight);
        } catch (error) {
          console.error('Error adding media image:', error);
          pdf.setFontSize(12);
          pdf.text('Media Image', imageX, imageY + 20);
        }
      }

      const details = slide.content.details.filter((detail: any) => 
        !options.hiddenFields.includes(detail.label.toLowerCase())
      );

      (pdf as any).autoTable({
        startY: 60,
        head: [['Property', 'Value']],
        body: details.map((detail: any) => [detail.label, detail.value]),
        theme: 'grid',
        headStyles: { fillColor: options.bgColor, textColor: options.fontColor },
        styles: { textColor: options.fontColor },
        margin: { left: margin, right: imageX - 5 },
        tableWidth: imageX - margin - 5,
      });
    }
  });

  // Closing slide
  addPage();
  addLogo();
  pdf.setFontSize(24);
  pdf.setTextColor(options.fontColor);
  pdf.text('Thank You!', margin, 60);
  pdf.setFontSize(14);
  let yPos = 80;
  if (options.contactInfo.email) {
    pdf.text(`Email: ${options.contactInfo.email}`, margin, yPos);
    yPos += 10;
  }
  if (options.contactInfo.phone) {
    pdf.text(`Phone: ${options.contactInfo.phone}`, margin, yPos);
    yPos += 10;
  }
  if (options.contactInfo.address) {
    pdf.text(`Address: ${options.contactInfo.address}`, margin, yPos);
  }

  // Save the PDF
  pdf.save('Media_Presentation.pdf');
}

