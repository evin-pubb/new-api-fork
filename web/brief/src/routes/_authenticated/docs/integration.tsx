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
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight, Copy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/docs/integration')({
  component: IntegrationDocs,
})

type NavItem = {
  id: string
  title: string
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    title: '概览',
  },
  {
    id: 'quick-start',
    title: '快速上手',
  },
  {
    id: 'api-reference',
    title: 'API 参考',
    children: [
      { id: 'auth', title: '认证方式' },
      { id: 'base-url', title: 'Base URL' },
      { id: 'models', title: '模型列表' },
      { id: 'chat', title: '对话接口' },
    ],
  },
  {
    id: 'sdk',
    title: 'SDK 与工具',
    children: [
      { id: 'openai-sdk', title: 'OpenAI SDK' },
      { id: 'curl', title: 'cURL 示例' },
      { id: 'python', title: 'Python 示例' },
    ],
  },
  {
    id: 'faq',
    title: '常见问题',
  },
]

const tocItems = [
  { id: 'overview', title: '概览' },
  { id: 'quick-start', title: '快速上手' },
  { id: 'api-reference', title: 'API 参考' },
  { id: 'sdk', title: 'SDK 与工具' },
  { id: 'faq', title: '常见问题' },
]

function IntegrationDocs() {
  const [activeNav, setActiveNav] = useState('overview')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(['api-reference', 'sdk'])
  )

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className='flex min-h-screen'>
      {/* 左侧导航 */}
      <aside className='bg-muted/30 fixed left-0 top-[var(--app-header-height,4.5rem)] h-[calc(100vh-var(--app-header-height,4.5rem))] w-64 overflow-y-auto border-r'>
        <div className='space-y-1 p-4'>
          <div className='mb-4'>
            <h2 className='px-2 text-lg font-semibold'>API 手册</h2>
          </div>
          {navItems.map((item) => (
            <NavItemComponent
              key={item.id}
              item={item}
              activeNav={activeNav}
              expandedItems={expandedItems}
              onToggle={toggleExpand}
              onSelect={setActiveNav}
            />
          ))}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className='ml-64 mr-64 flex-1 px-8 py-6'>
        <article className='prose prose-slate max-w-none dark:prose-invert'>
          <div className='mb-8'>
            <span className='text-primary text-sm font-medium'>快速上手</span>
            <h1 className='mt-2 text-4xl font-bold'>第三方集成文档</h1>
          </div>

          <section id='overview' className='mb-12'>
            <h2 className='border-b pb-2 text-2xl font-semibold'>概览</h2>
            <p className='text-muted-foreground mt-4 leading-7'>
              本平台提供与 OpenAI 兼容的 API
              接口，您可以使用现有的工具和SDK无缝接入。
            </p>
          </section>

          <section id='quick-start' className='mb-12'>
            <h2 className='border-b pb-2 text-2xl font-semibold'>快速上手</h2>
            <p className='mt-4 leading-7'>在开始之前，请确保：</p>
            <ol className='ml-6 mt-4 list-decimal space-y-2'>
              <li>已在平台注册账号</li>
              <li>已在"密钥管理"中创建 API 密钥</li>
              <li>查看可用模型列表（在"模型广场"中查看）</li>
            </ol>
          </section>

          <section id='api-reference' className='mb-12'>
            <h2 className='border-b pb-2 text-2xl font-semibold'>API 参考</h2>

            <h3 id='auth' className='mt-6 text-xl font-semibold'>
              认证方式
            </h3>
            <p className='mt-4 leading-7'>
              所有 API 请求都需要在 HTTP 请求头中携带 API 密钥：
            </p>
            <CodeBlock
              code='Authorization: Bearer YOUR_API_KEY'
              language='bash'
              onCopy={copyCode}
            />

            <h3 id='base-url' className='mt-6 text-xl font-semibold'>
              Base URL
            </h3>
            <p className='mt-4 leading-7'>API 基础地址：</p>
            <CodeBlock
              code={`${window.location.origin}/v1`}
              language='text'
              onCopy={copyCode}
            />

            <h3 id='models' className='mt-6 text-xl font-semibold'>
              模型列表
            </h3>
            <p className='mt-4 leading-7'>获取可用模型列表：</p>
            <CodeBlock
              code={`curl ${window.location.origin}/v1/models \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              language='bash'
              onCopy={copyCode}
            />

            <h3 id='chat' className='mt-6 text-xl font-semibold'>
              对话接口
            </h3>
            <p className='mt-4 leading-7'>发送对话请求：</p>
            <CodeBlock
              code={`curl ${window.location.origin}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ]
  }'`}
              language='bash'
              onCopy={copyCode}
            />
          </section>

          <section id='sdk' className='mb-12'>
            <h2 className='border-b pb-2 text-2xl font-semibold'>
              SDK 与工具
            </h2>

            <h3 id='openai-sdk' className='mt-6 text-xl font-semibold'>
              OpenAI SDK
            </h3>
            <p className='mt-4 leading-7'>使用官方 OpenAI SDK 连接：</p>
            <CodeBlock
              code={`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${window.location.origin}/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "你好"}
    ]
)

print(response.choices[0].message.content)`}
              language='python'
              onCopy={copyCode}
            />

            <h3 id='python' className='mt-6 text-xl font-semibold'>
              Python 示例
            </h3>
            <p className='mt-4 leading-7'>使用 requests 库：</p>
            <CodeBlock
              code={`import requests

url = "${window.location.origin}/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model": "gpt-4o",
    "messages": [
        {"role": "user", "content": "你好"}
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`}
              language='python'
              onCopy={copyCode}
            />
          </section>

          <section id='faq' className='mb-12'>
            <h2 className='border-b pb-2 text-2xl font-semibold'>常见问题</h2>

            <h3 className='mt-6 text-lg font-semibold'>如何获取 API 密钥？</h3>
            <p className='mt-4 leading-7'>
              登录后在左侧菜单"密钥管理"中创建新的 API 密钥。
            </p>

            <h3 className='mt-6 text-lg font-semibold'>支持哪些模型？</h3>
            <p className='mt-4 leading-7'>
              请访问"模型广场"查看当前可用的所有模型及其定价。
            </p>

            <h3 className='mt-6 text-lg font-semibold'>如何查看用量？</h3>
            <p className='mt-4 leading-7'>
              在"使用日志"中可以查看详细的 API 调用记录和费用统计。
            </p>
          </section>
        </article>
      </main>

      {/* 右侧目录 */}
      <aside className='bg-background/95 fixed right-0 top-[var(--app-header-height,4.5rem)] h-[calc(100vh-var(--app-header-height,4.5rem))] w-64 overflow-y-auto border-l backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='p-4'>
          <h3 className='mb-4 text-sm font-semibold'>在此页面</h3>
          <ul className='space-y-2 text-sm'>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className='text-muted-foreground hover:text-foreground block transition-colors'
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

