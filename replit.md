# Podcast Generation Platform

## Overview

This is a full-stack web application that automatically generates podcast-style conversations from text documents. Users can upload documents (DOCX or TXT files) or input text directly, and the system creates engaging dialogues between two AI hosts with customizable voices and settings. The platform uses OpenAI for script generation and text-to-speech services for audio synthesis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **File Handling**: React Dropzone for drag-and-drop file uploads

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Hot reloading with Vite integration in development mode
- **API Design**: RESTful endpoints with structured error handling
- **File Processing**: Multer for file uploads, Mammoth for DOCX parsing

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL
- **Schema**: Structured tables for users and podcasts with JSON fields for complex data
- **Migrations**: Drizzle Kit for database schema management
- **Development Fallback**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **User Model**: Basic username/password authentication system
- **Security**: Password hashing and session-based authentication

### Core Features
- **Document Processing**: Support for DOCX and TXT file uploads with content extraction
- **AI Script Generation**: OpenAI integration for creating conversational podcast scripts
- **Voice Synthesis**: Text-to-speech service for generating audio content
- **Real-time Status**: Polling-based status updates for generation progress
- **Audio Management**: File serving and download capabilities
- **Settings Customization**: Configurable voice settings, conversation tone, and podcast length

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database toolkit and query builder

### AI and Audio Services
- **OpenAI API**: GPT models for script generation and conversation creation
- **ElevenLabs API**: Text-to-speech synthesis for voice generation

### UI and Component Libraries
- **Radix UI**: Unstyled, accessible UI components
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Server state management and caching

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: JavaScript bundler for production builds

### File Processing
- **Multer**: Multipart form data handling for file uploads
- **Mammoth**: Microsoft Word document (.docx) text extraction
- **React Dropzone**: Drag and drop file upload interface