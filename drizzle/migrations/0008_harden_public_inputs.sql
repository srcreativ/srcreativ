drop policy if exists "Anyone sends inquiry" on public.inquiries;
create policy "Anyone sends validated inquiry" on public.inquiries for insert to anon, authenticated
with check (
  char_length(name) between 1 and 100
  and char_length(email) between 3 and 255
  and position('@' in email) > 1
  and (phone is null or char_length(phone) <= 30)
  and (location is null or char_length(location) <= 150)
  and cardinality(services) between 1 and 8
  and (message is null or char_length(message) <= 1000)
  and (wedding_date is null or wedding_date >= current_date)
);
