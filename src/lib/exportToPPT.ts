import pptxgen from 'pptxgenjs';

interface ExportOptions {
  clientName: string;
  campaignName: string;
  bgColor: string;
  fontColor: string;
  logoPath: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

export async function exportToPPT(content: any[], options: ExportOptions, onProgress: (progress: number) => void) {
  const pptx = new pptxgen();

  // Set default slide size to 16:9 in inches
  pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
  pptx.layout = 'LAYOUT_16x9';

  // Set global defaults
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: options.bgColor },
  });

  content.forEach((slide, index) => {
    let pptSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

    switch (slide.type) {
      case 'title':
        
        if (options.logoPath) {
          pptSlide.addImage({ 
            path: options.logoPath, 
            x: 0.5, 
            y: 0.5, 
            w: 2.6, // Adjust this dynamically if needed 
            h: 1.5, // Set a fixed height
            sizing: { type: "cover", w: 2.6, h: 1.5 } // Include required w,h properties
          });
                    
        }
        pptSlide.addText(slide.content.title, {
          x: 0.5,
          y: 3,
          w: 9,
          fontSize: 45,
          color: '#16161D',
          fontFace: 'Inter',
          bold: false,
        });
        pptSlide.addText(`Client: ${slide.content.clientName}`, {
          x: 0.5,
          y: 3.73,
          fontSize: 14,
          color: '#16161D',
          fontFace: 'Inter',
          bold: false,
          charSpacing: 1,
        });
        pptSlide.addText(`Campaign: ${slide.content.campaignName}`, {
          x: 0.5,
          y: 4.02,
          fontSize: 14,
          color: '#16161D',
          fontFace: 'Inter',
          bold: false,
          charSpacing: 1,
        });
        pptSlide.addText(`Generated on: ${slide.content.date}`, {
          x: 0.5,
          y: 4.31,
          fontSize: 14,
          color: '#16161D',
          fontFace: 'Inter',
          bold: false,
          charSpacing: 1,
        });
        break;

      case 'media':
        pptSlide.addText(slide.content.name, {
          x: 0.5,
          y: 1,
          w: 3,
          fontSize: 16,
          color: '#16161D',
          fontFace: 'Inter',
          bold: false,
        });
        pptSlide.addImage({ path: slide.content.image, x: 3.78, y: 0, w: 6.22, h: 5.625, sizing: { type: 'contain', w: 6.22, h: 5.625 } });

        let detailsText = slide.content.details
          .map((detail: { label: string; value: string }) => `${detail.label}: ${detail.value}`)
          .join('\n');

        pptSlide.addText(detailsText, {
          x: 0.5,
          y: 3,
          w: 3,
          fontSize: 10,
          color: '#16161D',
          fontFace: 'Inter',
          bold: false,
          charSpacing: 1,
        });
        break;

      case 'closing':
        if (options.logoPath) {
          pptSlide.addImage({ path: options.logoPath, x: 0.5, y: 2.03, w: 2.6, h: 2.6, sizing: { type: 'contain', w: 2.6, h: 2.6 } });
        }
        let contactText = '';
        if (options.contactInfo.email) contactText += `Email: ${options.contactInfo.email}\n`;
        if (options.contactInfo.phone) contactText += `Phone: ${options.contactInfo.phone}\n`;
        if (options.contactInfo.address) contactText += `Address: ${options.contactInfo.address}`;

        if (contactText) {
          pptSlide.addText(contactText.trim(), {
            x: 4.1,
            y: 2,
            w: 5,
            fontSize: 8,
            color: '#16161D',
            fontFace: 'Inter',
            bold: false,
            charSpacing: 1,
          });
        }
        break;
    }

    // Add the image to ensure it is above all elements
    pptSlide.addImage({ 
      path: 'https://tediivvdgaylrrnvvbde.supabase.co/storage/v1/object/public/logos/Made%20with%20Studiooh.svg', 
      x: 8.48, 
      y: 4.96, 
      w: 1.25,
      h: 0.27
    });

    onProgress(Math.round(((index + 1) / content.length) * 100));
  });

  // Save the presentation
  await pptx.writeFile({ fileName: 'Media_Presentation.pptx' });
}
