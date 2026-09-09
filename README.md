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
| GET | /api/quotes | No | List all quotes |
| GET | /api/quotes/random | No | Get random unused quote |
| GET | /api/quotes/tags | No | List all tags |
| GET | /api/quotes/sources | No | List all sources |
| POST | /api/quotes | Yes | Add new quote |
| PATCH | /api/quotes/:id/used | Yes | Mark as used |
| PATCH | /api/quotes/:id/unuse | Yes | Mark as unused |
| DELETE | /api/quotes/:id | Yes | Delete quote |

Auth requires `x-app-password` header.

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
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── init.js      # DB schema
│   │   │   ├── pool.js      # Connection pool
│   │   │   └── seed.js      # Seed data
│   │   ├── routes/
│   │   │   └── quotes.js    # API routes
│   │   └── index.js         # Express server
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # UI components
│   │   │   ├── services/    # API services
│   │   │   └── ...
│   │   └── environments/
│   └── package.json
├── CLAUDE.md
└── README.md
```

