-- Fix search_path for month_to_roman function
CREATE OR REPLACE FUNCTION public.month_to_roman(month_num integer)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE month_num
    WHEN 1 THEN 'I'
    WHEN 2 THEN 'II'
    WHEN 3 THEN 'III'
    WHEN 4 THEN 'IV'
    WHEN 5 THEN 'V'
    WHEN 6 THEN 'VI'
    WHEN 7 THEN 'VII'
    WHEN 8 THEN 'VIII'
    WHEN 9 THEN 'IX'
    WHEN 10 THEN 'X'
    WHEN 11 THEN 'XI'
    WHEN 12 THEN 'XII'
    ELSE 'I'
  END;
END;
$$;