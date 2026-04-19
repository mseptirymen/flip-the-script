# Authentication Design

## Overview

Add email/password authentication to allow users to sign up and log in to access their tournament data.

## Architecture

- **Auth Provider:** Supabase Auth with email/password
- **Protected Routes:** `/tournaments/*` require authentication
- **Auth Pages:** `/auth/login` and `/auth/signup`

## Pages

### `/auth/login`
- Email input field
- Password input field
- "Sign In" button
- Link to signup: "Don't have an account? Sign up"

### `/auth/signup`
- Email input field
- Password input field
- Confirm password input field
- "Create Account" button
- Link to login: "Already have an account? Sign in"

## Auth Flow

1. Unauthenticated users visiting `/tournaments` → redirect to `/auth/login`
2. Users can sign up from `/auth/signup` → after signup, redirect to `/tournaments`
3. Users can sign in from `/auth/login` → after login, redirect to `/tournaments`

## Components

1. **AuthLayout** - Shared layout for login/signup pages with centered card
2. **LoginForm** - Email + password form with validation
3. **SignupForm** - Email + password + confirm password with validation
4. **AuthProvider** - Context provider for auth state

## Middleware

- Create `middleware.ts` to protect `/tournaments` routes
- Check auth state and redirect to `/auth/login` if not authenticated

## Notes
- Email confirmation disabled in Supabase (can enable later)
- Password recovery available when email verification is enabled
- Future: add 2FA, OAuth providers