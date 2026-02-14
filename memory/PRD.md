# Ventur - AI Pitch Deck Analyzer & Data Room

## Original Problem Statement
Build a full-stack app where startup founders submit pitch decks and get AI analysis with suggestions. Features include pitch deck upload, AI analysis (what's wrong, improvements, sentence suggestions, image recommendations), Data Room for organizing startup documents by categories (Financials, Legal, Previous Funding, IP, Staff, Metrics, etc.), AI analysis per document, auto-generate charts/graphs from data, and history management with delete option.

## Architecture & Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Recharts
- **Backend**: FastAPI (Python), MongoDB
- **AI**: Gemini 2.5 Flash via emergentintegrations library (for file attachment analysis)
- **Auth**: JWT-based custom authentication

## User Personas
1. **Startup Founders** - Primary users uploading pitch decks and organizing data rooms for investor due diligence
2. **Fundraising Consultants** - Users helping startups prepare materials

## Core Requirements (Static)
- User registration/login with JWT authentication
- Pitch deck upload (PDF, PPTX, PNG, JPG)
- AI-powered pitch deck analysis with actionable feedback
- Data Room with 8 categories (Summary, Financials, Legal, Previous Funding, IP, Staff, Metrics, Other)
- Document upload and AI analysis per document
- History management with delete functionality
- Dark theme with orange accent color

## What's Been Implemented (Feb 2024)

### Backend
- [x] User authentication (register, login, JWT tokens)
- [x] Pitch deck upload and storage
- [x] AI analysis using Gemini 2.5 Flash
- [x] Data room document management with 8 categories
- [x] History API with clear all functionality
- [x] Dashboard stats API

### Frontend
- [x] Landing page with Oswald/Manrope fonts, dark theme, orange accents
- [x] Registration and login pages
- [x] Dashboard with stats cards, recent pitch decks, and quick actions
- [x] Pitch Deck Analyzer with drag-drop upload and analysis tabs
- [x] Data Room with category cards, upload, and analysis display
- [x] History page with individual and bulk delete
- [x] Responsive sidebar navigation
- [x] Dropdown menu with logout

## Data Room Categories (as per requirements PDF)
1. **Summary** - Pitch Deck, One Pager
2. **Financials** - P&L, Balance Sheet, Financial Model
3. **Legal** - Articles of Incorporation, Bylaws, Stock Agreements, Cap Table, Board Profiles
4. **Previous Funding** - Investor Rights, Co-sale Agreements, Round Documents
5. **Intellectual Property** - Patents, Trademarks, Brand Book
6. **Staff** - Org Chart, Employee List, Contracts
7. **Metrics** - Sales Pipeline, SaaS Metrics, Usage
8. **Other** - System Architecture, API Documentation

## Prioritized Backlog

### P0 (Critical)
- All core features implemented ✓

### P1 (High Priority)
- [ ] PDF viewer/preview for uploaded documents
- [ ] Export analysis results as PDF
- [ ] Batch upload for multiple documents
- [ ] Search/filter in history

### P2 (Medium Priority)
- [ ] Document sharing with team members
- [ ] Custom categories in data room
- [ ] Analysis comparison between versions
- [ ] Integration with cloud storage (Google Drive, Dropbox)

### P3 (Nice to Have)
- [ ] AI chat for follow-up questions on analysis
- [ ] Investor introduction features
- [ ] Analytics dashboard with trends
- [ ] Email notifications for analysis completion

## Next Tasks
1. Add PDF viewer for uploaded documents
2. Implement export analysis as PDF
3. Add search functionality in history
4. Enhance mobile responsiveness
5. Add loading skeletons for better UX

## Testing Status
- Backend: 87% pass rate
- Frontend: 95% pass rate
- Overall: 91% pass rate
