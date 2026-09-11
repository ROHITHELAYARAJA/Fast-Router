# Fast-Router Application Core

> Fast-Router web dashboard, AI runtime engine, and OpenAI-compatible API gateway.

For complete documentation, see the [Root README](../README.md) and [AGENTS.md](./AGENTS.md).

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server (Port 20200)
npm run dev

# 4. Open dashboard
# Browser: http://localhost:20200
# Default password: 123456
```

## Available Scripts

- `npm run dev`: Starts Next.js development server on port 20200
- `npm run build`: Production build with Webpack
- `npm run start`: Starts production server using custom-server.js
- `npm run cli:pack`: Builds and packs the CLI distribution
