import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { date } = req.query;
      const pattern = date ? `booking:${date}:*` : "booking:*";
      const keys = await kv.keys(pattern);
      const bookings = [];
      for (const key of keys) {
        const value = await kv.get(key);
        if (value) bookings.push({ key, ...value });
      }
      bookings.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      return res.status(200).json({ bookings });
    }

    if (req.method === "POST") {
      const { service, name, phone, date, time } = req.body || {};
      if (!service || !name || !phone || !date || !time) {
        return res.status(400).json({ error: "Dati mancanti" });
      }

      const key = `booking:${date}:${time}`;
      const existing = await kv.get(key);
      if (existing) {
        return res.status(409).json({ error: "Questo orario è già stato prenotato" });
      }

      const booking = {
        service,
        name,
        phone,
        date,
        time,
        createdAt: new Date().toISOString(),
      };
      await kv.set(key, booking);

      try {
        const ownerPhone = process.env.OWNER_PHONE;
        const apikey = process.env.CALLMEBOT_APIKEY;
        if (ownerPhone && apikey) {
          const text =
            `Nuova prenotazione!\n` +
            `Servizio: ${service}\n` +
            `Data: ${date} - ${time}\n` +
            `Cliente: ${name}\n` +
            `Telefono: ${phone}`;
          const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
            ownerPhone
          )}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
          await fetch(url);
        }
      } catch (notifyErr) {
        console.error("Notifica WhatsApp non riuscita:", notifyErr);
      }

      return res.status(200).json({ ok: true, booking });
    }

    if (req.method === "DELETE") {
      const { key } = req.body || {};
      if (!key) return res.status(400).json({ error: "Chiave mancante" });
      await kv.del(key);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ error: "Metodo non permesso" });
  } catch (err) {
    console.error("Errore API bookings:", err);
    return res.status(500).json({ error: "Errore del server" });
  }
}
