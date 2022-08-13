import dynamic from 'next/dynamic';
import config from '../cms/config';
import { SupaBaseBackendImplementation } from '@nelify-cms-supabase-backend/netlify-supabase-backend';

const CMS = dynamic(
  () =>
    import('netlify-cms-app').then(({ default: cms }) => {
      cms.registerBackend('supabase', SupaBaseBackendImplementation);
      cms.init({ config });
    }) as any,
  { ssr: false, loading: () => <p>Loading...</p> }
);
const AdminPage: React.FC = () => {
  return <CMS />;
};
export default AdminPage;
