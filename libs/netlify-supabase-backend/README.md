# netlify-supabase-backend

This library was generated with [Nx](https://nx.dev).

## create bucket

```sql
INSERT INTO storage.buckets (id, name)
VALUES ('bucketid', 'bucketname');
```

### insert policy

```sql
CREATE POLICY "Give users authenticated uplaod acces for cms"
    ON storage.objects
    FOR INSERT WITH CHECK (auth.role()='authenticated'::text);
```

### read policy

```sql
CREATE POLICY "Give users authenticated access to bucket"
    ON storage.objects
    FOR SELECT TO PUBLIC USING (bucket_id = 'bucketid');
```

### delete policy

```sql
create policy "Give users authenticated delete access for cms"
on storage.objects for delete
using (
  bucket_id = 'bucketid'
  and auth.role() = 'authenticated'
);
```

## CMS Database

```sql
CREATE TABLE public.cms_data (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    path text NOT NULL,
    data jsonb NOT NULL,
    slug text NOT NULL UNIQUE,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT cms_folders_pkey PRIMARY KEY (id)
);
```

### cms insert policy

```sql
CREATE POLICY "Give users authenticated insert access for cms"
  ON public.cms_data
  FOR INSERT WITH CHECK (auth.role()='authenticated'::text);
```

### cms update policy

```sql
CREATE POLICY "Give users authenticated update access for cms"
  ON public.cms_data
  FOR UPDATE WITH CHECK (auth.role()='authenticated'::text);
```

### cms update policy

```sql
CREATE POLICY "Give users authenticated delete access for cms"
  ON public.cms_data
  FOR DELETE WITH CHECK (auth.role()='authenticated'::text);
```

[//]: # 'TODO: add a policy for autheticated read of preview/draft data'
