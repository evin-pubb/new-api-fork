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
import {
  Activity,
  Box,
  CreditCard,
  FileText,
  Home,
  Key,
  Radio,
  ServerCog,
  Settings,
  Ticket,
  User,
  Users,
  Wallet,
} from 'lucide-react'

import { type SidebarData } from '@/components/layout/types'
import { ROLE } from '@/lib/roles'

export function useSidebarData(): SidebarData {
  return {
    navGroups: [
      {
        id: 'user',
        title: '',
        items: [
          {
            title: '概览总览',
            url: '/dashboard/overview',
            icon: Home,
          },
          {
            title: '密钥管理',
            url: '/keys',
            icon: Key,
          },
          {
            title: '使用日志',
            url: '/usage-logs/common',
            icon: Activity,
          },
          {
            title: '费用中心',
            url: '/wallet',
            icon: Wallet,
          },
          {
            title: '发票管理',
            url: '/invoices',
            icon: FileText,
          },
          {
            title: '个人资料',
            url: '/profile',
            icon: User,
          },
        ],
      },
      {
        id: 'admin',
        title: '管理员',
        items: [
          {
            title: '渠道',
            url: '/channels',
            icon: Radio,
          },
          {
            title: '模型',
            url: '/models/metadata',
            icon: Box,
          },
          {
            title: '用户',
            url: '/users',
            icon: Users,
          },
          {
            title: '兑换码',
            url: '/redemption-codes',
            icon: Ticket,
          },
          {
            title: '订阅',
            url: '/subscriptions',
            icon: CreditCard,
          },
          {
            title: '系统信息',
            url: '/system-info',
            icon: ServerCog,
            requiredRole: ROLE.SUPER_ADMIN,
          },
          {
            title: '系统设置',
            url: '/system-settings/site',
            activeUrls: ['/system-settings'],
            icon: Settings,
          },
        ],
      },
    ],
  }
}


