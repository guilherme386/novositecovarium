
-- Add a short reference code for support
ALTER TABLE public.orders ADD COLUMN reference_code text UNIQUE;

-- Function to generate random alphanumeric code
CREATE OR REPLACE FUNCTION public.generate_reference_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  NEW.reference_code := result;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_reference_code
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.reference_code IS NULL)
  EXECUTE FUNCTION public.generate_reference_code();

-- Backfill existing orders
UPDATE public.orders SET reference_code = 
  substr(md5(random()::text), 1, 10)
WHERE reference_code IS NULL;
