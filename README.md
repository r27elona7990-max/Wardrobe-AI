# Wardrobe AI

Wardrobe AI is a full-stack digital closet and outfit-planning application. Users can upload clothing photos, organize wardrobe pieces, receive structured AI-generated clothing attributes, assemble and save outfits, review wardrobe statistics, and generate trip packing suggestions.

## Features

- Credential authentication with protected routes
- Password-reset links with hashed, expiring tokens
- AI clothing-image analysis for category, color, style, fit, aesthetic, season, and material
- User-owned cloud image storage with local development fallback
- Searchable and filterable digital closet
- Occasion- and weather-aware outfit suggestions
- Saved outfits with normalized database relationships
- Wardrobe statistics and packing-list generation
- Responsive interface with light and dark themes

## Technology

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- PostgreSQL, Prisma, and the Prisma PostgreSQL adapter
- NextAuth credential authentication
- OpenAI Responses API with Zod structured output
- Supabase Storage
- Vitest and ESLint

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` and configure:

   ```dotenv
   DATABASE_URL=
   POSTGRES_URL_NON_POOLING=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://localhost:3000
   APP_URL=http://localhost:3000
   OPENAI_API_KEY=
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   SUPABASE_STORAGE_BUCKET=clothing-items
   RESEND_API_KEY=
   EMAIL_FROM=
   ```

   Only one supported PostgreSQL connection variable is required. `POSTGRES_URL_NON_POOLING` is recommended for migrations.

3. Apply migrations and generate Prisma Client:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

## Architecture notes

- Server Actions authenticate users and validate input before mutations.
- Clothing records and storage objects are scoped by user ID.
- Submitted AI metadata is revalidated server-side with the same Zod schema used for structured model output.
- Uploads are restricted to JPEG, PNG, and WebP and checked using file signatures.
- Rate limits reduce abuse of authentication, password recovery, upload, and AI-analysis endpoints.

## Security

Never commit `.env` files, database credentials, storage service keys, or authentication secrets. Rotate any credential immediately if it is accidentally committed.
