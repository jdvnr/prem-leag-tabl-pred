drop extension if exists "pg_net";


  create table "public"."league_table" (
    "id" uuid not null default gen_random_uuid(),
    "season" text not null,
    "position" smallint not null,
    "team" text not null,
    "position_bonus" jsonb default '[]'::jsonb,
    "finalized" boolean default false
      );


alter table "public"."league_table" enable row level security;


  create table "public"."predictions" (
    "id" uuid not null default gen_random_uuid(),
    "season" text not null,
    "prediction" jsonb not null,
    "is_locked" boolean not null default false,
    "submitted_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "usr_id" uuid not null
      );


alter table "public"."predictions" enable row level security;


  create table "public"."qualification_rules" (
    "id" uuid not null default gen_random_uuid(),
    "season" text not null,
    "qualification" text not null,
    "positions" smallint[] not null,
    "bonus_points" smallint not null
      );


alter table "public"."qualification_rules" enable row level security;


  create table "public"."scores" (
    "id" uuid not null default gen_random_uuid(),
    "prediction_id" uuid not null,
    "user_id" uuid not null,
    "season" text not null,
    "base_score" smallint not null default '0'::smallint,
    "bonus" jsonb not null default '{}'::jsonb,
    "total_score" smallint not null default '0'::smallint,
    "breakdown" jsonb not null default '[]'::jsonb,
    "calculated_at" timestamp with time zone not null default now()
      );


alter table "public"."scores" enable row level security;


  create table "public"."teams" (
    "id" uuid not null default gen_random_uuid(),
    "season" text not null,
    "name" text not null,
    "short_name" text,
    "badge_url" text
      );


alter table "public"."teams" enable row level security;


  create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "first_name" text not null,
    "last_name" text not null,
    "email" text not null,
    "token" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX league_table_pkey ON public.league_table USING btree (id);

CREATE UNIQUE INDEX predictions_pkey ON public.predictions USING btree (id);

CREATE UNIQUE INDEX qualification_rules_by_season ON public.qualification_rules USING btree (season, qualification);

CREATE UNIQUE INDEX qualification_rules_pkey ON public.qualification_rules USING btree (id);

CREATE UNIQUE INDEX score_by_prediction ON public.scores USING btree (prediction_id);

CREATE UNIQUE INDEX scores_pkey ON public.scores USING btree (id);

CREATE UNIQUE INDEX season_by_position ON public.league_table USING btree (season, "position");

CREATE UNIQUE INDEX season_by_team ON public.league_table USING btree (season, team);

CREATE UNIQUE INDEX team_by_season ON public.teams USING btree (season, name);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

CREATE UNIQUE INDEX unique_user_season ON public.predictions USING btree (usr_id, season);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_token_key ON public.users USING btree (token);

alter table "public"."league_table" add constraint "league_table_pkey" PRIMARY KEY using index "league_table_pkey";

alter table "public"."predictions" add constraint "predictions_pkey" PRIMARY KEY using index "predictions_pkey";

alter table "public"."qualification_rules" add constraint "qualification_rules_pkey" PRIMARY KEY using index "qualification_rules_pkey";

alter table "public"."scores" add constraint "scores_pkey" PRIMARY KEY using index "scores_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."league_table" add constraint "season_by_position" UNIQUE using index "season_by_position";

alter table "public"."league_table" add constraint "season_by_team" UNIQUE using index "season_by_team";