function NavItemComponent({
  item,
  activeNav,
  expandedItems,
  onToggle,
  onSelect,
  level = 0,
}: {
  item: NavItem
  activeNav: string
  expandedItems: Set<string>
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  level?: number
}) {
  const isExpanded = expandedItems.has(item.id)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            onToggle(item.id)
          }
          onSelect(item.id)
        }}
        className={cn(
          'hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
          activeNav === item.id && 'bg-accent font-medium'
        )}
        style={{ paddingLeft: `${level * 0.75 + 0.5}rem` }}
      >
        {hasChildren && (
          <ChevronRight
            className={cn(
              'size-4 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        )}
        <span className='flex-1 text-left'>{item.title}</span>
      </button>
      {hasChildren && isExpanded && (
        <div className='mt-1'>
          {item.children!.map((child) => (
            <NavItemComponent
              key={child.id}
              item={child}
              activeNav={activeNav}
              expandedItems={expandedItems}
              onToggle={onToggle}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CodeBlock({
  code,
  language,
  onCopy,
}: {
  code: string
  language: string
  onCopy: (text: string) => void
}) {
  return (
    <div className='bg-muted relative mt-4 rounded-lg'>
      <div className='flex items-center justify-between border-b px-4 py-2'>
        <span className='text-muted-foreground text-xs font-medium'>
          {language}
        </span>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onCopy(code)}
          className='h-7 px-2'
        >
          <Copy className='size-3' />
        </Button>
      </div>
      <pre className='overflow-x-auto p-4'>
        <code className='text-sm'>{code}</code>
      </pre>
    </div>
  )
}
