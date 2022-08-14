import { InitOptions } from 'netlify-cms-core';

export default {
  // cms_manual_init: true,
  backend: {
    name: 'supabase' as any,
    url: '',
    supabaseKey: '',
    bucket: '',
    databaseTable: '',
  },
  media_folder: 'public/img',
  public_folder: 'img',
  publish_mode: 'simple',
  collections: [
    {
      name: 'pages',
      label: 'Pages',
      folder: 'pages',
      create: true,
      identifier_field: 'hero_title',
      format: 'json',
      extension: 'json',
      fields: [
        {
          label: 'Hero Title',
          name: 'hero_title',
          widget: 'string',
        },
      ],
    },
  ],
} as InitOptions['config'];
