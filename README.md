# Quote Keeper

A web app to store and manage quotes from movies, TV shows, comedians, and other sources. Built for a weekly release messages.

## Features

- **Random Quote** - Get a random unused quote with one click
- **Quote Library** - Browse, filter, and sort all quotes
- **Add Quotes** - Submit new quotes via form
- **Copy to Clipboard** - One-click copy formatted quotes
- **Mark as Used** - Track which quotes have been used
- **Tags & Filtering** - Organize quotes by source, speaker, or tags
- **Password Protection** - Add/delete/mark actions require password

## JSON template for bulk uploads
Use this to create a big json file of quotes and send it to me (Alanna). image_url is not done yet so leave it null.

```
[
  {
    "source": "Airplane",
    "quote": "Surely you can't be serious.",
    "speaker_1": null,
    "speaker_2": null,
    "speaker_3": null,
    "contributor": null,
    "tags": [],
    "notes": null,
    "image_url": null,
    "next_up": false,
    "used": false
  }
]
  ```

## Tech Stack

- **Frontend**: Angular 18
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Railway)
- **Hosting**: Vercel (frontend) + Railway (backend/db)

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL (or Railway connection)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and APP_PASSWORD
npm run db:test   # Test database connection & check quote count
npm run db:init   # Create tables (if starting fresh)
npm run db:seed   # Optional: load starter quotes
npm run dev       # Start server on port 3000
```

#### Adding quotes to the seed
cd ~/Sites/quote-keeper/backend
##### Export current railway database to JSON
npm run db:export

##### Import quotes
Quotes file: backend/data/quotes.json

Edit that file to add more quotes, then run npm run db:reseed to reload.

### Frontend Setup

```bash
cd frontend
npm install
npm start         # Start Angular dev server on port 4200
```

Visit `http://localhost:4200`

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:pass@host:port/db
APP_PASSWORD=your-secret-password
PORT=3000
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/quotes | No | List all active quotes (use `?deleted=true` for trash) |
| GET | /api/quotes/random | No | Get random unused quote |
| GET | /api/quotes/tags | No | List all tags |
| GET | /api/quotes/sources | No | List all sources |
| GET | /api/quotes/backup/download | No | Download full JSON backup file |
| POST | /api/quotes | Yes | Add new quote |
| POST | /api/quotes/bulk | Yes | Bulk import array of quotes from JSON |
| PATCH | /api/quotes/:id | Yes | Update quote |
| PATCH | /api/quotes/:id/used | Yes | Mark as used |
| PATCH | /api/quotes/:id/unuse | Yes | Mark as unused |
| PATCH | /api/quotes/:id/nextup | Yes | Toggle next up |
| PATCH | /api/quotes/:id/restore | Yes | Restore soft-deleted quote |
| DELETE | /api/quotes/:id | Yes | Soft-delete quote |

Auth requires `x-app-password` header.

## Database Backups & Safety

- **Soft Deletes**: Quotes deleted via the UI/API are flagged with `deleted_at` rather than destroyed. They can be restored with `PATCH /api/quotes/:id/restore`.
- **Manual Backups**: Run `npm run db:backup` inside `backend/` to create a timestamped backup in `backend/backups/`.
- **One-Click Backup Download**: Visit `/api/quotes/backup/download` to download the current JSON backup directly.
- **Automated GitHub Actions Backup**: A GitHub Actions workflow runs daily (`.github/workflows/db-backup.yml`) to automatically snapshot the database into `backend/backups/`. Add `DATABASE_URL` to your GitHub Repository Secrets to enable it.

## Deployment

### Railway (Backend + Database)

1. Create new Railway project
2. Add PostgreSQL database
3. Deploy backend from `backend/` directory
4. Set environment variables

### Vercel (Frontend)

1. Import frontend from GitHub
2. Set `apiUrl` in environment.prod.ts to Railway backend URL
3. Deploy

## Project Structure

```
quote-keeper/
├── .github/
│   └── workflows/
│       └── db-backup.yml    # Daily automated backup workflow
├── backend/
│   ├── backups/             # Timestamped JSON backups
│   ├── data/
│   │   └── quotes.json      # Complete seed & export JSON file
│   ├── src/
│   │   ├── db/
│   │   │   ├── init.js      # DB schema & migrations
│   │   │   ├── pool.js      # PostgreSQL connection pool
│   │   │   ├── export.js    # DB export script
│   │   │   ├── backup.js    # Timestamped backup script
│   │   │   ├── seed.js      # Initial seed
│   │   │   └── reseed.js    # Reseed database from quotes.json
│   │   ├── routes/
│   │   │   └── quotes.js    # API routes (quotes, upload, bulk, backup)
│   │   └── index.js         # Express server entry point
│   ├── uploads/             # Image uploads directory
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # UI components
│   │   │   ├── services/    # API & auth services
│   │   │   └── ...
│   │   └── environments/
│   └── package.json
├── CLAUDE.md
└── README.md
```

