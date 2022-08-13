# netlify-supabase-backend

This library was generated with [Nx](https://nx.dev).

## create bucket

```sql
INSERT INTO storage.buckets (id, name)
VALUES ('bucketid', 'bucketname');
```

```sql

CREATE POLICY "Give users authenticated uplaod acces for cms"
    ON storage.objects
    FOR INSERT WITH CHECK (auth.role()='authenticated'::text);

CREATE POLICY "Give users authenticated access to bucket"
    ON storage.objects
    FOR SELECT TO PUBLIC USING (bucket_id = 'bucketid');
```

```sql
create policy "Give users authenticated delete access for cms"
on storage.objects for delete
using (
  bucket_id = 'bucketid'
  and auth.role() = 'authenticated'
);

```
