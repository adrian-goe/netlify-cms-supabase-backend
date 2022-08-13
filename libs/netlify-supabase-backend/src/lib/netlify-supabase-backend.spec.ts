import { netlifySupabaseBackend } from './netlify-supabase-backend';

describe('netlifySupabaseBackend', () => {
  it('should work', () => {
    expect(netlifySupabaseBackend()).toEqual('netlify-supabase-backend');
  });
});
