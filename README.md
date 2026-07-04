# MatteoPhotographyStudio — Sito di prenotazione

Guida passo-passo per pubblicare il sito online gratis su Vercel, con notifica WhatsApp automatica ogni volta che un cliente prenota.

## Cosa cambia rispetto alla versione "artifact"

- Le prenotazioni ora vengono salvate in un database condiviso vero (Vercel KV), quindi le vedi tutte tu nel pannello admin, indipendentemente dal telefono usato dal cliente.
- La notifica WhatsApp parte dal server (non dal browser del cliente), quindi funziona davvero e la tua API key non è visibile a nessuno che apra il sito.

## Passo 1 — Crea un account Vercel

1. Vai su https://vercel.com/signup
2. Registrati (puoi usare email, Google o GitHub)

## Passo 2 — Carica il progetto

Il modo più semplice senza usare GitHub:

1. Installa Vercel CLI: da un computer con Node.js, apri il terminale nella cartella di questo progetto e lancia:
   ```
   npm install -g vercel
   vercel
   ```
2. Segui le domande a schermo (premi invio per le opzioni di default)
3. Alla fine ti darà un link tipo `https://tuo-progetto.vercel.app`

Se non hai dimestichezza con il terminale, in alternativa:
1. Crea un account GitHub (gratis) e carica questa cartella come nuovo repository
2. Su Vercel clicca "Add New Project", collega il repository GitHub, e clicca Deploy

## Passo 3 — Aggiungi il database (Vercel KV)

1. Nel progetto su Vercel, vai nella scheda **Storage**
2. Clicca **Create Database** → scegli **KV**
3. Dagli un nome (es. "bookings") e collegalo al progetto
4. Vercel aggiunge da solo le variabili `KV_REST_API_URL` e `KV_REST_API_TOKEN` — non devi fare nulla

## Passo 4 — Aggiungi le variabili per WhatsApp

1. Nel progetto su Vercel vai su **Settings → Environment Variables**
2. Aggiungi:
   - `OWNER_PHONE` = `393517318028`
   - `CALLMEBOT_APIKEY` = `4719947`
3. Salva, poi vai su **Deployments** e clicca **Redeploy** sull'ultima versione, per far leggere le nuove variabili

## Passo 5 — Prova

1. Apri il link del sito (es. `https://tuo-progetto.vercel.app`)
2. Fai una prenotazione di prova
3. Dovresti ricevere il messaggio WhatsApp entro pochi secondi

## Se qualcosa non funziona

- Controlla i log in **Deployments → (ultimo deploy) → Functions → api/bookings** per vedere eventuali errori
- Verifica che le variabili d'ambiente siano scritte esattamente come sopra, senza spazi
