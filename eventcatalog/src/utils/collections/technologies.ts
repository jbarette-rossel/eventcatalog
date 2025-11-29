import { sortVersioned } from '@utils/collections/util';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import path from 'path';
const PROJECT_DIR = process.env.PROJECT_DIR || process.cwd();
import utils from '@eventcatalog/sdk';

export type Technology = CollectionEntry<'technologies'>;

interface Props {
  getAllVersions?: boolean;
}

// Cache for build time
let cachedTechnologies: Record<string, Technology[]> = {
  allVersions: [],
  currentVersions: [],
};

export const getTechnologies = async ({ getAllVersions = true }: Props = {}): Promise<Technology[]> => {
  const cacheKey = getAllVersions ? 'allVersions' : 'currentVersions';

  // Check if we have cached technologies for this specific getAllVersions value
  if (cachedTechnologies[cacheKey].length > 0) {
    return cachedTechnologies[cacheKey];
  }

  // Get technologies
  const technologies = await getCollection('technologies', (technology) => {
    return getAllVersions || !technology.filePath?.includes('versioned');
  });

  cachedTechnologies[cacheKey] = await Promise.all(
    technologies.map(async (technology) => {
      const allVersionsForItem = technologies.filter((t) => t.data.id === technology.data.id);
      const allVersions = allVersionsForItem.map((t) => t.data.version);
      const uniqueVersions = [...new Set(allVersions)];
      const sortedVersions = sortVersioned(uniqueVersions, (v) => v);
      const latestVersion = sortedVersions[0];
      const versions = sortedVersions;

      const { getResourceFolderName } = utils(process.env.PROJECT_DIR ?? '');
      const folderName = await getResourceFolderName(
        process.env.PROJECT_DIR ?? '',
        technology.data.id,
        technology.data.version.toString()
      );
      const technologyFolderName = folderName ?? technology.id.replace(`-${technology.data.version}`, '');

      return {
        ...technology,
        data: {
          ...technology.data,
          versions,
          latestVersion,
        },
        catalog: {
          // TODO: avoid use string replace at path due to win32
          path: path.join(technology.collection, technology.id.replace('/index.mdx', '')),
          absoluteFilePath: path.join(PROJECT_DIR, technology.collection, technology.id.replace('/index.mdx', '/index.md')),
          astroContentFilePath: path.join(process.cwd(), 'src', 'content', technology.collection, technology.id),
          filePath: path.join(process.cwd(), 'src', 'catalog-files', technology.collection, technology.id.replace('/index.mdx', '')),
          // technology will be javascript-0.0.1 remove the version
          publicPath: path.join('/generated', technology.collection, technologyFolderName),
          type: 'technology',
        },
      };
    })
  );

  // order them by the name of the technology
  cachedTechnologies[cacheKey].sort((a, b) => {
    return (a.data.name || a.data.id).localeCompare(b.data.name || b.data.id);
  });

  return cachedTechnologies[cacheKey];
};
