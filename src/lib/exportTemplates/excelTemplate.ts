import * as XLSX from 'xlsx';

export const generateExcel = (selectedMedia: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(selectedMedia.map(media => ({
    'Location & Size': `${media.width}X${media.height}) ${media.location}`,
    'Type': media.type,
    'Price': media.price,
    'Availability': media.availability
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Media List");

  XLSX.writeFile(workbook, 'OOH_Media_List.xlsx');
};

