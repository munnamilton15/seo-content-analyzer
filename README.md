# SEO Content Analyzer

A full-stack web application that analyzes publicly accessible webpages and provides actionable SEO insights across technical SEO, on-page SEO, content quality, keywords, images, links, security, and Google PageSpeed performance.

## 🚀 Live Demo

**Frontend:** https://seo-content-analyzer-eight.vercel.app/

**Backend API:** https://seo-content-analyzer-0edc.onrender.com/

## ✨ Features

- **Overall SEO Score** — summarizes the page's SEO health with category scores.
- **Technical SEO Analysis** — checks canonical URL, HTTPS, viewport, language, robots.txt, XML sitemap, Open Graph tags, and structured data.
- **On-Page SEO** — analyzes page title, meta description, headings, and other important page elements.
- **Content Quality** — reports word count and readability metrics.
- **Keyword Analysis** — identifies frequently used keywords and calculates keyword density.
- **Image SEO** — checks images and missing alt attributes.
- **Link Health** — checks internal/external links and identifies broken or redirected links.
- **SEO Issues & Recommendations** — highlights errors and warnings with actionable recommendations.
- **Google PageSpeed Insights** — displays Performance, Accessibility, Best Practices, SEO, and Core Web Vitals metrics.
- **Security & Reliability** — includes request rate limiting, security headers, URL validation, timeouts, redirect limits, and protection against requests to private/local network addresses.
- **Responsive UI** — designed for desktop and mobile use.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express
- Cheerio
- Helmet
- CORS
- express-rate-limit

### APIs & Services
- Google PageSpeed Insights API

### Deployment
- Vercel — frontend
- Render — backend
- GitHub — source control

## 🏗️ Architecture

```text
┌──────────────────────┐
│      User / Browser  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   React + Vite UI    │
│       Vercel         │
└──────────┬───────────┘
           │ POST /api/analyze
           ▼
┌──────────────────────┐
│ Node.js + Express API│
│       Render         │
└──────────┬───────────┘
           │
     ┌─────┴─────────────────────────┐
     │                               │
     ▼                               ▼
┌───────────────┐          ┌────────────────────┐
│ SEO Analyzer  │          │ PageSpeed Insights │
│   Cheerio     │          │       API          │
└───────┬───────┘          └─────────┬──────────┘
        │                            │
        └────────────┬───────────────┘
                     ▼
             ┌──────────────┐
             │ SEO Report   │
             │ + Metrics    │
             └──────────────┘
```

## 📂 Project Structure

```text
seo-content-analyzer/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── routes/
│   │   └── analysisRoutes.js
│   ├── services/
│   │   ├── linkChecker.js
│   │   ├── pageSpeedService.js
│   │   └── seoAnalyzer.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── .gitignore
```

## ⚙️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/munnamilton15/seo-content-analyzer.git
cd seo-content-analyzer
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd seo-content-analyzer/server
npm install
```

Create `server/.env`:

```env
PAGESPEED_API_KEY=your_pagespeed_api_key
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

The API runs at:

```text
http://localhost:5000
```

## 🔌 API

### Analyze a webpage

**Endpoint**

```http
POST /api/analyze
```

**Request**

```json
{
  "url": "https://example.com"
}
```

**Example**

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

The API returns the SEO score, category scores, technical information, content and keyword analysis, image/link health, issues and recommendations, and PageSpeed metrics.

## 🔐 Security Considerations

The backend includes several protections for a public analysis service:

- HTTP/HTTPS URL validation
- Rejection of private and local hostnames
- DNS-based private IP checks
- Redirect validation with a maximum redirect limit
- Request timeouts
- HTML response size limits
- Link-checking limits
- API rate limiting
- Helmet security headers
- CORS restrictions
- Generic error responses

API keys are stored in environment variables and are excluded from Git through `.gitignore`.

## 📌 Project Highlights

This project demonstrates practical experience with:

- Full-stack React and Node.js development
- REST API design
- Web scraping and HTML parsing
- SEO analysis logic
- External API integration
- Backend security
- API rate limiting
- Production deployment
- Environment-based configuration

## 👨‍💻 Author

**Milton Fernandies**

- GitHub: https://github.com/munnamilton15
- Portfolio: https://miltonfernandies.netlify.app/

## 📄 License

This project is available for educational and portfolio purposes.
