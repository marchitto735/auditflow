'use client'

import { triggerN8nWorkflow } from '@/app/actions/audit-actions'

export default function TestPage() {
  const handleTestTrigger = async () => {
    const result = await triggerN8nWorkflow('one', { test: true, message: 'Hello from AuditFlow' })
    console.log(result)
  }

  return (
    <main className="p-8">
      <button 
        onClick={handleTestTrigger}
        className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium"
      >
        Test n8n Workflow One
      </button>
    </main>
  )
}