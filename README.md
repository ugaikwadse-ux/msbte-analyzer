# MSBTE Result Analyzer

A production-ready SaaS web application for automating MSBTE result analysis for polytechnic institutes and coaching centers.

## Features

- 🔍 **Single Result Search** — No login required
- 📊 **Batch Analysis** — Enter seat range, get full department analysis
- 📁 **Department Management** — Organize by department + semester
- 📈 **Statistics & Charts** — Pass %, toppers, subject-wise failures
- 📤 **CSV & PDF Export** — With optional institute branding
- 🔐 **Firebase Auth** — Email/password authentication
- 💳 **Secure Payments** — Institute subscriptions
- 🌙 **Dark Mode** — Full dark/light theme support
- 📱 **Responsive** — Mobile-friendly design

## Tech Stack

- **Next.js 15** + TypeScript (App Router)
- **TailwindCSS** + shadcn/ui components
- **Firebase** (Auth + Firestore + Storage)
- **Secure Billing** subscription billing
- **Recharts** for analytics charts
- **jsPDF** + jsPDF-autotable for PDF export

## Project Structure

```
src/
├── app/
│   ├── (root)/
│   │   ├── page.tsx              # Landing page
│   │   └── pricing/page.tsx      # Pricing page
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── result/page.tsx           # Public single result search
│   └── dashboard/
│       ├── page.tsx              # Dashboard home
│       ├── departments/page.tsx
│       ├── analyses/
│       │   ├── page.tsx          # Analyses list + generate
│       │   └── [id]/page.tsx     # Analysis detail + table + exports
│       ├── subscription/page.tsx
│       └── profile/page.tsx
├── components/
│   ├── ui/                       # Reusable UI primitives
│   ├── layout/                   # Navbar, Sidebar, Footer
│   └── landing/                  # Landing page sections
├── hooks/
│   └── useAuth.tsx               # Auth context + hook
├── lib/
│   ├── firebase.ts               # Firebase init
│   ├── db.ts                     # Firestore CRUD operations
│   ├── api.ts                    # MSBTE API service
│   ├── exports.ts                # CSV + PDF export
│   └── utils.ts                  # Helpers
└── types/
    └── index.ts                  # TypeScript interfaces
```

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd msbte-analyzer
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database**
5. Copy your config to `.env.local`

### 3. Configure PayPal

1. Go to [PayPal Developer](https://developer.paypal.com)
2. Create subscription plans for Institute
3. Add plan IDs to `.env.local`

### 4. Configure environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your real credentials
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for production

```bash
npm run build
npm start
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /departments/{deptId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    match /subscriptions/{subId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

## API Endpoints Used

- `POST https://api.msbteresult.online/fetch-result` — Fetch single student result
- `POST https://api.msbteresult.online/fetch-html` — Fetch HTML result for download

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0 | Single result, watermarked exports, max 1 department, max 20 seats per batch |
| Institute | ₹2999/mo | Everything + logo branding, priority support, unlimited departments, unlimited seats |

## License

MIT
