export interface WelfareEntry {
  id: string
  jobId: string
  serviceName: string
  amount: number
  date: string
}

export interface WelfareLedger {
  workerId: string
  workerName: string
  societyName: string
  totalContributions: number
  balance: number
  entries: WelfareEntry[]
}
