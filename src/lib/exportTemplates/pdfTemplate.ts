import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (selectedMedia: any[]) => {
  const doc = new jsPDF();

  // Cover Page
  doc.setFontSize(20);
  doc.text('OOH Media Planner', 105, 30, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Media Portfolio', 105, 50, { align: 'center' });
  
  // Company Information
  doc.setFontSize(12);
  doc.text('Shraddha Advertising/Saturn Publicity', 20, 80);
  doc.text('6th Floor- 612, Shubh Universal,', 20, 87);
  doc.text('Opp. Vijya Laxmi Hall', 20, 94);
  doc.text('Nr. Reliance Market, Vesu', 20, 101);
  doc.text('Surat – Gujarat', 20, 108);
  doc.text('Email: saturnpublicitysurat@gmail.com', 20, 115);
  doc.text('Tel: 92270 29292', 20, 122);

  doc.addPage();

  // Media Pages
  selectedMedia.forEach((media, index) => {
    doc.setFontSize(14);
    doc.text(media.name, 20, 20);

    const details = [
      [`${media.width}X${media.height}) ${media.location}`, media.type],
    ];

    autoTable(doc, {
      startY: 30,
      head: [['Location & Size', 'Type']],
      body: details,
      theme: 'grid',
      styles: { fontSize: 12, cellPadding: 5 },
      columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 30 } },
    });

    if (media.thumbnail) {
      doc.addImage(media.thumbnail, 'JPEG', 20, 70, 170, 100);
    }

    if (index < selectedMedia.length - 1) {
      doc.addPage();
    }
  });

  // Save the PDF
  doc.save('OOH_Media_Portfolio.pdf');
};

