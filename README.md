# Agent Base Web App

Frontend web application for the Agent Base platform.

## Tech Stack

- **Framework**: Next.js 15
- **UI**: Tailwind CSS + Radix UI components
- **Language**: TypeScript
- **Package Manager**: pnpm

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3020](http://localhost:3020) with your browser to see the result.

## Environment Variables

Create a `.env.local` file with the following variables:

```

AGENT_BASE_API_URL=YOUR_AGENT_BASE_API_URL
AGENT_BASE_API_KEY=YOUR_AGENT_BASE_API_KEY

RESEND_API_KEY=YOUR_RESEND_API_KEY

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
```

## Building for Production

```bash
pnpm build
```

## Deployment

This project is set up to deploy to Vercel.

## Related Projects

- [Agent Base API](https://github.com/blooming-generation/agent-base) - The backend API services

## Notes

Last updated: March 18, 2025 