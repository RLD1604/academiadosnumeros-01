# Academia dos Números - Educational Platform

## Overview
Academia dos Números is an interactive educational platform designed to teach multiplication and time reading skills. It features a Greek classical theme with Archimedes as a virtual tutor, creating an engaging learning environment for students. The platform aims to provide comprehensive learning, assessment, and progress tracking for core mathematical and time-telling abilities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a Greek classical theme with a marble, gold, and Aegean blue color palette. Typography uses Cinzel for headings and Inter for body text. The design is mobile-first, responsive, and accessible through Radix UI primitives. The interface emphasizes elegance and compactness, utilizing reduced font sizes, smaller padding, and subtle corner radii for a streamlined user experience. A three-column layout is consistently applied for optimal content organization. All pages include a permanent footer with developer credits (Rodrigo Linhares Drummond) and technology branding (Vibe Coding), maintaining the Greek classical aesthetic.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, styled using Tailwind CSS and shadcn/ui. Wouter handles client-side routing, and React hooks with TanStack Query manage state. Vite is used for builds.
- **Backend**: Node.js with Express.js, written in TypeScript.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations and schema migrations. Sessions are managed using `connect-pg-simple`.
- **SEO**: Comprehensive optimization including meta tags, Open Graph protocol, Twitter Cards, canonical URLs, and JSON-LD structured data (Schema.org) for improved search engine visibility and social media sharing.

### Feature Specifications
- **Educational Features**: Interactive multiplication table (10x10 and individual tables), division tables, configurable timed quizzes with 5 challenge modes (Multiplication, Division, Squares, Cubes, Mixed), and an interactive educational clock for learning time reading.
- **Challenge Modes**: 
  - Multiplication: Standard multiplication practice (X × Y = ?)
  - Division: Division practice with exact divisors (X ÷ Y = ?)
  - Quadrados (Squares): Power notation introduction (2² = 2 × 2 = ?) for bases 1-10 (10 fixed questions)
  - Cubos (Cubes): Cube notation practice (2³ = 2 × 2 × 2 = ?) for bases 1-10 (10 fixed questions)
  - Misto (Mixed): 50/50 combination of multiplication and division
- **Virtual Assistant**: Archimedes provides context-aware tips and guidance.
- **Statistics & Progress Tracking**: Real-time tracking of answers, errors, corrections, a gamified achievement system, and performance analytics.
- **Educational Clock**: Features a 24-hour continuous clock system with draggable pointers (supports both mouse and touch events for mobile compatibility), dynamic minute calculation formula, period indicators (Madrugada, Manhã, Tarde, Noite), and quick navigation buttons. Includes both practice and challenge modes with visual feedback and detailed explanations. The canvas-based clock component implements full touch support with touchstart, touchmove, and touchend events, enabling seamless interaction on mobile devices.

### System Design Choices
The application uses a RESTful API with TanStack Query for efficient client-server communication, including caching and synchronization. State management combines React hooks for local state, context providers for global state, and browser storage for persistent user preferences.

## External Dependencies
- **@tanstack/react-query**: Server state management and caching.
- **drizzle-orm**: Type-safe database operations.
- **@neondatabase/serverless**: PostgreSQL driver.
- **wouter**: Lightweight client-side routing.
- **@radix-ui/react-***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **vite**: Build tool and development server.
- **typescript**: Type checking.
- **tsx**: TypeScript execution for development.
- **esbuild**: Fast JavaScript bundler.
- **drizzle-kit**: Database migration and introspection tools.