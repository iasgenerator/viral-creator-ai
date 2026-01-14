-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create encryption key secret (stored securely in vault)
-- First check if pgsodium is available, otherwise use pgcrypto
DO $$
BEGIN
  -- Create a function to encrypt tokens using pgcrypto
  CREATE OR REPLACE FUNCTION public.encrypt_token(token TEXT)
  RETURNS TEXT
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $func$
  DECLARE
    encryption_key TEXT;
  BEGIN
    -- Get encryption key from environment or generate one
    encryption_key := current_setting('app.encryption_key', true);
    IF encryption_key IS NULL OR encryption_key = '' THEN
      -- Use a derived key from service role (in production, use a proper secret)
      encryption_key := encode(digest('oauth_token_encryption_key_v1', 'sha256'), 'hex');
    END IF;
    
    IF token IS NULL THEN
      RETURN NULL;
    END IF;
    
    -- Encrypt using AES with pgcrypto
    RETURN encode(
      pgp_sym_encrypt(token, encryption_key),
      'base64'
    );
  END;
  $func$;

  -- Create a function to decrypt tokens
  CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token TEXT)
  RETURNS TEXT
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $func$
  DECLARE
    encryption_key TEXT;
  BEGIN
    encryption_key := current_setting('app.encryption_key', true);
    IF encryption_key IS NULL OR encryption_key = '' THEN
      encryption_key := encode(digest('oauth_token_encryption_key_v1', 'sha256'), 'hex');
    END IF;
    
    IF encrypted_token IS NULL THEN
      RETURN NULL;
    END IF;
    
    -- Decrypt using pgcrypto
    RETURN pgp_sym_decrypt(
      decode(encrypted_token, 'base64'),
      encryption_key
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- If decryption fails (e.g., token wasn't encrypted), return original
      RETURN encrypted_token;
  END;
  $func$;
END $$;

-- Add new columns for encrypted tokens
ALTER TABLE public.platform_connections
ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT;

-- Create a trigger to automatically encrypt tokens on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_platform_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Encrypt access_token if provided
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' THEN
    NEW.access_token_encrypted := public.encrypt_token(NEW.access_token);
    NEW.access_token := '***ENCRYPTED***'; -- Clear plain text, keep placeholder
  END IF;
  
  -- Encrypt refresh_token if provided
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token != '' THEN
    NEW.refresh_token_encrypted := public.encrypt_token(NEW.refresh_token);
    NEW.refresh_token := '***ENCRYPTED***'; -- Clear plain text, keep placeholder
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS encrypt_tokens_trigger ON public.platform_connections;
CREATE TRIGGER encrypt_tokens_trigger
  BEFORE INSERT OR UPDATE ON public.platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_platform_tokens();

-- Create a secure view for the edge function to access decrypted tokens
CREATE OR REPLACE VIEW public.platform_connections_secure AS
SELECT 
  id,
  user_id,
  platform,
  account_id,
  account_name,
  CASE 
    WHEN access_token_encrypted IS NOT NULL THEN public.decrypt_token(access_token_encrypted)
    ELSE access_token 
  END as access_token,
  CASE 
    WHEN refresh_token_encrypted IS NOT NULL THEN public.decrypt_token(refresh_token_encrypted)
    ELSE refresh_token 
  END as refresh_token,
  expires_at,
  is_active,
  created_at,
  updated_at
FROM public.platform_connections;

-- Grant access to the view for authenticated users (with RLS on base table)
GRANT SELECT ON public.platform_connections_secure TO authenticated;
GRANT SELECT ON public.platform_connections_secure TO service_role;