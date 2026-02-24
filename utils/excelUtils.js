import ExcelJS from 'exceljs';
import path from 'path';
import CustomerEmail from '../models/CustomerEmail.js';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCEL_FILE_PATH = path.resolve(__dirname, '..', 'output', 'customers.xlsx');

// Ensure the directory exists
const outputDir = path.dirname(EXCEL_FILE_PATH);
if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
}

let isSyncing = false;

export const syncDbToExcel = async () => {
    if (isSyncing) return;
    try {
        isSyncing = true;
        console.log('--- START syncDbToExcel ---');
        const customers = await CustomerEmail.find().sort({ companyName: 1 });
        console.log(`Successfully fetched ${customers.length} customers from DB.`);

        if (customers.length > 0) {
            console.log('Sample data from DB:', JSON.stringify(customers.slice(0, 2), null, 2));
        } else {
            console.warn('WARNING: No customers found in the database to sync.');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Customers');

        worksheet.columns = [
            { header: 'Company Name', key: 'companyName', width: 35 },
            { header: 'To Email', key: 'toEmail', width: 35 },
            { header: 'CC Email', key: 'ccEmail', width: 35 }
        ];

        customers.forEach(customer => {
            worksheet.addRow({
                companyName: customer.companyName || 'N/A',
                toEmail: customer.toEmail || '',
                ccEmail: customer.ccEmail || ''
            });
        });

        // Style the header
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F81BD' }
            };
            cell.border = {
                bottom: { style: 'thin' },
                top: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        console.log(`Attempting to write Excel file to: ${EXCEL_FILE_PATH}`);
        await workbook.xlsx.writeFile(EXCEL_FILE_PATH);
        console.log('Excel file successfully written.');
        console.log('--- END syncDbToExcel ---');
    } catch (error) {
        console.error('CRITICAL ERROR in syncDbToExcel:', error);
    } finally {
        // Small delay to let file system settle
        setTimeout(() => { isSyncing = false; }, 2000);
    }
};

export const syncExcelToDb = async () => {
    try {
        console.log('--- START syncExcelToDb ---');
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            console.warn(`Excel file not found at ${EXCEL_FILE_PATH}, skipping sync.`);
            return;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(EXCEL_FILE_PATH);
        const worksheet = workbook.getWorksheet(1);

        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header
                const getCellValue = (cell) => {
                    const val = cell.value;
                    if (val === null || val === undefined) return '';

                    if (typeof val === 'object') {
                        // Handle exceljs specific objects (hyperlinks, rich text, etc.)
                        if (val.text) return val.text.toString().trim();
                        if (val.result) return val.result.toString().trim();
                        if (Array.isArray(val.richText)) {
                            return val.richText.map(rt => rt.text).join('').trim();
                        }
                        // Fallback for other objects
                        return (val.toString ? val.toString() : '').trim();
                    }
                    return val.toString().trim();
                };

                const companyName = getCellValue(row.getCell(1));
                const toEmail = getCellValue(row.getCell(2));
                const ccEmail = getCellValue(row.getCell(3));

                if (companyName) {
                    rows.push({ companyName, toEmail, ccEmail });
                }
            }
        });

        console.log(`Found ${rows.length} valid rows in Excel.`);

        for (const rowData of rows) {
            console.log(`Updating DB for: [${rowData.companyName}] -> To: [${rowData.toEmail}], CC: [${rowData.ccEmail}]`);
            const result = await CustomerEmail.findOneAndUpdate(
                { companyName: rowData.companyName },
                {
                    companyName: rowData.companyName,
                    toEmail: rowData.toEmail || '',
                    ccEmail: rowData.ccEmail || ''
                },
                { upsert: true, new: true }
            );
            if (result) {
                console.log(`Successfully updated DB record ID: ${result._id}`);
            } else {
                console.warn(`FAILED to update DB record for: ${rowData.companyName}`);
            }
        }
        console.log('Database sync from Excel complete.');
        console.log('--- END syncExcelToDb ---');
    } catch (error) {
        console.error('CRITICAL ERROR in syncExcelToDb:', error);
    }
};

let watchTimeout = null;
export const startExcelWatcher = () => {
    if (!fs.existsSync(EXCEL_FILE_PATH)) return;

    console.log(`Real-time watcher started for: ${EXCEL_FILE_PATH}`);

    fs.watch(EXCEL_FILE_PATH, (eventType) => {
        if (isSyncing) return;

        // Debounce the watcher
        if (watchTimeout) clearTimeout(watchTimeout);

        watchTimeout = setTimeout(async () => {
            console.log('Detected Excel file change... syncing to database...');
            await syncExcelToDb();
        }, 1000); // Wait 1s after last change to ensure file is saved
    });
};
