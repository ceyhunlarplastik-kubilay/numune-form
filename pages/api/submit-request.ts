import type { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleSheets } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { ad, soyad, email, kategori, urunGrubu, parcalar } = req.body;

    if (!ad || !soyad || !email || !kategori || !urunGrubu || !parcalar || parcalar.length === 0) {
      return res.status(400).json({ error: 'Eksik bilgi' });
    }

    const { sheets, spreadsheetId } = await getGoogleSheets();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Customers!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            ad,
            soyad,
            email,
            kategori,
            urunGrubu,
            parcalar.join(', '),
            new Date().toLocaleString('tr-TR'),
          ],
        ],
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
