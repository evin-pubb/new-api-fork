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
import { Check, ChevronLeft, ChevronRight, Copy, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Dialog } from '@/components/dialog'
import { SectionPageLayout } from '@/components/layout'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatCurrencyFromUSD } from '@/lib/currency'
import { formatNumber } from '@/lib/format'

import { useBillingHistory } from '../wallet/hooks/use-billing-history'
import {
  formatTimestamp,
  getPaymentMethodName,
  getStatusConfig,
} from '../wallet/lib/billing'
import type { TopupRecord } from '../wallet/types'

export function InvoiceManagement() {
  const { t } = useTranslation()
  const {
    records,
    total,
    page,
    pageSize,
    keyword,
    loading,
    isAdmin,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
  } = useBillingHistory()
  const { copyToClipboard, copiedText } = useCopyToClipboard({ notify: false })
  const [invoiceRecord, setInvoiceRecord] = useState<TopupRecord | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <>
      <SectionPageLayout>
        <SectionPageLayout.Title>发票管理</SectionPageLayout.Title>
        <SectionPageLayout.Content>
          <Card data-card-hover='false' className='mx-auto w-full max-w-7xl'>
            <CardHeader className='border-b p-4 sm:p-5'>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                <div>
                  <h2 className='text-lg font-semibold'>订单列表</h2>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    选择已支付订单并提交开票信息
                  </p>
                </div>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                  <div className='relative w-full sm:w-72'>
                    <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                      placeholder='搜索订单号...'
                      value={keyword}
                      onChange={(event) => handleSearch(event.target.value)}
                      className='h-9 pl-10'
                    />
                  </div>
                  <Select
                    items={[
                      { value: '10', label: '10 条/页' },
                      { value: '20', label: '20 条/页' },
                      { value: '50', label: '50 条/页' },
                      { value: '100', label: '100 条/页' },
                    ]}
                    value={pageSize.toString()}
                    onValueChange={(value) =>
                      value !== null && handlePageSizeChange(parseInt(value))
                    }
                  >
                    <SelectTrigger className='h-9 w-full sm:w-32'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectItem value='10'>10 条/页</SelectItem>
                        <SelectItem value='20'>20 条/页</SelectItem>
                        <SelectItem value='50'>50 条/页</SelectItem>
                        <SelectItem value='100'>100 条/页</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className='p-0'>
              {loading ? (
                <div className='space-y-3 p-4 sm:p-5'>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className='h-12 w-full' />
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className='text-muted-foreground flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center'>
                  <p className='text-sm font-medium'>暂无订单记录</p>
                  <p className='mt-1 text-xs'>
                    {keyword
                      ? '请调整搜索条件后重试'
                      : '订单记录会显示在这里'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/40 hover:bg-muted/40'>
                      <TableHead className='px-4'>订单号</TableHead>
                      {isAdmin && <TableHead>用户 ID</TableHead>}
                      <TableHead>创建时间</TableHead>
                      <TableHead>支付方式</TableHead>
                      <TableHead>充值额度</TableHead>
                      <TableHead>实付金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className='px-4 text-right'>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => {
                      const statusConfig = getStatusConfig(record.status)
                      return (
                        <TableRow key={record.id}>
                          <TableCell className='px-4'>
                            <div className='flex min-w-52 items-center gap-2'>
                              <code className='truncate font-mono text-sm'>
                                {record.trade_no}
                              </code>
                              <Button
                                variant='ghost'
                                size='icon-xs'
                                onClick={() => copyToClipboard(record.trade_no)}
                              >
                                {copiedText === record.trade_no ? (
                                  <Check className='h-3 w-3' />
                                ) : (
                                  <Copy className='h-3 w-3' />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <StatusBadge
                                label={String(record.user_id)}
                                variant='neutral'
                                size='sm'
                                copyText={String(record.user_id)}
                              />
                            </TableCell>
                          )}
                          <TableCell>{formatTimestamp(record.create_time)}</TableCell>
                          <TableCell>
                            {getPaymentMethodName(record.payment_method, t)}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {formatCurrencyFromUSD(record.amount, {
                              digitsLarge: 2,
                              digitsSmall: 2,
                              abbreviate: false,
                            })}
                          </TableCell>
                          <TableCell className='font-medium text-red-600'>
                            {formatNumber(record.money)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              label={statusConfig.label === 'Success' ? '成功' : statusConfig.label === 'Pending' ? '待支付' : '已过期'}
                              variant={statusConfig.variant}
                              showDot
                              copyable={false}
                            />
                          </TableCell>
                          <TableCell className='px-4 text-right'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => setInvoiceRecord(record)}
                              disabled={record.status !== 'success'}
                            >
                              去开票
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}

              {!loading && records.length > 0 && (
                <div className='flex flex-col items-center gap-3 border-t p-4 sm:flex-row sm:justify-between sm:p-5'>
                  <div className='text-muted-foreground text-xs sm:text-sm'>
                    显示 {(page - 1) * pageSize + 1}-
                    {Math.min(page * pageSize, total)} 条，共 {total}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className='h-8 w-8 p-0'
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                      <span className='font-medium'>{page}</span>
                      <span>/</span>
                      <span>{totalPages}</span>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      className='h-8 w-8 p-0'
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <InvoiceDialog
        record={invoiceRecord}
        open={!!invoiceRecord}
        onOpenChange={(open) => !open && setInvoiceRecord(null)}
      />
    </>
  )
}

function InvoiceDialog(props: {
  record: TopupRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.success('开票信息已提交')
    props.onOpenChange(false)
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title='去开票'
      description='填写开票抬头、联系人等必要信息'
      contentClassName='sm:max-w-2xl'
      footer={
        <>
          <Button variant='outline' onClick={() => props.onOpenChange(false)}>
            取消
          </Button>
          <Button type='submit' form='invoice-application-form'>
            提交
          </Button>
        </>
      }
    >
      <form id='invoice-application-form' className='space-y-4' onSubmit={handleSubmit}>
        {props.record && (
          <div className='grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-2'>
            <div>
              <div className='text-muted-foreground text-xs'>订单号</div>
              <div className='mt-1 truncate font-mono'>{props.record.trade_no}</div>
            </div>
            <div>
              <div className='text-muted-foreground text-xs'>开票金额</div>
              <div className='mt-1 font-semibold'>
                {formatCurrencyFromUSD(props.record.amount, {
                  digitsLarge: 2,
                  digitsSmall: 2,
                  abbreviate: false,
                })}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground text-xs'>支付方式</div>
              <div className='mt-1'>
                {getPaymentMethodName(props.record.payment_method, t)}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground text-xs'>创建时间</div>
              <div className='mt-1'>{formatTimestamp(props.record.create_time)}</div>
            </div>
          </div>
        )}

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='invoice-title'>发票抬头</Label>
            <Input id='invoice-title' name='invoiceTitle' required placeholder='企业或个人抬头' />
          </div>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='tax-number'>纳税人识别号</Label>
            <Input id='tax-number' name='taxNumber' placeholder='企业发票请填写' />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='contact-name'>联系人姓名</Label>
            <Input id='contact-name' name='contactName' required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='contact-phone'>联系电话</Label>
            <Input id='contact-phone' name='contactPhone' required />
          </div>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='contact-email'>联系邮箱</Label>
            <Input id='contact-email' name='contactEmail' type='email' required />
          </div>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='invoice-note'>开票备注</Label>
            <Textarea id='invoice-note' name='invoiceNote' placeholder='可填写接收方式或其他开票说明' />
          </div>
        </div>
      </form>
    </Dialog>
  )
}
