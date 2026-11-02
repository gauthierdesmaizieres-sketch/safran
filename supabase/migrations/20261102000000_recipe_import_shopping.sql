-- Recipe import (Instagram / YouTube link) and the shopping list screen.
-- recipes.source_url, shopping_items and its RLS already exist (init); only bound what the client writes.
alter table recipes add constraint recipes_source_url check (source_url ~* '^https?://' and char_length(source_url) <= 500);
alter table shopping_items add constraint shopping_text_len check (char_length(text) between 1 and 200);

-- save_recipe keeps the link the dish was imported from (null for hand-made dishes).
create or replace function save_recipe(r jsonb, ingredients jsonb) returns uuid
language plpgsql security invoker set search_path = public as $$
declare rid uuid := nullif(r->>'id', '')::uuid;
begin
  if rid is null then
    insert into recipes (owner_id, title, photo_path, servings, prep_minutes, tags, steps, source_url)
    values (auth.uid(), r->>'title', r->>'photo_path', (r->>'servings')::int, (r->>'prep_minutes')::int,
            coalesce(array(select jsonb_array_elements_text(r->'tags')), '{}'), coalesce(r->'steps', '[]'), r->>'source_url')
    returning id into rid;
  else
    update recipes set title = r->>'title', photo_path = r->>'photo_path', servings = (r->>'servings')::int,
      prep_minutes = (r->>'prep_minutes')::int,
      tags = coalesce(array(select jsonb_array_elements_text(r->'tags')), '{}'), steps = coalesce(r->'steps', '[]'),
      source_url = coalesce(r->>'source_url', source_url)
    where id = rid and owner_id = auth.uid();
    if not found then raise exception 'recipe not found' using errcode = 'P0002'; end if;
    delete from recipe_ingredients where recipe_id = rid;
  end if;
  insert into recipe_ingredients (recipe_id, food_id, grams, position)
  select rid, (i->>'food_id')::uuid, (i->>'grams')::numeric, (ord - 1)::int
  from jsonb_array_elements(ingredients) with ordinality as t(i, ord);
  return rid;
end $$;
