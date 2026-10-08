-- Run as postgres in Supabase SQL Editor after 011. Supabase Cron/pg_cron required.
create extension if not exists pg_cron;
select cron.schedule('sahd-purge-expired-trash','*/15 * * * *','select public.purge_expired_trash();');
-- Inspect: select jobid,jobname,schedule,active from cron.job where jobname='sahd-purge-expired-trash';
-- Records become non-restorable at the exact deadline; purge runs every 15 minutes.
