import {
  AssetProxy,
  Config,
  Credentials,
  Entry,
  Implementation,
  ImplementationEntry,
  ImplementationFile,
  ImplementationMediaFile,
  PersistOptions,
  UnpublishedEntry,
  User,
} from 'netlify-cms-lib-util/src';
import AuthenticationPage from './AuthenticationPage';
import supabase from './supabase';
import { createClient } from '@supabase/supabase-js';

type CONFIG = Omit<Config, 'backend'> & {
  backend: { url: string; supabaseKey: string };
};

export default class SupabaseBackendImplementation implements Implementation {
  supabase: any;

  constructor(config: CONFIG, options = {}) {
    this.supabase = createClient(
      config.backend.url,
      config.backend.supabaseKey
    );
  }

  authComponent() {
    const loginpage = AuthenticationPage.bind({
      onLogin: this.restoreUser,
      supabase: this.supabase,
    });
    return loginpage;
  }

  authenticate(credentials: Credentials): Promise<User> {
    const user = supabase.auth.user();
    if (user && user.id && user.email) {
      return Promise.resolve({
        ...credentials,
        backendName: user.id,
        login: user.email,
        name: user.email,
        useOpenAuthoring: true,
      });
    }
    return Promise.reject(new Error('Not authenticated'));
  }

  deleteFiles(paths: string[], commitMessage: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  deleteUnpublishedEntry(collection: string, slug: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  entriesByFiles(files: ImplementationFile[]): Promise<ImplementationEntry[]> {
    return Promise.resolve([]);
  }

  entriesByFolder(
    folder: string,
    extension: string,
    depth: number
  ): Promise<ImplementationEntry[]> {
    return Promise.resolve([]);
  }

  getDeployPreview(
    collectionName: string,
    slug: string
  ): Promise<{ url: string; status: string } | null> {
    return Promise.resolve(undefined);
  }

  getEntry(path: string): Promise<ImplementationEntry> {
    return Promise.resolve(undefined);
  }

  getMedia(folder: string | undefined): Promise<ImplementationMediaFile[]> {
    return Promise.resolve([]);
  }

  getMediaFile(path: string): Promise<ImplementationMediaFile> {
    return Promise.resolve(undefined);
  }

  getToken(): Promise<string | null> {
    return Promise.resolve(undefined);
  }

  logout(): Promise<void> | void | null {
    return undefined;
  }

  persistEntry(entry: Entry, opts: PersistOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  persistMedia(
    file: AssetProxy,
    opts: PersistOptions
  ): Promise<ImplementationMediaFile> {
    return Promise.resolve(undefined);
  }

  publishUnpublishedEntry(collection: string, slug: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  restoreUser(user: User): Promise<User> {
    return Promise.resolve(undefined);
  }

  status(): Promise<{
    auth: { status: boolean };
    api: { status: boolean; statusPage: string };
  }> {
    return Promise.resolve({
      api: { status: false, statusPage: '' },
      auth: { status: false },
    });
  }

  unpublishedEntries(): Promise<string[]> {
    return Promise.resolve([]);
  }

  unpublishedEntry(args: {
    id?: string;
    collection?: string;
    slug?: string;
  }): Promise<UnpublishedEntry> {
    return Promise.resolve(undefined);
  }

  unpublishedEntryDataFile(
    collection: string,
    slug: string,
    path: string,
    id: string
  ): Promise<string> {
    return Promise.resolve('');
  }

  unpublishedEntryMediaFile(
    collection: string,
    slug: string,
    path: string,
    id: string
  ): Promise<ImplementationMediaFile> {
    return Promise.resolve(undefined);
  }

  updateUnpublishedEntryStatus(
    collection: string,
    slug: string,
    newStatus: string
  ): Promise<void> {
    return Promise.resolve(undefined);
  }
}
