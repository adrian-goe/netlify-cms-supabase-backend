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
  backend: {
    url: string;
    supabaseKey: string;
    bucket: string;
    databaseTable: string;
  };
};

export default class SupabaseBackendImplementation implements Implementation {
  supabase: any;
  BUCKET_ID = '';
  DATABASE_TABLE = '';
  API_URL = '';

  constructor(config: CONFIG, options = {}) {
    this.supabase = createClient(
      config.backend.url,
      config.backend.supabaseKey
    );
    this.BUCKET_ID = config.backend.bucket;
    this.DATABASE_TABLE = config.backend.databaseTable;
    this.API_URL = config.backend.url;
  }

  authComponent() {
    return AuthenticationPage;
  }

  async authenticate(credentials: Credentials): Promise<User> {
    if (!credentials.refresh_token) {
      throw new Error('Login Failed');
    }
    await this.supabase.auth.setSession(credentials.refresh_token);
    const { user, error } = await this.supabase.auth.getUser();
    if (error) {
      return Promise.reject(new Error('Not authenticated'));
    }
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
    const entriesExtensions = ['json', 'yml', 'yaml'];
    const regex = new RegExp(/.*(json|yml|yaml|md|mdx)$/gm);

    const deleteEntries = paths.filter((path) => regex.test(path));
    if (deleteEntries) {
      for (const path of deleteEntries) {
        await this.supabase.from(this.DATABASE_TABLE).delete().match({ path });
      }
      if (deleteEntries.length === paths.length) {
        return Promise.resolve(undefined);
      }
    }

    const deleteMedia = paths.filter(
      (singlePath) => !deleteEntries.includes(singlePath)
    );
    const { error } = await this.supabase.storage
      .from(this.BUCKET_ID)
      .remove(deleteMedia);
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

  async entriesByFolder(
    folder: string,
    extension: string,
    depth: number
  ): Promise<ImplementationEntry[]> {
    const { data, error } = await this.supabase
      .from(this.DATABASE_TABLE)
      .select('id,data,path')
      .filter('path', 'like', `${folder}%`);
    if (error) {
      return Promise.reject(error);
    }
    return Promise.resolve(
      data.map((entry: { id: string; data: string; path: string }) => ({
        data: entry.data,
        file: {
          path: entry.path,
          id: entry.id,
        },
      }))
    );
  }

  getDeployPreview(
    collectionName: string,
    slug: string
  ): Promise<{ url: string; status: string } | null> {
    return Promise.resolve(undefined);
  }

  async getEntry(path: string): Promise<ImplementationEntry> {
    const { data, error } = await this.supabase
      .from(this.DATABASE_TABLE)
      .select('id,data,path')
      .eq('path', path);
    if (!data || error) {
      return Promise.reject(error);
    }
    return Promise.resolve({
      data: data[0].data,
      file: {
        path: path,
        id: data[0].data.id,
      },
    });
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
      const { data } = await this.supabase.storage
        .from(this.BUCKET_ID)
        .createSignedUrl(file.name, 3600);

      response.push({
        name: file.name,
        id: file.id,
        // @ts-ignore
        size: file.metadata.size,
        displayURL: data.signedUrl,
        path: file.name,
        draft: false,
        url: data.signedUrl,
      } as ImplementationMediaFile);
    }
    return Promise.resolve(response);
  }

  async getMediaFile(path: string): Promise<ImplementationMediaFile> {
    const { data: signedFile } = await this.supabase.storage
      .from(this.BUCKET_ID)
      .createSignedUrl(path, 3600);

    return {
      name: 'name',
      id: path,
      size: 123,
      displayURL: signedFile.signedUrl,
      path: path,
      draft: false,
      url: signedFile.signedUrl,
    } as ImplementationMediaFile;
  }

  getToken(): Promise<string | null> {
    return Promise.resolve(undefined);
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    return Promise.resolve();
  }

  async persistEntry(entry: Entry, opts: PersistOptions): Promise<void> {
    console.log('persistEntry', entry, opts);
    const databaseEntry = {
      data: entry.dataFiles[0].raw,
      path: entry.dataFiles[0].newPath ?? entry.dataFiles[0].path,
      slug: entry.dataFiles[0].slug,
    };

    if (opts.newEntry) {
      const { error } = await this.supabase
        .from(this.DATABASE_TABLE)
        .insert(databaseEntry);
      if (error) {
        console.log('error', error);
        return Promise.reject(error);
      }
    } else {
      const { data, error } = await this.supabase
        .from(this.DATABASE_TABLE)
        .update(databaseEntry)
        .match({ slug: databaseEntry.slug });
      if (!data || error) {
        return Promise.reject(error);
      }
    }
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
      const { error, data } = await this.supabase.storage
        .from(this.BUCKET_ID)
        .createSignedUrl(filePath, 60);
      if (error) {
        return Promise.reject(error);
      }
      return {
        name: filePath,
        id: data?.signedUrl,
        size: uploadedData.size,
        displayURL: data.signedUrl,
        path: filePath,
        draft: false,
        url: data.signedUrl,
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
