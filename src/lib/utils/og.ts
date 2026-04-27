import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants/config';

type OgMetaOptions = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

export const buildOgMeta = ({
  title = APP_NAME,
  description = APP_DESCRIPTION,
  image,
  url,
}: OgMetaOptions = {}) => ({
  title,
  description,
  openGraph: {
    title,
    description,
    ...(url && { url }),
    ...(image && { images: [{ url: image }] }),
  },
  twitter: {
    card: 'summary_large_image' as const,
    title,
    description,
    ...(image && { images: [image] }),
  },
});
