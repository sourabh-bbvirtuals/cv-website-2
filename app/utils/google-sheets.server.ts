/**
 * Server-only module for Google Sheets integration
 * This file has .server.ts extension to ensure it's never bundled for the browser
 */

interface GoogleSheetsConfig {
  credentials: {
    client_email: string;
    private_key: string;
  };
  spreadsheetId: string;
  sheetName?: string;
}

// Google Sheets service account credentials
const GOOGLE_SHEETS_CREDENTIALS = {
  client_email: 'sheet-processor@grepvideos-server.iam.gserviceaccount.com',
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFJm9ZVOvLGXBk
wcQH6aZB96P7JSGj5NVUFM66H+GqwqG/wqIoxzmmCeVmXhjCYEX7msdCGIZPRrwf
kkLd+kuNm2RPfRREEAZrenLV/4g3i4eA+uN5d0CyN7CV1MF1++QlL82k/rX/4W2G
C3hEL0JeOz0KUzcCNRjhgAfiJ0inEdWQtY8KT5sQEhuIlyP/6w9xTFxpo8++EmJl
UyOOYaWtDARC6fEfGTn/usIP6Bx/29DAj+PeYJacCYRMNj8UclDh5CyTs2MJBvZG
SvvFpHvP2jPDe7cLph/yXCEQcDdXda0LTh+csyCgAsESWeujwWfFKpi6njic6OvT
Jkd0mgXNAgMBAAECggEAEBgRIvPBw/Sxrif7PsIeJmh25HulgWGe4JxKO/t6SpxU
4/iZkEajOCC6r16jGssNK3r5JTYnULVvigxAlSpnnInA6JRHYT8FpyR512pizlX/
m9HfW/0WNPZC3hheKqmDeF2spfl9FgRrEnRBPx+0hUjEtOESLoXzIAV5n0ahsbGo
DIOcruN+nOIwRmFt2SoiWxRfKr6CQ8cnJ7wUdBrn0+etSvTnGToV00FKN680z9An
uoMElc5W+mT6RO1CCWqGY406SpqtFN1/+sLUj9opZ98oQqWocbU4XPA4w4xi/8Vv
aHOFoyspaIWUBbHNN8e6BrqUSF0IvKTaujVXJMlLwQKBgQD+fOWYCHV3Iwbfeo5T
5Mbxn94mnBgpI+B4skmLcgC1eMIcq0Sk5OrlMFVbeXiFPHwp8JRggBzJn5kpSx8x
lDwN2W41oRAb8A6ob6lkwAJbarzu7mS478Rxqp/9BFdO7KiHkWRKSUJ3qBhzCmb2
5MxlvVf9tCRsLJROnkyL7VAHqQKBgQDGUlJAk8mboTXcnR8Zq+/7f8NGyMamZa7a
iUC1e3C7bysgmYzkMbPhI6e/KPtKXdYmu4/9D3Vulv9+CQ5MP5ZCXAasBaLQc0in
BOll5Q9z2DcykBflvEraS4j0frEkUYP5dY/3REf1o9e2eb7yX5f+8kLQeh19gDyH
DHYjjKCThQKBgQC6h4kxmmGe5UmQXCAeVb2MNQV7f0YmQWmyjdtiHjluyghdQxuZ
UUDqpDasSaiQ3/iSNQhMgxqWniiBH9LJYEF0VT52iItqLtZPlyit9B7GKsI4zvt8
oiF2vv1tUtU7wDL2yxabbH8PfWIOUD2QEbvPhq0MBBH+R96ckWLB3TufoQKBgHZ3
PkLtBQU+K1p5UNaY6mWlUBS8Yk2LeAN68Xh3IEQWiACVOKAnQHhAQDfkVxd5Li88
4yobTd6dvEihSDUr1qoVJrcjNrql4sRCHtmLFsvwYCiIAn5tF5mGfWzvMQms19Tv
8OuXkhSdpoGOAA3wJG9ab6bxCySosX9KZled7V2xAoGAEXZ1pR4eJvR4DDfMmJcC
EzXTdNmUYDNaa8w822LPQq38Y5SZCbNyrngdobMluIK0cuduQplC+rsdicqKjhON
smg5w/FPMK1dKcG/v/XRprTbZ3JSk/fh3ahOh77jUVUcnAdoj191JxzB0vpU9BcJ
zDqVQxdFvhfXxGYyxNtNti8=
-----END PRIVATE KEY-----`,
};

// Default spreadsheet configuration
const DEFAULT_SPREADSHEET_ID = '1-Em16IgnAbf_8MripFkZ-4iZaHmYhigdypcHCclg-EI';
const DEFAULT_SHEET_NAME = 'Leads';
const DEFAULT_SHEET_ID = 0; // gid from URL - use this if sheet name doesn't work

/**
 * Append a row to Google Sheets
 * 
 * @param mobile Mobile number to add
 * @param config Google Sheets configuration (optional)
 *   - spreadsheetId: The ID of the Google Spreadsheet (required if not set in DEFAULT_SPREADSHEET_ID)
 *   - sheetName: Sheet name, defaults to 'Leads'
 * @returns Success status
 */
export async function appendToGoogleSheets(
  mobile: string,
  attempt: string,
  sellerSku: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Import googleapis (server-side only - this file has .server.ts extension)
    // Using dynamic import to ensure it's only loaded on the server
    let google: any;
    try {
      const googleapis = await import('googleapis');
      google = googleapis.google;
    } catch (importError) {
      console.error('googleapis package not installed. Please run: yarn add googleapis');
      return {
        success: false,
        error: 'Google Sheets API package not installed',
      };
    }

    // Use credentials directly
    const credentials = GOOGLE_SHEETS_CREDENTIALS;
    const spreadsheetId = DEFAULT_SPREADSHEET_ID;
    const sheetName = DEFAULT_SHEET_NAME;
    const sheetId = DEFAULT_SHEET_ID;

    if (!credentials.client_email || !credentials.private_key || !spreadsheetId) {
      console.error('Google Sheets credentials or spreadsheet ID not configured');
      return {
        success: false,
        error: 'Google Sheets configuration is missing',
      };
    }

    // Authenticate with Google Sheets API
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // First, get spreadsheet metadata to find the correct sheet name/ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetsList = spreadsheet.data.sheets || [];
    console.log('Available sheets in spreadsheet:', sheetsList.map((s: any) => ({
      id: s.properties?.sheetId,
      title: s.properties?.title,
      index: s.properties?.index
    })));

    // Find the sheet by name or use the first sheet if not found
    const targetSheet = sheetsList.find(
      (s: any) => s.properties?.title?.toLowerCase() === sheetName.toLowerCase()
    ) || sheetsList[0];

    if (!targetSheet || !targetSheet.properties) {
      return {
        success: false,
        error: `Sheet "${sheetName}" not found in spreadsheet`,
      };
    }

    const actualSheetName = targetSheet.properties.title || sheetName;
    console.log(`Using sheet: "${actualSheetName}" (ID: ${targetSheet.properties.sheetId})`);

    // Get current timestamp in Indian Standard Time (IST = UTC+5:30)
    // Format: YYYY-MM-DD HH:MM:SS IST
    const now = new Date();
    
    // Use Intl.DateTimeFormat to get IST time
    const istFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = istFormatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    const second = parts.find(p => p.type === 'second')?.value;
    
    const timestamp = `${year}-${month}-${day} ${hour}:${minute}:${second} IST`;

    // Append data using the actual sheet name
    // Use A1:A format for append (full column A, which allows appending)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${actualSheetName}!A:A`, // Column range format
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[mobile, attempt, timestamp, sellerSku]],
      },
    });

    console.log(`Successfully added mobile number to Google Sheets in sheet: ${actualSheetName}`, mobile);
    return { success: true };

  } catch (error: any) {
    console.error('Error appending to Google Sheets:', error);
    const errorDetails = error?.response?.data?.error || error?.cause || {};
    console.error('Error details:', JSON.stringify(errorDetails, null, 2));
    return {
      success: false,
      error: error.message || errorDetails.message || 'Failed to update Google Sheets',
    };
  }
}

