# Personal Finance Tracker

A resume-ready full-stack personal finance web app for tracking expenses, viewing spending dashboards, and generating cost-conscious AI spending insights with the OpenAI API.

## Tech Stack

- Frontend: React, Vite, Chart.js, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT, bcrypt password hashing
- AI: Official OpenAI Node.js SDK
- Deployment target: Vercel frontend, Render backend

## Features

- User signup and login
- Secure JWT-protected API routes
- Add, edit, delete, and filter expenses
- Dashboard with total expenses, highest category, recent transactions, spending by category, and monthly spending chart
- Financial snapshot panel that brings key spending and planning information onto one dashboard page
- Budget calculator with income, savings goal, remaining balance, and 50/30/20 guide outputs
- Emergency fund calculator with target fund, remaining amount, and estimated time to goal
- AI insight generation through `POST /api/insights/generate` using expenses, budget inputs, and emergency fund progress
- Latest AI insight stored in MongoDB per user
- Cost-conscious AI behavior: short summarized prompt, manual button click only, configurable model through `.env`
- Responsive modern UI with basic validation and error states

## Project Structure

```text
Personal Finance Tracker/
  client/   React + Vite frontend
  server/   Express + MongoDB backend
```

## Local Setup

1. Install dependencies from the project root:

```bash
npm run install:all
```

2. Create the backend environment file:

```bash
cp server/.env.example server/.env
```

3. Update `server/.env`:

```bash
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/personal_finance_tracker
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.4-mini
```

4. Create the frontend environment file:

```bash
cp client/.env.example client/.env
```

5. Start MongoDB locally.

6. Start the backend:

```bash
npm run dev:server
```

7. In another terminal, start the frontend:

```bash
npm run dev:client
```

8. Open `http://localhost:5173`.

## AI Implementation

The frontend only calls the AI endpoint when the user clicks **Generate AI Insights**. The backend fetches the authenticated user's expenses, combines them with compact budget and emergency fund calculator summaries, sends a short prompt to OpenAI, and stores the generated result in the `Insight` collection. The API key stays in `server/.env` and is never exposed to React.

OpenAI model selection is controlled by:

```bash
OPENAI_MODEL=gpt-5.4-mini
```

The route is:

```http
POST /api/insights/generate
```

## Deployment Guide

### Backend on Render

1. Create a new Render Web Service connected to this repository.
2. Set the root directory to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `server/.env.example`.
6. Set `CLIENT_URL` to your Vercel frontend URL.
7. Use MongoDB Atlas for `MONGO_URI` in production.

### Frontend on Vercel

1. Create a new Vercel project connected to this repository.
2. Set the root directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL=https://your-render-api.onrender.com/api`.

## Screenshots

Add screenshots here after running the app locally:

- Login page
- Dashboard
- Budget and emergency fund calculators
- Expense table
- AI insights card

## Resume Bullets

- Built a full-stack personal finance tracker with React, Vite, Express, MongoDB, and JWT authentication to support secure multi-user expense management.
- Designed RESTful CRUD APIs for expenses with category and date-range filtering, server-side validation, and protected routes using reusable auth middleware.
- Integrated the official OpenAI Node.js SDK to generate personalized financial insights from summarized expense, budget, and emergency fund data while keeping API usage manual, short, and cost-conscious.
- Created a responsive dashboard with Chart.js visualizations, budget planning tools, emergency fund calculations, recent transactions, and total expense metrics.
- Prepared the application for production deployment with separate Vercel and Render configurations, environment examples, and a clear setup/deployment README.
