/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Copy, RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { copyToClipboard } from '@/lib/copy-to-clipboard'
import { formatTimestampToDate } from '@/lib/format'
import { cn } from '@/lib/utils'

import { getApiKeys, searchApiKeys, updateApiKeyStatus } from '../api'
import { API_KEY_STATUS, ERROR_MESSAGES } from '../constants'
import { type ApiKey } from '../types'
import { ApiKeyCell } from './api-keys-cells'
import { useApiKeys } from './api-keys-provider'
import { DataTableRowActions } from './data-table-row-actions'

const route = getRouteApi('/_authenticated/keys/')

type BriefApiKeyColumn = ColumnDef<ApiKey> & {
  key?: keyof ApiKey | 'actions' | 'apiKey'
}

const briefColumns: BriefApiKeyColumn[] = [
  { key: 'name', header: '密钥名称' },
  { key: 'apiKey', header: '密钥' },
  { key: 'created_time', header: '创建时间' },
  { key: 'accessed_time', header: '最近使用' },
  { key: 'status', header: '状态' },
  { key: 'actions', header: '操作' },
]

function BriefPagination({
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = pageIndex + 1

  return (
    <div className='flex flex-wrap items-center justify-between gap-3 px-0 py-4 text-sm text-slate-600'>
      <div>共 {total} 条</div>
      <div className='flex items-center gap-3'>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className='h-9 w-[104px] rounded-md border-slate-200 bg-white'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='10'>10 条/页</SelectItem>
            <SelectItem value='20'>20 条/页</SelectItem>
            <SelectItem value='50'>50 条/页</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type='button'
          variant='outline'
          size='icon'
          className='size-9 border-slate-200 bg-white'
          disabled={currentPage <= 1}
          onClick={() => onPageChange(pageIndex - 1)}
        >
          <ChevronLeft className='size-4' />
        </Button>
        <Button type='button' className='size-9 bg-blue-600 px-0 hover:bg-blue-700'>
          {currentPage}
        </Button>
        <Button
          type='button'
          variant='outline'
          size='icon'
          className='size-9 border-slate-200 bg-white'
          disabled={currentPage >= pageCount}
          onClick={() => onPageChange(pageIndex + 1)}
        >
          <ChevronRight className='size-4' />
        </Button>

        <span>前往</span>
        <Input
          value={currentPage}
          onChange={(event) => {
            const value = Number(event.target.value)
            if (!Number.isFinite(value)) return
            const nextPage = Math.min(Math.max(value, 1), pageCount)
            onPageChange(nextPage - 1)
          }}
          className='h-9 w-16 border-slate-200 bg-white text-center'
        />
        <span>页</span>
      </div>
    </div>
  )
}

export function ApiKeysTable() {
  const { t } = useTranslation()
  const { refreshTrigger, triggerRefresh } = useApiKeys()
  const {
    globalFilter,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
  })

  const shouldSearch = Boolean(globalFilter?.trim())

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'keys',
      pagination.pageIndex + 1,
      pagination.pageSize,
      globalFilter,
      refreshTrigger,
    ],
    queryFn: async () => {
      const result = shouldSearch
        ? await searchApiKeys({
            keyword: globalFilter,
            p: pagination.pageIndex + 1,
            size: pagination.pageSize,
          })
        : await getApiKeys({
            p: pagination.pageIndex + 1,
            size: pagination.pageSize,
          })

      if (!result.success) {
        toast.error(result.message || t(ERROR_MESSAGES.LOAD_FAILED))
        return { items: [], total: 0 }
      }

      const payload = {
        items: result.data?.items || [],
        total: result.data?.total || 0,
      }
      ensurePageInRange(payload.total)
      return payload
    },
    placeholderData: (previousData) => previousData,
  })

  const apiKeys = data?.items || []
  const total = data?.total || 0

  const handleStatusChange = async (apiKey: ApiKey, checked: boolean) => {
    const result = await updateApiKeyStatus(
      apiKey.id,
      checked ? API_KEY_STATUS.ENABLED : API_KEY_STATUS.DISABLED
    )
    if (result.success) {
      triggerRefresh()
      return
    }
    toast.error(result.message || t(ERROR_MESSAGES.STATUS_UPDATE_FAILED))
  }

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div
        className={cn(
          'min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm',
          isFetching && !isLoading && 'opacity-70'
        )}
      >
        <div className='h-full overflow-auto'>
          <Table>
            <TableHeader className='bg-slate-50 [&_tr]:border-slate-200'>
              <TableRow className='hover:bg-slate-50'>
                {briefColumns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className='h-12 px-6 text-[15px] font-medium text-slate-900'
                  >
                    {String(column.header)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pagination.pageSize }).map((_, index) => (
                  <TableRow key={index} className='h-[68px]'>
                    <TableCell colSpan={briefColumns.length} className='px-6'>
                      <div className='h-4 w-full max-w-3xl animate-pulse rounded bg-slate-100' />
                    </TableCell>
                  </TableRow>
                ))
              ) : apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={briefColumns.length}
                    className='h-56 text-center text-slate-500'
                  >
                    暂无 API 密钥
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((apiKey) => {
                  const enabled = apiKey.status === API_KEY_STATUS.ENABLED
                  return (
                    <TableRow key={apiKey.id} className='h-[68px] border-slate-200'>
                      <TableCell className='px-6 text-[15px] font-medium text-slate-900'>
                        {apiKey.name}
                      </TableCell>
                      <TableCell className='px-6 text-[15px] text-slate-900'>
                        <ApiKeyCell apiKey={apiKey} />
                      </TableCell>
                      <TableCell className='px-6 text-[15px] text-slate-900'>
                        {formatTimestampToDate(apiKey.created_time)}
                      </TableCell>
                      <TableCell className='px-6 text-[15px] text-slate-900'>
                        {apiKey.accessed_time
                          ? formatTimestampToDate(apiKey.accessed_time)
                          : '-'}
                      </TableCell>
                      <TableCell className='px-6'>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) =>
                            void handleStatusChange(apiKey, checked)
                          }
                          className='data-[state=checked]:bg-blue-600'
                        />
                      </TableCell>
                      <TableCell className='px-6'>
                        <div className='flex items-center gap-5 text-slate-500'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='size-8 hover:text-blue-600'
                            onClick={async () => {
                              const ok = await copyToClipboard(`sk-${apiKey.key}`)
                              if (ok) toast.success('已复制')
                            }}
                          >
                            <Copy className='size-5' />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='size-8 hover:text-blue-600'
                            onClick={triggerRefresh}
                          >
                            <RefreshCw className='size-5' />
                          </Button>
                          <DataTableRowActions
                            row={{ original: apiKey } as Parameters<
                              typeof DataTableRowActions<ApiKey>
                            >[0]['row']}
                            renderMode='delete-only'
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <BriefPagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        total={total}
        onPageChange={(pageIndex) =>
          onPaginationChange({ pageIndex, pageSize: pagination.pageSize })
        }
        onPageSizeChange={(pageSize) =>
          onPaginationChange({ pageIndex: 0, pageSize })
        }
      />
    </div>
  )
}
