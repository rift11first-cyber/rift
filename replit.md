# Overview

CollegeVibe is a college-exclusive community platform that creates meaningful connections through personality-based character matching. Students take a personality quiz to be assigned one of 10 unique character avatars, then engage with peers through posts, anonymous discussions, and smart matching algorithms. The app implements a 2:1 ratio matching system that suggests connections with two different character types and one similar character type to balance discovery with familiarity.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript SPA**: Client-side rendered application using Vite as the build tool
- **Component Library**: shadcn/ui components built on Radix UI primitives for consistent, accessible UI
- **Styling**: Tailwind CSS with custom CSS variables for theming and character-specific styling
- **State Management**: React hooks with Context API for authentication state
- **Data Fetching**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing

## Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript
- **Session-based Architecture**: Express app with middleware for logging, JSON parsing, and error handling
- **Storage Interface**: Abstracted storage layer with in-memory implementation (MemStorage) that can be swapped for database implementations
- **Route Structure**: Centralized route registration system with `/api` prefix for all API endpoints

## Authentication & Authorization
- **Firebase Authentication**: Handles user registration, login, email verification
- **College Email Validation**: Restricts registration to approved college domains
- **Profile Completion Flow**: Multi-step onboarding with personality quiz requirement
- **Session Management**: Firebase auth state persistence with custom user data storage

## Data Models
- **User Schema**: Includes character assignment, college affiliation, profile completion status
- **Post Schema**: Supports text posts, anonymous posting, polls with voting
- **Character System**: 10 predefined character types (5 male, 5 female) with emoji representation
- **Matching Algorithm**: 2:1 ratio system for character-based user suggestions

## Database Strategy
- **Dual Storage Approach**: Firebase Firestore for real-time features (posts, likes, comments) combined with potential SQL database integration
- **Drizzle ORM**: Configured for PostgreSQL with migration support
- **Schema Definition**: Shared TypeScript schemas with Zod validation

## UI/UX Design Patterns
- **Mobile-First Design**: Responsive layout with dedicated mobile navigation
- **Character-Centric Identity**: Visual character avatars with themed styling
- **Feed-Based Interaction**: Social media-style post feed with engagement features
- **Progressive Disclosure**: Quiz-based onboarding that gradually builds user profile

# External Dependencies

## Core Dependencies
- **Firebase**: Authentication, Firestore database, cloud storage
- **Drizzle ORM**: Database ORM with PostgreSQL support
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)

## UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component system

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **React Hook Form**: Form validation and management

## Third-Party Services
- **TanStack Query**: Server state management and caching
- **date-fns**: Date manipulation and formatting
- **Wouter**: Lightweight routing library
- **Embla Carousel**: Carousel component for UI interactions