alter table "public"."predictions" add constraint "predictions_usr_id_fkey" FOREIGN KEY (usr_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."predictions" validate constraint "predictions_usr_id_fkey";

alter table "public"."predictions" add constraint "unique_user_season" UNIQUE using index "unique_user_season";

alter table "public"."qualification_rules" add constraint "qualification_rules_by_season" UNIQUE using index "qualification_rules_by_season";

alter table "public"."scores" add constraint "score_by_prediction" UNIQUE using index "score_by_prediction";

alter table "public"."scores" add constraint "scores_prediction_id_fkey" FOREIGN KEY (prediction_id) REFERENCES public.predictions(id) ON DELETE CASCADE not valid;

alter table "public"."scores" validate constraint "scores_prediction_id_fkey";

alter table "public"."scores" add constraint "scores_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."scores" validate constraint "scores_user_id_fkey";

alter table "public"."teams" add constraint "team_by_season" UNIQUE using index "team_by_season";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_token_key" UNIQUE using index "users_token_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_scores(p_season text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ 
declare
  pred RECORD;
  rule record;
  v_base_score int;
  v_total int;
  v_breakdown jsonb;
  v_bonuses jsonb;
  predicted_pos int;
  team_name text;
  actual_row record;
  pos_diff int;
  team_points int;
  enriched_breakdown jsonb;
  predicted_teams_for_qual text[];
  actual_qual_teams text[];
  i int;
  entry jsonb;
  entry_team text;
  team_bonuses jsonb;
  overlap_count int;
begin
  if not exists(
    SELECT 1 
    FROM league_table
    WHERE season = p_season AND finalized = true
  )
  then 
    raise exception 'Season % has not completed / been finalized', p_season;
  end if;

  for pred in 
    select p.id, p.usr_id, p.prediction
    from predictions p
    where p.season = p_season and p.is_locked = true 
  loop
    v_base_score := 0;
    v_bonuses := '{}'::jsonb;
    v_breakdown := '[]'::jsonb;

    for predicted_pos IN 0..19 
    loop 
      team_name := p.prediction->>predicted_pos;

      select * into actual_row
      from league_table
      where season = p_season and team = team_name;

      pos_diff := abs((predicted_pos + 1) - (actual_row.position));
      team_points := case
      when pos_diff = 0 then 3
      when pos_diff = 1 then 2
      when pos_diff <= 3 then 1
      else 0
      end;

      v_base_score := v_base_score + team_points;

      v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
        'team', team_name,
        'predicted', predicted_pos + 1,
        'actual', actual_row.position,
        'points', team_points
      ));
    end loop;

    -- Compute bonus score
    for rule in 
      select * from qualification_rules where season = p_season
    loop
      select array_agg(pred.prediction->>(pos - 1))
      into predicted_teams_for_qual
      from unnest(rule.positions) as pos;

      select array_agg(team)
      into actual_qual_teams
      from league_table
      where season = p_season and position_bonus ? rule.qualification;

      select count(*)
      into overlap_count
      from unnest(predicted_teams_for_qual) as pt
      where pt=any(actual_qual_teams);

      if overlap_count > 0 then 
        v_bonuses := jsonb_set(v_bonuses, array[rule.qualification], to_jsonb(coalesce((v_bonuses->>rule.qualification)::int, 0)) + (overlap_count * rule.bonus_points));
      end if;
    end loop;

    -- enrich the breakdown entries with per-team bonus contributions (not optimal, move out later)
    enriched_breakdown := '[]'::jsonb;
    
    i := 0;
    while i < jsonb_array_length(v_breakdown) 
    loop
      entry := v_breakdown->i;
      entry_team := entry->>'team';
      team_bonuses := '{}'::jsonb;

      for rule in
        select * from qualification_rules where season = p_season
      loop 
        select array_agg(team)
        into actual_qual_teams
        from league_table
        where season = p_season and position_bonus ? rule.qualification;

        select array_agg(pred.prediction->>(pos - 1))
        into predicted_teams_for_qual
        from unnest(rule.positions) as pos;

        if entry_team = any(actual_qual_teams) AND entry_team = any(predicted_teams_for_qual) then
          team_bonuses := jsonb_set(
            team_bonuses,
            array[rule.qualification], to_jsonb(rule.bonus_points)
          );
        end if;
      end loop;

      if team_bonuses <> '{}'::jsonb then
        entry := entry || jsonb_build_object('bonuses', team_bonuses);
      end if;

      enriched_breakdown := enriched_breakdown || jsonb_build_array(entry);
      i := i + 1;
    end loop;

    v_breakdown := enriched_breakdown;

    -- compute total 
    select
      v_base_score + coalesce(sum(value::text::int), 0)
    into v_total
    from jsonb_each_text(v_bonuses);

    insert into scores(
      prediction_id, user_id, season,
      base_score, bonus, total_score, breakdown, calculated_at
    ) values (
      pred.id, pred.usr_id, p_season, v_base_score,
      v_bonuses, v_total, v_breakdown, now() 
    )
    on conflict (prediction_id) do update set
      base_score = excluded.base_score,
      bonus = excluded.bonus,
      total_score = excluded.total_score,
      breakdown = excluded.breakdown,
      calculated_at = now();
  end loop;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_prediction(p_token uuid, p_season text, p_prediction jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_user_id uuid;
  v_pred_id uuid;
begin

select id into v_user_id
from users 
where token = p_token;

if v_user_id is null then 
  raise exception 'Must sign-in to make a prediction';
end if;

insert into predictions (usr_id, season, prediction) 
  values (v_user_id, p_season, p_prediction)
on conflict (usr_id, season) do update set
  prediction = excluded.prediction,
  updated_at = now()
where predictions.is_locked = false
returning id into v_pred_id;

if v_pred_id is null then 
  raise exception 'Season %s is officially locked - cannot modify predictions', p_season;
end if;

return jsonb_build_object('prediction_id', v_pred_id);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_user(p_first_name text, p_last_name text, p_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
v_user_id uuid;
v_token uuid;
v_is_new boolean;
begin
p_email := lower(trim(p_email));

select id, token into v_user_id, v_token
from users where email = p_email;

if v_user_id is null then
insert into users (first_name, last_name, email) values (p_first_name, p_last_name, p_email)
returning id, token into v_user_id, v_token;
v_is_new := true;
else 
update users
set first_name = trim(p_first_name),
last_name = trim(p_last_name),
updated_at = now()
where id = v_user_id;
v_is_new := false;
end if;

return jsonb_build_object(
  'user_id', v_user_id,
  'token', v_token,
  'is_new', v_is_new
);
end;
$function$
;

grant delete on table "public"."league_table" to "anon";

grant insert on table "public"."league_table" to "anon";

grant references on table "public"."league_table" to "anon";

grant select on table "public"."league_table" to "anon";

grant trigger on table "public"."league_table" to "anon";

grant truncate on table "public"."league_table" to "anon";

grant update on table "public"."league_table" to "anon";

grant delete on table "public"."league_table" to "authenticated";

grant insert on table "public"."league_table" to "authenticated";

grant references on table "public"."league_table" to "authenticated";

grant select on table "public"."league_table" to "authenticated";

grant trigger on table "public"."league_table" to "authenticated";

grant truncate on table "public"."league_table" to "authenticated";

grant update on table "public"."league_table" to "authenticated";

grant delete on table "public"."league_table" to "service_role";

grant insert on table "public"."league_table" to "service_role";

grant references on table "public"."league_table" to "service_role";

grant select on table "public"."league_table" to "service_role";

grant trigger on table "public"."league_table" to "service_role";

grant truncate on table "public"."league_table" to "service_role";

grant update on table "public"."league_table" to "service_role";

grant delete on table "public"."predictions" to "anon";

grant insert on table "public"."predictions" to "anon";

grant references on table "public"."predictions" to "anon";

grant select on table "public"."predictions" to "anon";

grant trigger on table "public"."predictions" to "anon";

grant truncate on table "public"."predictions" to "anon";

grant update on table "public"."predictions" to "anon";

grant delete on table "public"."predictions" to "authenticated";

grant insert on table "public"."predictions" to "authenticated";

grant references on table "public"."predictions" to "authenticated";

grant select on table "public"."predictions" to "authenticated";

grant trigger on table "public"."predictions" to "authenticated";

grant truncate on table "public"."predictions" to "authenticated";

grant update on table "public"."predictions" to "authenticated";

grant delete on table "public"."predictions" to "service_role";

grant insert on table "public"."predictions" to "service_role";

grant references on table "public"."predictions" to "service_role";

grant select on table "public"."predictions" to "service_role";

grant trigger on table "public"."predictions" to "service_role";

grant truncate on table "public"."predictions" to "service_role";

grant update on table "public"."predictions" to "service_role";

grant delete on table "public"."qualification_rules" to "anon";

grant insert on table "public"."qualification_rules" to "anon";

grant references on table "public"."qualification_rules" to "anon";

grant select on table "public"."qualification_rules" to "anon";

grant trigger on table "public"."qualification_rules" to "anon";

grant truncate on table "public"."qualification_rules" to "anon";

grant update on table "public"."qualification_rules" to "anon";

grant delete on table "public"."qualification_rules" to "authenticated";

grant insert on table "public"."qualification_rules" to "authenticated";

grant references on table "public"."qualification_rules" to "authenticated";

grant select on table "public"."qualification_rules" to "authenticated";

grant trigger on table "public"."qualification_rules" to "authenticated";

grant truncate on table "public"."qualification_rules" to "authenticated";

grant update on table "public"."qualification_rules" to "authenticated";

grant delete on table "public"."qualification_rules" to "service_role";

grant insert on table "public"."qualification_rules" to "service_role";

grant references on table "public"."qualification_rules" to "service_role";

grant select on table "public"."qualification_rules" to "service_role";

grant trigger on table "public"."qualification_rules" to "service_role";

grant truncate on table "public"."qualification_rules" to "service_role";

grant update on table "public"."qualification_rules" to "service_role";

grant delete on table "public"."scores" to "anon";

grant insert on table "public"."scores" to "anon";

grant references on table "public"."scores" to "anon";

grant select on table "public"."scores" to "anon";

grant trigger on table "public"."scores" to "anon";

grant truncate on table "public"."scores" to "anon";

grant update on table "public"."scores" to "anon";

grant delete on table "public"."scores" to "authenticated";

grant insert on table "public"."scores" to "authenticated";

grant references on table "public"."scores" to "authenticated";

grant select on table "public"."scores" to "authenticated";

grant trigger on table "public"."scores" to "authenticated";

grant truncate on table "public"."scores" to "authenticated";

grant update on table "public"."scores" to "authenticated";

grant delete on table "public"."scores" to "service_role";

grant insert on table "public"."scores" to "service_role";

grant references on table "public"."scores" to "service_role";

grant select on table "public"."scores" to "service_role";

grant trigger on table "public"."scores" to "service_role";

grant truncate on table "public"."scores" to "service_role";

grant update on table "public"."scores" to "service_role";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "Public insert predictions"
  on "public"."predictions"
  as permissive
  for insert
  to public
with check (true);



  create policy "Public read predictions"
  on "public"."predictions"
  as permissive
  for select
  to public
using (true);



  create policy "Public read teams"
  on "public"."teams"
  as permissive
  for select
  to public
using (true);



