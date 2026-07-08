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
import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUserGroups } from '@/lib/api'

import { createApiKey, getApiKey, updateApiKey } from '../api'
import { DEFAULT_GROUP, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import { type ApiKey, type ApiKeyFormData } from '../types'
import { useApiKeys } from './api-keys-provider'

type ApiKeyMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ApiKey
}

const expiryOptions = [
  { value: 'never', label: '永不过期' },
  { value: '7', label: '7 天' },
  { value: '30', label: '30 天' },
  { value: '90', label: '90 天' },
  { value: '365', label: '365 天' },
]

function getExpiredTime(value: string) {
  if (value === 'never') return -1
  const days = Number(value)
  const date = new Date()
  date.setDate(date.getDate() + days)
  return Math.floor(date.getTime() / 1000)
}

export function ApiKeysMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ApiKeyMutateDrawerProps) {
  const { t } = useTranslation()
  const isUpdate = !!currentRow
  const { triggerRefresh } = useApiKeys()
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('never')
  const [group, setGroup] = useState(DEFAULT_GROUP)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [groups, setGroups] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    if (!open) return

    getUserGroups().then((result) => {
      if (!result.success || !result.data) return
      const options = Object.entries(result.data).map(([key, info]) => ({
        value: key,
        label: info.desc || key,
      }))
      setGroups(options)
      if (options.length > 0 && !options.some((item) => item.value === group)) {
        setGroup(options[0].value)
      }
    })
  }, [open, group])

  useEffect(() => {
    if (!open) return

    if (isUpdate && currentRow) {
      setName(currentRow.name)
      setGroup(currentRow.group || DEFAULT_GROUP)
      setExpiry('never')
      getApiKey(currentRow.id).then((result) => {
        if (!result.success || !result.data) return
        setName(result.data.name)
        setGroup(result.data.group || DEFAULT_GROUP)
      })
      return
    }

    setName('')
    setExpiry('never')
    setGroup(groups[0]?.value || DEFAULT_GROUP)
  }, [open, isUpdate, currentRow, groups])

  const selectedGroupLabel = useMemo(
    () => groups.find((item) => item.value === group)?.label || group,
    [groups, group]
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('请输入密钥名称')
      return
    }

    const payload: ApiKeyFormData = {
      name: trimmedName,
      remain_quota: 0,
      expired_time: getExpiredTime(expiry),
      unlimited_quota: true,
      model_limits_enabled: false,
      model_limits: '',
      allow_ips: '',
      group,
      cross_group_retry: group === 'auto',
    }

    setIsSubmitting(true)
    try {
      const result = isUpdate && currentRow
        ? await updateApiKey({ ...payload, id: currentRow.id })
        : await createApiKey(payload)

      if (result.success) {
        toast.success(
          isUpdate
            ? t(SUCCESS_MESSAGES.API_KEY_UPDATED)
            : t(SUCCESS_MESSAGES.API_KEY_CREATED)
        )
        onOpenChange(false)
        triggerRefresh()
        return
      }

      toast.error(
        result.message ||
          t(isUpdate ? ERROR_MESSAGES.UPDATE_FAILED : ERROR_MESSAGES.CREATE_FAILED)
      )
    } catch {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='w-[min(92vw,516px)] max-w-none rounded-lg bg-white p-0 shadow-xl ring-0'
      >
        <form onSubmit={handleSubmit}>
          <div className='flex items-center justify-between px-8 pt-8 pb-5'>
            <DialogTitle className='text-xl font-semibold text-slate-950'>
              {isUpdate ? '编辑密钥' : '创建新密钥'}
            </DialogTitle>
            <DialogClose render={<Button type='button' variant='ghost' size='icon' />}>
              <X className='size-5 text-slate-500' />
            </DialogClose>
          </div>

          <div className='space-y-5 px-8 pb-7'>
            <label className='block space-y-2'>
              <span className='text-[15px] font-medium text-slate-900'>
                <span className='text-red-500'>* </span>密钥名称
              </span>
              <div className='relative'>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value.slice(0, 50))}
                  placeholder='请输入密钥名称'
                  className='h-11 rounded-md border-slate-200 bg-white pr-14 text-[15px]'
                />
                <span className='absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400'>
                  {name.length}/50
                </span>
              </div>
            </label>

            <label className='block space-y-2'>
              <span className='text-[15px] font-medium text-slate-900'>
                <span className='text-red-500'>* </span>过期时间
              </span>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger className='h-11 w-full rounded-md border-slate-200 bg-white text-[15px]'>
                  <SelectValue placeholder='请选择过期时间' />
                </SelectTrigger>
                <SelectContent>
                  {expiryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className='block space-y-2'>
              <span className='text-[15px] font-medium text-slate-900'>
                <span className='text-red-500'>* </span>权限级别
              </span>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger className='h-11 w-full rounded-md border-slate-200 bg-white text-[15px]'>
                  <SelectValue placeholder='请选择权限级别'>{selectedGroupLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {groups.length === 0 ? (
                    <SelectItem value={DEFAULT_GROUP}>默认权限</SelectItem>
                  ) : (
                    groups.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </label>
          </div>

          <div className='flex justify-end gap-3 px-8 pb-8'>
            <DialogClose
              render={
                <Button
                  type='button'
                  variant='outline'
                  className='h-11 min-w-32 border-0 bg-slate-100 text-base text-slate-900 hover:bg-slate-200'
                />
              }
            >
              取消
            </DialogClose>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='h-11 min-w-34 bg-blue-600 text-base hover:bg-blue-700'
            >
              {isUpdate ? '确认保存' : '确认创建'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
