# Academia dos Números - Educational Platform

## Overview

Academia dos Números is an interactive educational platform designed to teach multiplication and time reading skills. The application features a Greek classical theme with Archimedes as a virtual tutor, creating an engaging learning environment for students.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Greek-themed design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: React hooks with TanStack Query for server state
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **Development**: Hot module replacement via Vite integration

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Current Tables**: Users table with basic authentication fields
- **Migration Strategy**: Drizzle Kit for schema migrations

## Key Components

### Educational Features
1. **Multiplication Table**: Interactive 10x10 grid for practicing multiplication
2. **Individual Tables**: Focused practice on specific multiplication tables (1-10)
3. **Timed Quiz**: Configurable quiz system with 10-100 questions
4. **Educational Clock**: Interactive clock for learning time reading
5. **Assessment System**: Comprehensive evaluation with progress tracking

### Virtual Assistant
- **Character**: Archimedes as the virtual tutor
- **Features**: Context-aware tips and guidance
- **Implementation**: React component with page-specific content

### User Interface
- **Theme**: Greek classical design with marble, gold, and aegean blue color palette
- **Typography**: Cinzel for headings, Inter for body text
- **Responsive**: Mobile-first design with Tailwind breakpoints
- **Accessibility**: Radix UI primitives ensure ARIA compliance

### Statistics & Progress Tracking
- **Real-time Statistics**: Tracks correct answers, errors, and corrections
- **Achievement System**: Gamified progress tracking
- **Performance Analytics**: Accuracy calculations and improvement metrics

## Data Flow

### Client-Server Communication
1. **API Layer**: RESTful endpoints with `/api` prefix
2. **Query Management**: TanStack Query for caching and synchronization
3. **Error Handling**: Centralized error boundary system
4. **Session Management**: Cookie-based authentication

### State Management
1. **Local State**: React hooks for component-level state
2. **Global State**: Context providers for shared application state
3. **Persistent State**: Browser storage for user preferences
4. **Server State**: TanStack Query for API data synchronization

### Application Flow
1. User navigates through educational modules
2. Progress tracked in real-time with visual feedback
3. Statistics calculated and stored locally
4. Virtual assistant provides contextual guidance
5. Achievements unlocked based on performance metrics

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments
- **wouter**: Lightweight client-side routing
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **vite**: Build tool and development server

### Development Dependencies
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **drizzle-kit**: Database migration and introspection tools

### Asset Management
- **Static Assets**: Images stored in `attached_assets` directory
- **Build Output**: Client files compiled to `dist/public`
- **Asset Resolution**: Vite aliases for clean import paths

## Deployment Strategy

### Production Build
1. **Client Build**: Vite compiles React application to static assets
2. **Server Build**: esbuild bundles Express server for Node.js runtime
3. **Output Structure**: Server in `dist/index.js`, client in `dist/public`

### Environment Configuration
- **Development**: Hot reload with Vite middleware
- **Production**: Optimized static file serving
- **Database**: PostgreSQL connection via environment variables
- **Port Configuration**: Configurable port with default 5000

### Replit Configuration
- **Modules**: Node.js 20, web server, PostgreSQL 16
- **Deployment**: Autoscale deployment target
- **Port Mapping**: Internal port 5000 mapped to external port 80
- **Workflows**: Automated development and production workflows

## Changelog

