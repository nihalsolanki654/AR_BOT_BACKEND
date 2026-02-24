import ExcelJS from 'exceljs';
import path from 'path';
import CustomerEmail from '../models/CustomerEmail.js';
import fs from 'fs';

const EXCEL_FILE_PATH = path.join(process.cwd(), 'customers.xlsx');

export const syncDbToExcel = async () => {
    try {
        const customers = await CustomerEmail.find().sort({ companyName: 1 });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Customers');

        worksheet.columns = [
            { header: 'Company Name', key: 'companyName', width: 30 },
            { header: 'To Email', key: 'toEmail', width: 30 },
            { header: 'CC Email', key: 'ccEmail', width: 30 }
        ];

        customers.forEach(customer => {
            worksheet.addRow({
                companyName: customer.companyName,
                toEmail: customer.toEmail || '',
                ccEmail: customer.ccEmail || ''
            });
        });

        // Style the header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
        };
        worksheet.getRow(1).lastCell.border = { bottom: { style: 'thin' } };

        await workbook.xlsx.writeFile(EXCEL_FILE_PATH);
        console.log(`Excel file updated at ${EXCEL_FILE_PATH}`);
    } catch (error) {
        console.error('Error syncing DB to Excel:', error);
    }
};

export const syncExcelToDb = async () => {
    try {
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            console.log('Excel file does not exist, skipping excel to db sync');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(EXCEL_FILE_PATH);
        const worksheet = workbook.getWorksheet(1); // Get first worksheet

        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header
                rows.push({
                    companyName: row.getCell(1).text?.trim(),
                    toEmail: row.getCell(2).text?.trim(),
                    ccEmail: row.getCell(3).text?.trim()
                });
            }
        });

        for (const rowData of rows) {
            if (rowData.companyName) {
                await CustomerEmail.findOneAndUpdate(
                    { companyName: rowData.companyName },
                    {
                        companyName: rowData.companyName,
                        toEmail: rowData.toEmail || '',
                        ccEmail: rowData.ccEmail || ''
                    },
                    { upsert: true, new: true }
                );
            }
        }
        console.log('Database updated from Excel');
    } catch (error) {
        console.error('Error syncing Excel to DB:', error);
    }
};
