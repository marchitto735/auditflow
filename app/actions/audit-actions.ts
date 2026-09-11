'use server'

type WorkflowType = 'one' | 'two' | 'three'

export async function triggerN8nWorkflow(workflowType: WorkflowType, payload: Record<string, any>) {
  const urls: Record<WorkflowType, string | undefined> = {
    one: process.env.N8N_WORKFLOW_ONE_URL,
    two: process.env.N8N_WORKFLOW_TWO_URL,
    three: process.env.N8N_WORKFLOW_THREE_URL,
  }

  const targetUrl = urls[workflowType]

  if (!targetUrl) {
    throw new Error(`Webhook URL for workflow type "${workflowType}" is not configured in environment variables.`)
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to trigger n8n workflow: ${response.statusText}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error(`Error triggering workflow ${workflowType}:`, error.message)
    return { success: false, error: error.message }
  }
}