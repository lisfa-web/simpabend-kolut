-- Add demo_admin and super_admin to app_role enum
-- These roles are needed for system administration and demo purposes

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'demo_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