```
Changelog:
- June 30, 2025. Practice mode verification system implementation - USER APPROVED
  - Added functional "Verificar Resposta" button to practice mode
  - Implemented random target time generation system
  - Created visual feedback for correct/incorrect answers
  - Added target time display with clear instructions
  - Integrated "Novo Horário" button for generating new practice challenges
  - Maintained design consistency with existing interface
  - User feedback: resolved missing verification functionality in practice mode
- June 29, 2025. Enhanced detailed visualization and period separation - USER APPROVED
  - Refined time period classification: madrugada (0-5h), manhã (6-11h), tarde (12-17h), noite (18-23h)
  - Added visual pointer indicators (colored bars) representing hour, minute, second hands
  - Improved visualization boxes with enhanced styling: shadows, borders, rounded corners
  - Increased font sizes and added visual hierarchy with separator lines
  - Maintained consistency across both practice and challenge modes
  - User feedback: improved visual clarity and period distinction
- June 29, 2025. Enhanced centering and layout optimization - USER APPROVED
  - Improved clock centering and alignment across both practice and challenge modes
  - Increased clock size to 420px for better visibility and interaction
  - Optimized grid layout with balanced spacing (gap-8) for professional appearance
  - Added minimum height constraints (min-h-600px) for consistent alignment
  - Enhanced component proportions and visual hierarchy
  - User feedback: improved visual balance and professional interface
- June 29, 2025. Interface simplification and cleanup - USER APPROVED
  - Removed "Aprender" tab completely, keeping only "Praticar" and "Desafios" tabs
  - Eliminated pointer legend component (HORAS/MINUTOS/SEGUNDOS colored boxes)
  - Streamlined navigation with cleaner, more focused interface
  - Default tab set to "Praticar" for immediate hands-on learning
- June 29, 2025. Enhanced educational challenge system with comprehensive features
  - Implemented 20 educational questions across 8 thematic categories
  - Added difficulty levels (Easy, Medium, Hard) with visual indicators
  - Integrated detailed explanations for each correct answer
  - Created three-column layout for challenges matching practice mode
  - Added visualization boxes (Hours, Minutes, Seconds) below multiplication table
  - Included all practice mode features: digital display, period indicators, navigation buttons, reset button
  - Removed answer visibility ("Alvo:") from questions per user request for better educational value
  - Categories: Basic Concepts, Half Hour, Meal Times, Travel/Displacement, Morning Routine, Time Intervals, Multiple Operations, Hour Fractions
- June 29, 2025. Three-column layout optimization - EXCELLENT RESULT - USER APPROVED
  - Reorganized educational clock interface into optimized three-column layout
  - Coluna 1 (Esquerda): Display digital 24h, fórmula dos minutos, período do dia, navegação rápida
  - Coluna 2 (Centro): Relógio analógico interativo (350px) com ponteiros arrastáveis
  - Coluna 3 (Direita): Tabuada do 5 para cálculo de minutos com destaque dinâmico
  - Todo conteúdo agora visível na mesma tela sem necessidade de scroll
  - Layout responsivo: grid lg:grid-cols-3 adapta automaticamente para telas menores
  - Funcionalidades preservadas: arrastar ponteiros, navegação por períodos, fórmulas dinâmicas
  - Interface compacta mas completa: h-screen overflow-hidden para controle total de viewport
  - User feedback: "ficou muito bom" - layout aprovado para produção
- June 29, 2025. Complete 24-hour continuous clock system implementation - SUCCESS
  - Implemented continuous 24-hour clock navigation (00:00-23:59) without AM/PM separation
  - Added digital time display with real-time updates showing current 24h time
  - Created dynamic minute calculation formula: (X × 5) + Y = minutes display
  - Integrated interactive multiplication table of 5 with visual highlighting
  - Added quick navigation buttons for all day periods (Madrugada, Manhã, Tarde, Noite)
  - Fixed period detection logic to cover all 24 hours correctly
  - Draggable clock pointers now transition smoothly through all day periods
  - Educational features: formula explanation, period indicators, and calculation aids
- June 29, 2025. Educational clock interface cleanup - removed all digital displays
  - Completely removed digital time displays from educational clock interface
  - Cleaned up CanvasClockFixed component by removing digital display element
  - Updated educational-clock.tsx to use CanvasClockFixed consistently across all tabs
  - Interface now shows only: analog clock, day period indicator, reset button, and pointer legends
  - Fixed TypeScript errors for proper type safety in clock components
  - Educational focus improved with cleaner, distraction-free interface
- June 29, 2025. Educational clock final fixes - fully functional practice mode
  - Fixed critical dragging issue in practice mode - pointers now respond correctly to mouse drag
  - Corrected hour transition logic when minutes pass from 59 to 0 (advances hour) and 0 to 59 (previous hour)
  - Increased pointer detection area from 30px to 50px for easier dragging
  - Fixed Canvas implementation to handle all pointer positions correctly
  - Removed excessive debug logging that was cluttering console
  - Practice mode now works perfectly: drag any pointer (hour/minute/second) to set time
  - Hour transitions work correctly (e.g., 3:59 → 4:00 when dragging minutes)
  - All three clock modes functional: "Aprender" (real-time), "Praticar" (interactive), "Desafios" (challenges)
- June 29, 2025. Educational clock critical fix for pointer visibility
  - Diagnosed and fixed pointer disappearing issue at positions 3, 6, 9, 12 horas
  - Problem: Pointer coordinates were calculated outside SVG viewport (400x400)
  - Solution: Reduced pointer lengths to ensure visibility in all positions
  - Hour hand: 25% → 20%, Minute hand: 35% → 28%, Second hand: 38% → 32%
  - Implemented comprehensive logging system for debugging pointer positions
  - Added debug circles for visual verification of pointer coordinates
- June 29, 2025. Educational clock improvements and interface cleanup
  - Fixed pointer interposition issue with dynamic z-index system
  - Corrected clock pointer calculation functions for accurate angle conversion
  - Improved mouse/touch event handling for smooth pointer dragging
  - Set practice clock initial state to 12:00:00 for cleaner starting position
  - Removed technical angular division information section per user request
  - Applied precise angular calculations: 30° per hour, 6° per minute/second
- June 29, 2025. Project cleanup and optimization
  - Removed unused UI components (accordion, alert-dialog, avatar, breadcrumb, calendar, carousel, chart, checkbox, collapsible, command, context-menu, drawer, dropdown-menu, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, sidebar, slider, switch, table, tabs, textarea, toggle-group, tooltip)
  - Cleaned up all attached assets that weren't used in the codebase
  - Removed unused image imports and references
  - Simplified background styling to use CSS gradients instead of images
  - Restored working educational clock functionality after reverting problematic refactoring
- June 15, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```