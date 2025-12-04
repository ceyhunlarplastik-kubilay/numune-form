import type { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleSheets } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { firmaAdi, ad, soyad, email, telefon, adres, sektor, uretimGrubu, urunler } = req.body;

    // Validate required fields
    if (!firmaAdi || !ad || !soyad || !email || !telefon || !adres || !sektor || !uretimGrubu || !urunler || urunler.length === 0) {
      return res.status(400).json({ error: 'Eksik bilgi' });
    }

    const { sheets, spreadsheetId } = await getGoogleSheets();

    // Save to "Response" sheet with all fields
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Response!A:I', // Changed from 'Customers' to 'Response'
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            new Date().toLocaleString('tr-TR'), // Tarih (Date)
            firmaAdi,                            // Firma Adı
            ad,                                  // Ad
            soyad,                               // Soyad
            email,                               // Email
            telefon,                             // Telefon
            adres,                               // Adres
            sektor,                              // Sektör
            uretimGrubu,                         // Üretim Grubu
            urunler.join(', '),                  // Ürünler (comma-separated)
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
