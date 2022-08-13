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
import { createClient } from '@supabase/supabase-js';
import { uuid } from '@supabase/supabase-js/dist/main/lib/helpers';
import { AuthenticationPage } from '@nelify-cms-supabase-backend/netlify-supabase-backend';

type CONFIG = Omit<Config, 'backend'> & {
  backend: { url: string; supabaseKey: string; bucket: string };
};

export default class SupabaseBackendImplementation implements Implementation {
  supabase: any;
  BUCKET_ID = '';

  constructor(config: CONFIG, options = {}) {
    this.supabase = createClient(
      config.backend.url,
      config.backend.supabaseKey
    );
    this.BUCKET_ID = config.backend.bucket;
  }

  authComponent() {
    return AuthenticationPage;
    // return ()=>(AuthenticationPage({onLogin:this.authenticate.bind(this),supabase:this.supabase.bind(this)}))

    // return {
    //   type: AuthenticationPage,
    //   props: {
    //
    //   }
    // };
  }

  async authenticate(credentials: Credentials): Promise<User> {
    if (!credentials.refresh_token) {
      throw new Error('Login Failed');
    }
    await this.supabase.auth.setSession(credentials.refresh_token);
    const user = this.supabase.auth.user();
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

  async deleteFiles(paths: string[], commitMessage: string): Promise<void> {
    console.log('deleteFiles', paths, commitMessage);
    const { error } = await this.supabase.storage
      .from(this.BUCKET_ID)
      .remove(paths);
    if (error) {
      return Promise.reject(error);
    }
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

  async getMedia(
    folder: string | undefined
  ): Promise<ImplementationMediaFile[]> {
    const { data: files, error } = await this.supabase.storage
      .from(this.BUCKET_ID)
      .list();
    const response: ImplementationMediaFile[] = [];
    if (error) {
      return Promise.reject(error);
    }

    if (!files) {
      return Promise.resolve([]);
    }

    for (const file of files) {
      const data = await this.supabase.storage
        .from(this.BUCKET_ID)
        .createSignedUrl(file.name, 60);
      response.push({
        name: file.name,
        id: file.id,
        // @ts-ignore
        size: file.metadata.size,
        displayURL: data.signedURL,
        path: file.name,
        draft: false,
        url: data.signedURL,
      } as ImplementationMediaFile);
    }
    return Promise.resolve(response);
  }

  async getMediaFile(path: string): Promise<ImplementationMediaFile> {
    const file = await this.supabase.storage
      .from(this.BUCKET_ID)
      .createSignedUrl(path, 60);
    console.log('getMediaFile', path, file);
    return {
      name: 'name',
      id: path,
      size: 123,
      displayURL: file.signedURL,
      path: 'file.$id',
      draft: false,
      url: file.signedURL,
    } as ImplementationMediaFile;
  }

  getToken(): Promise<string | null> {
    return Promise.resolve(undefined);
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    return Promise.resolve();
  }

  persistEntry(entry: Entry, opts: PersistOptions): Promise<void> {
    return Promise.resolve(undefined);
  }

  async persistMedia(
    file: AssetProxy,
    opts: PersistOptions
  ): Promise<ImplementationMediaFile> {
    if (file.fileObj) {
      const filePath = `${uuid()}.${file.fileObj.name.split('.').pop()}`;

      const { data: uploadedData, error: uploadError } =
        await this.supabase.storage
          .from(this.BUCKET_ID)
          .upload(filePath, file.fileObj);

      if (uploadError) {
        return Promise.reject(uploadError);
      }
      if (!uploadedData) {
        return Promise.resolve(new Error('No data returned from upload'));
      }
      const { error, data, signedURL } = await this.supabase.storage
        .from(this.BUCKET_ID)
        .createSignedUrl(filePath, 60);
      if (error) {
        return Promise.reject(error);
      }
      return {
        name: filePath,
        id: data?.signedURL,
        size: 123,
        displayURL: signedURL,
        path: filePath,
        draft: false,
        url: signedURL,
      } as ImplementationMediaFile;
    }
    return Promise.reject(new Error('No file object'));
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
