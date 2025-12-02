import type { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleSheets } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheets();
    const range = 'Products!A2:C';

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = response.data.values || [];

    const combos: Record<string, string[]> = {};
    for (const [kategori, urunGrubu, parca] of rows) {
      if (!kategori || !urunGrubu || !parca) continue; // Skip incomplete rows
      const key = `${kategori}__${urunGrubu}`;
      if (!combos[key]) combos[key] = [];
      combos[key].push(parca);
    }

    res.status(200).json(combos);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}