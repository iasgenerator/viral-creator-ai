-- Remove plain text token columns that expose sensitive OAuth credentials
-- The encrypted versions (access_token_encrypted, refresh_token_encrypted) are already in use

-- First, drop the trigger that was encrypting tokens on insert/update
-- since we no longer need it (tokens are encrypted before insert now)
DROP TRIGGER IF EXISTS encrypt_tokens_trigger ON public.platform_connections;

-- Remove the plain text columns
ALTER TABLE public.platform_connections DROP COLUMN IF EXISTS access_token;
ALTER TABLE public.platform_connections DROP COLUMN IF EXISTS refresh_token;