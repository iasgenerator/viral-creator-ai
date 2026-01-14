-- Drop the SECURITY DEFINER view and use a more secure approach
-- The edge function will use the decrypt_token function directly with service_role

DROP VIEW IF EXISTS public.platform_connections_secure;

-- Instead, we'll create a secure RPC function that edge functions can call
-- This is safer than a SECURITY DEFINER view
CREATE OR REPLACE FUNCTION public.get_decrypted_platform_connection(connection_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  platform platform_type,
  account_id TEXT,
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function should only be called by service_role from edge functions
  -- It decrypts tokens for the specified connection
  RETURN QUERY
  SELECT 
    pc.id,
    pc.user_id,
    pc.platform,
    pc.account_id,
    pc.account_name,
    CASE 
      WHEN pc.access_token_encrypted IS NOT NULL THEN public.decrypt_token(pc.access_token_encrypted)
      ELSE pc.access_token 
    END as access_token,
    CASE 
      WHEN pc.refresh_token_encrypted IS NOT NULL THEN public.decrypt_token(pc.refresh_token_encrypted)
      ELSE pc.refresh_token 
    END as refresh_token,
    pc.expires_at,
    pc.is_active,
    pc.created_at,
    pc.updated_at
  FROM public.platform_connections pc
  WHERE pc.id = connection_id;
END;
$$;

-- Also create a function to get all connections for a user (for edge functions)
CREATE OR REPLACE FUNCTION public.get_user_decrypted_connections(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  platform platform_type,
  account_id TEXT,
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.user_id,
    pc.platform,
    pc.account_id,
    pc.account_name,
    CASE 
      WHEN pc.access_token_encrypted IS NOT NULL THEN public.decrypt_token(pc.access_token_encrypted)
      ELSE pc.access_token 
    END as access_token,
    CASE 
      WHEN pc.refresh_token_encrypted IS NOT NULL THEN public.decrypt_token(pc.refresh_token_encrypted)
      ELSE pc.refresh_token 
    END as refresh_token,
    pc.expires_at,
    pc.is_active,
    pc.created_at,
    pc.updated_at
  FROM public.platform_connections pc
  WHERE pc.user_id = p_user_id AND pc.is_active = true;
END;
$$;