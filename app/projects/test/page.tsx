'use client'

import { AUDIT_REPORTS_PATH, AUDIT_RUN_PATH } from "@/lib/audit-client"

export default function TestPage() {
  async function pingReports() {
    const response = await fetch(AUDIT_REPORTS_PATH)
    const payload = await response.json()
    console.log("Native audit reports", payload)
  }

  return (
    <div className="p-4">
      <p className="mb-4 text-sm">
        Audits run through {AUDIT_RUN_PATH}. Reports are listed from{" "}
        {AUDIT_REPORTS_PATH}.
      </p>
      <button
        type="button"
        onClick={pingReports}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white"
      >
        Load stored reports
      </button>
    </div>
  )
}
