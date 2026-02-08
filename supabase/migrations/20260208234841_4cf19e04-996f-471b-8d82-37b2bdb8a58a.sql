-- Fix the get_user_decrypted_connections function to use only encrypted columns
CREATE OR REPLACE FUNCTION public.get_user_decrypted_connections(p_user_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  platform platform_type, 
  account_id text, 
  account_name text, 
  access_token text, 
  refresh_token text, 
  expires_at timestamp with time zone, 
  is_active boolean, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      ELSE NULL 
    END as access_token,
    CASE 
      WHEN pc.refresh_token_encrypted IS NOT NULL THEN public.decrypt_token(pc.refresh_token_encrypted)
      ELSE NULL 
    END as refresh_token,
    pc.expires_at,
    pc.is_active,
    pc.created_at,
    pc.updated_at
  FROM public.platform_connections pc
  WHERE pc.user_id = p_user_id AND pc.is_active = true;
END;
$function$;

-- Also fix the get_decrypted_platform_connection function
CREATE OR REPLACE FUNCTION public.get_decrypted_platform_connection(connection_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  platform platform_type, 
  account_id text, 
  account_name text, 
  access_token text, 
  refresh_token text, 
  expires_at timestamp with time zone, 
  is_active boolean, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      ELSE NULL 
    END as access_token,
    CASE 
      WHEN pc.refresh_token_encrypted IS NOT NULL THEN public.decrypt_token(pc.refresh_token_encrypted)
      ELSE NULL 
    END as refresh_token,
    pc.expires_at,
    pc.is_active,
    pc.created_at,
    pc.updated_at
  FROM public.platform_connections pc
  WHERE pc.id = connection_id;
END;
$function$;