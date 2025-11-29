import { Wrench } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { filterByName } from '../filters/custom-filters';
import { buildUrl } from '@utils/url-builder';
import { createBadgesColumn } from './SharedColumns';
import type { TData } from '../Table';
import type { TableConfiguration } from '@types';
const columnHelper = createColumnHelper<TData<'technologies'>>();

export const columns = (tableConfiguration: TableConfiguration) => [
  columnHelper.accessor('data.name', {
    id: 'name',
    header: () => <span>{tableConfiguration.columns?.name?.label || 'Technology'}</span>,
    cell: (info) => {
      const technologyRaw = info.row.original;
      const color = 'purple';
      return (
        <div className="group font-light">
          <a
            href={buildUrl(`/docs/${technologyRaw.collection}/${technologyRaw.data.id}/${technologyRaw.data.version}`)}
            className={`group-hover:text-${color}-500 flex space-x-1 items-center`}
          >
            <div className={`flex items-center border border-gray-300 shadow-sm rounded-md group-hover:border-${color}-400`}>
              <span className="flex items-center">
                <span className={`bg-${color}-500 group-hover:bg-${color}-600 h-full rounded-tl rounded-bl p-1`}>
                  <Wrench className="h-4 w-4 text-white" />
                </span>
                <span className="leading-none px-2 group-hover:underline group-hover:text-primary">
                  {technologyRaw.data.name} (v{technologyRaw.data.version})
                </span>
              </span>
            </div>
          </a>
        </div>
      );
    },
    meta: {
      filterVariant: 'name',
    },
    filterFn: filterByName,
  }),
  columnHelper.accessor('data.summary', {
    id: 'summary',
    header: () => <span>{tableConfiguration.columns?.summary?.label || 'Summary'}</span>,
    cell: (info) => (
      <span className="font-light ">
        {info.renderValue()} {info.row.original.data.draft ? ' (Draft)' : ''}
      </span>
    ),
    footer: (info) => info.column.id,
    meta: {
      showFilter: false,
      className: 'max-w-md',
    },
  }),
  columnHelper.accessor('data.supportedVersions', {
    id: 'supportedVersions',
    header: () => <span>Supported Versions</span>,
    cell: (info) => {
      const versions = info.getValue() || [];
      return (
        <span className="font-light">
          {versions.length > 0 ? `${versions.length} version${versions.length > 1 ? 's' : ''}` : 'N/A'}
        </span>
      );
    },
    meta: {
      showFilter: false,
    },
  }),
  columnHelper.accessor('data.radar', {
    id: 'radar',
    header: () => <span>Radar</span>,
    cell: (info) => {
      const radar = info.getValue();
      if (!radar) return <span className="font-light text-gray-400">-</span>;
      return (
        <div className="flex flex-col gap-1">
          <span className="font-light capitalize">{radar.quadrant}</span>
          <span className="text-xs text-gray-500 capitalize">{radar.adoption}</span>
        </div>
      );
    },
    meta: {
      showFilter: false,
    },
  }),
  createBadgesColumn(columnHelper, tableConfiguration),
];

