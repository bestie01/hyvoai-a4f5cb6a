DO $$
DECLARE
  r record;
  new_qual text;
  new_chk text;
  sql text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        (qual ~ 'auth\.uid\(\)' AND qual !~ '\(\s*SELECT\s+auth\.uid\(\)\s*\)')
        OR (with_check ~ 'auth\.uid\(\)' AND with_check !~ '\(\s*SELECT\s+auth\.uid\(\)\s*\)')
      )
  LOOP
    new_qual := r.qual;
    new_chk  := r.with_check;

    IF new_qual IS NOT NULL THEN
      new_qual := regexp_replace(new_qual, '(?<!SELECT\s)auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    END IF;
    IF new_chk IS NOT NULL THEN
      new_chk := regexp_replace(new_chk, '(?<!SELECT\s)auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    END IF;

    sql := format('ALTER POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    IF new_qual IS NOT NULL THEN
      sql := sql || format(' USING (%s)', new_qual);
    END IF;
    IF new_chk IS NOT NULL THEN
      sql := sql || format(' WITH CHECK (%s)', new_chk);
    END IF;

    RAISE NOTICE 'Rewriting policy: % on %.%', r.policyname, r.schemaname, r.tablename;
    EXECUTE sql;
  END LOOP;
END
$$;