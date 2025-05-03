# Agent Base Web App

Frontend web application for the Agent Base platform.

## Tech Stack

- **Framework**: Next.js 15
- **UI**: Tailwind CSS + Radix UI components
- **Language**: TypeScript
- **Package Manager**: npm

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3020](http://localhost:3020) with your browser to see the result.

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3002
NEXT_PUBLIC_WEB_GATEWAY_URL=http://localhost:3030
WEB_GATEWAY_API_KEY=g4t3way-k3y-e5e821f89a2d4c3b
```

## Building for Production

```bash
npm run build
```

## Deployment

This project is set up to deploy to Vercel.

## Related Projects

- [Agent Base API](https://github.com/blooming-generation/agent-base) - The backend API services

## Notes

Last updated: March 18, 2025 