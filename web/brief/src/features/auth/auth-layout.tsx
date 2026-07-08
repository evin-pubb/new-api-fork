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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  return (
    <div className='flex min-h-screen'>
      {/* Left side - Background and branding */}
      <div
        className='relative hidden min-h-screen flex-1 lg:block'
        style={{
          backgroundImage: 'url(/auth-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'left top',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className='relative z-10 flex h-full flex-col justify-between p-12'>
          <Link
            to='/'
            className='flex items-center gap-3 transition-opacity hover:opacity-80'
          >
            <div className='relative h-10 w-10'>
              {loading ? (
                <Skeleton className='absolute inset-0 rounded-lg' />
              ) : (
                <img
                  src={logo}
                  alt={t('Logo')}
                  className='h-10 w-10 rounded-lg object-cover'
                />
              )}
            </div>
            {loading ? (
              <Skeleton className='h-7 w-32' />
            ) : (
              <h1 className='text-2xl font-semibold text-slate-900'>
                DD Tokens
              </h1>
            )}
          </Link>
          <div className='space-y-4'>
            <h2 className='text-4xl font-bold text-slate-900'>
              连接智能，赋能未来
            </h2>
            <p className='text-lg text-slate-600'>
              一站式大模型接入与管理平台
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className='flex min-h-screen flex-1 items-center justify-center bg-white p-8'>
        <div className='w-full max-w-[420px] space-y-8'>
          {/* Mobile logo */}
          <Link
            to='/'
            className='flex items-center gap-2 transition-opacity hover:opacity-80 lg:hidden'
          >
            <div className='relative h-8 w-8'>
              {loading ? (
                <Skeleton className='absolute inset-0 rounded-lg' />
              ) : (
                <img
                  src={logo}
                  alt={t('Logo')}
                  className='h-8 w-8 rounded-lg object-cover'
                />
              )}
            </div>
            {loading ? (
              <Skeleton className='h-6 w-24' />
            ) : (
              <h1 className='text-xl font-medium'>DD Tokens</h1>
            )}
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
