import ExcelJS from 'exceljs';

export async function exportToExcel(
  content: any,
  options: {
    clientName: string;
    campaignName: string;
    logoPath: string;
    hiddenFields: string[];
  } = {
    clientName: '',
    campaignName: '',
    logoPath: '',
    hiddenFields: [],
  }
) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Media');

    // ---------------------------------------
    // 1) Merge Cells (A1:D4) for the Logo
    // ---------------------------------------
    worksheet.mergeCells('A1:D4'); 
    // Optionally adjust row heights or column widths
    // e.g. to make the merged region roughly match your logo's aspect ratio
    worksheet.getRow(1).height = 30; // example
    worksheet.getRow(2).height = 30; // example
    worksheet.getRow(3).height = 30; // example
    worksheet.getRow(4).height = 30; // example

    // ---------------------------------------
    // 2) Fetch and Insert the Logo in A1:D4
    // ---------------------------------------
    if (options.logoPath) {
      try {
        const response = await fetch(options.logoPath);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const logoImageId = workbook.addImage({
          buffer: uint8Array as any,
          extension: 'png', // or 'jpg'
        });
        
        worksheet.addImage(logoImageId, 'A1:D4');
      } catch (imageError) {
        console.error('Error adding company logo:', imageError);
      }
    }

    // ---------------------------------------
    // 3) Put "CLIENT / CAMPAIGN / GENERATED ON" Below the Image
    //    (e.g. row 5+)
    // ---------------------------------------
    worksheet.getCell('A5').value = 'CLIENT';
    worksheet.getCell('A5').font = { bold: true };
    worksheet.getCell('B5').value = options.clientName;

    worksheet.getCell('A6').value = 'CAMPAIGN';
    worksheet.getCell('A6').font = { bold: true };
    worksheet.getCell('B6').value = options.campaignName;

    worksheet.getCell('A7').value = 'GENERATED ON';
    worksheet.getCell('A7').font = { bold: true };
    worksheet.getCell('B7').value = new Date().toLocaleDateString();

    // ---------------------------------------
    // 4) Add a Blank Row for Spacing
    // ---------------------------------------
    worksheet.addRow([]);

    // ---------------------------------------
    // 5) Table Header (say, at row 9)
    // ---------------------------------------
    const allColumns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Sub-Type', key: 'subtype', width: 15 },
      { header: 'Dimensions', key: 'dimensions', width: 15 },
      { header: 'Traffic', key: 'traffic', width: 15 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Availability', key: 'availability', width: 15 },
    ];
    const visibleColumns = allColumns.filter(
      (col) => options.hiddenFields ? !options.hiddenFields.includes(col.key) : true
    );

    const headerRowNumber = 9;
    const headerRow = worksheet.getRow(headerRowNumber);

    visibleColumns.forEach((col, index) => {
      headerRow.getCell(index + 1).value = col.header;
      headerRow.getCell(index + 1).font = { bold: true };
      headerRow.getCell(index + 1).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      headerRow.getCell(index + 1).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      // Set column width
      worksheet.getColumn(index + 1).width = col.width;
    });
    headerRow.height = 20;

    // ---------------------------------------
    // 6) Table Data (starting row 10)
    // ---------------------------------------
    let dataRowIndex = 10;
    content.forEach((slide: { type: string; content: { name: string; details: { label: string; value: string; }[]; } }) => {
      if (slide.type === 'media') {
        const row = worksheet.getRow(dataRowIndex);
        visibleColumns.forEach((col, colIdx) => {
          let value = '';
          if (col.key === 'name') {
            value = slide.content.name;
          } else {
            const detail = slide.content.details.find(
              (d) => d.label.toLowerCase() === col.key
            );
            value = detail ? detail.value : '';
          }
          row.getCell(colIdx + 1).value = value;
          row.getCell(colIdx + 1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
        dataRowIndex++;
      }
    });

    // ---------------------------------------
    // 7) "Made with Studiooh" after data
    // ---------------------------------------
    const madeWithRow = worksheet.getRow(dataRowIndex + 1);
    madeWithRow.getCell(1).value = 'Made with Studiooh';
    madeWithRow.getCell(1).font = { italic: true, color: { argb: 'FF555555' } };

    // ---------------------------------------
    // 8) Generate & Download the Excel
    // ---------------------------------------
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'Media_Export.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error: unknown) {
    console.error('Error in exportToExcel:', error);
    throw new Error(`Failed to export Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
