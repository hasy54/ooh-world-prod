import pptxgen from 'pptxgenjs';

export const generatePPT = (selectedMedia: any[]) => {
  const pres = new pptxgen();

  // Title slide
  const slide1 = pres.addSlide();
  slide1.addText("OOH Media Portfolio", { x: 1, y: 1, w: '80%', h: 1, fontSize: 24, color: '363636', bold: true });
  slide1.addText("Shraddha Advertising/Saturn Publicity", { x: 1, y: 2, w: '80%', h: 0.5, fontSize: 14 });
  slide1.addText("Email: saturnpublicitysurat@gmail.com | Tel: 92270 29292", { x: 1, y: 2.5, w: '80%', h: 0.5, fontSize: 12 });

  // Media slides
  selectedMedia.forEach((media) => {
    const slide = pres.addSlide();
    slide.addText(`${media.width}X${media.height}) ${media.location}`, { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 18, color: '363636', bold: true });
    slide.addText(`Type: ${media.type}`, { x: 0.5, y: 1.1, w: '90%', h: 0.3, fontSize: 14 });
    slide.addText(`Price: $${media.price}`, { x: 0.5, y: 1.5, w: '90%', h: 0.3, fontSize: 14 });
    slide.addText(`Availability: ${media.availability}`, { x: 0.5, y: 1.9, w: '90%', h: 0.3, fontSize: 14 });

    if (media.thumbnail) {
      slide.addImage({ path: media.thumbnail, x: 0.5, y: 2.3, w: 9, h: 5 });
    }
  });

  pres.writeFile({ fileName: 'OOH_Media_Portfolio.pptx' });
};

