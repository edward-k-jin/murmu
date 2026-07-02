create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

alter function public.is_active_couple_member(uuid) set schema private;

revoke all on function private.is_active_couple_member(uuid) from public, anon;
grant execute on function private.is_active_couple_member(uuid) to authenticated;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

create index couple_invites_accepted_by_idx
  on public.couple_invites (accepted_by)
  where accepted_by is not null;
