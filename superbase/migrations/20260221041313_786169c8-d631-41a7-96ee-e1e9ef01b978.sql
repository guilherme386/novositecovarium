ALTER TABLE public.orders ADD COLUMN tip numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN message text;