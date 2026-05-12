DO $$ 
BEGIN
  -- Garantir que a tabela surveys possua a política correta que permite
  -- a inserção de novos registros publicamente via chat, para que
  -- eles sejam integrados ao dashboard de forma transparente e imediata.
  
  DROP POLICY IF EXISTS "Anyone can insert a survey." ON public.surveys;
  
  CREATE POLICY "Anyone can insert a survey." ON public.surveys
    FOR INSERT TO public WITH CHECK (true);
END $$;
