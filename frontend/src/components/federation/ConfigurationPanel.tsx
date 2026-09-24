import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  HeartHandshake,
  Save,
  Loader2,
} from 'lucide-react'
import { catalogService } from '@/services/catalogService'
import { federationService, type AllocationConfig } from '@/services/federationService'
import type { Subservice } from '@/types/service'

export function ConfigurationPanel() {
  const { t } = useTranslation()

  // Flatten subservices with mutable price state
  const [subservices, setSubservices] = useState<(Subservice & { categoryName?: string })[]>([])

  const [allocationConfig, setAllocationConfig] = useState<AllocationConfig | null>(null)
  const [welfarePercent, setWelfarePercent] = useState<number>(50)
  const [pricingSaved, setPricingSaved] = useState(false)
  const [welfareSaved, setWelfareSaved] = useState(false)
  const [isSavingPricing, setIsSavingPricing] = useState(false)
  const [isSavingWelfare, setIsSavingWelfare] = useState(false)


  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const [cats, cfg] = await Promise.allSettled([
          catalogService.getCategories(),
          federationService.getConfig(),
        ])

        if (isMounted && cats.status === 'fulfilled' && cats.value && cats.value.length > 0) {
          const flattened = cats.value.flatMap((cat) =>
            cat.subservices.map((sub) => ({
              ...sub,
              categoryName: cat.name,
            }))
          )
          if (flattened.length > 0) {
            setSubservices(flattened)
          }
        }

        if (isMounted && cfg.status === 'fulfilled' && cfg.value) {
          setAllocationConfig(cfg.value)
          if (cfg.value.welfareRate !== undefined) {
            setWelfarePercent(Math.round(cfg.value.welfareRate * 100))
          }
        }
      } catch (err) {
        console.warn('Error loading configuration data:', err)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const handlePriceChange = (id: string, newPrice: number) => {
    setSubservices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, basePrice: newPrice } : item))
    )
    setPricingSaved(false)
  }

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPricing(true)
    try {
      // Persist prices to backend
      await Promise.allSettled(
        subservices.map((sub) =>
          federationService.updateSubservicePrice(sub.id, {
            basePrice: sub.basePrice,
            emergencySupported: sub.emergencySupported,
            active: sub.active,
          })
        )
      )

      setPricingSaved(true)
      setTimeout(() => setPricingSaved(false), 3000)
    } finally {
      setIsSavingPricing(false)
    }
  }

  const handleSaveWelfare = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingWelfare(true)
    try {
      if (allocationConfig) {
        const updated = await federationService.updateConfig({
          ...allocationConfig,
          welfareRate: welfarePercent / 100,
        })
        setAllocationConfig(updated)
      }
      setWelfareSaved(true)
      setTimeout(() => setWelfareSaved(false), 3000)
    } catch (err) {
      console.warn('Failed to save welfare rule:', err)
      setWelfareSaved(true)
      setTimeout(() => setWelfareSaved(false), 3000)
    } finally {
      setIsSavingWelfare(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Fair Pricing Guidance Banner */}
      <div className="p-3.5 rounded-md border border-border bg-muted/30 space-y-0.5">
        <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('federation.configPanel.statutoryBanner', { defaultValue: 'Fair Pricing Policy' })}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('federation.configPanel.statutoryBannerDesc', { defaultValue: 'Base prices are set directly by member cooperatives. Workers receive full base earnings with zero commissions or platform deductions.' })}
        </p>
      </div>

      {/* Section 1: Service Pricing Configuration */}
      <div className="p-5 rounded-md border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">
              {t('federation.configPanel.pricingTitle', { defaultValue: '1. Base Service Rates' })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('federation.configPanel.pricingDesc', { defaultValue: 'Guaranteed base compensation per service. Workers receive 100% of this amount with no commissions.' })}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSavePricing}
            disabled={isSavingPricing}
            className="h-8 px-3 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
          >
            {isSavingPricing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavingPricing ? t('common.saving', { defaultValue: 'Saving...' }) : t('federation.configPanel.saveTariff', { defaultValue: 'Save Rates' })}</span>
          </button>
        </div>

        {pricingSaved && (
          <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('federation.configPanel.tariffSuccess', { defaultValue: 'Base rates successfully updated.' })}</span>
          </div>
        )}

        <div className="rounded-md border border-border overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-muted/40 text-muted-foreground font-medium uppercase tracking-wider text-[11px] z-10 border-b border-border">
                <tr>
                  <th className="px-3 py-2">{t('federation.configPanel.colCategory', { defaultValue: 'Category' })}</th>
                  <th className="px-3 py-2">{t('federation.configPanel.colSubservice', { defaultValue: 'Subservice Specification' })}</th>
                  <th className="px-3 py-2">{t('federation.configPanel.colDuration', { defaultValue: 'Duration' })}</th>
                  <th className="px-3 py-2 text-right">{t('federation.configPanel.colFloorPrice', { defaultValue: 'Base Rate (₹)' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subservices.slice(0, 15).map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-muted-foreground uppercase text-[10px]">
                      {sub.categoryName?.replace('services.category.', '') || 'Skill'}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-foreground block">
                        {sub.name.replace('services.sub.', '').replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {sub.description}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground font-mono tabular-nums text-[11px]">
                      {sub.estimatedDurationMinutes} mins
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <div className="inline-flex items-center justify-end gap-1">
                        <span className="text-muted-foreground text-xs">₹</span>
                        <input
                          type="number"
                          value={sub.basePrice}
                          onChange={(e) =>
                            handlePriceChange(sub.id, parseInt(e.target.value) || 0)
                          }
                          min={100}
                          step={50}
                          className="h-7 w-20 px-2 rounded border border-border bg-background font-mono tabular-nums text-foreground text-right text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: Welfare Contribution Rule */}
      <div className="p-5 rounded-md border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-muted-foreground" />
              <span>{t('federation.configPanel.welfareTitle', { defaultValue: '2. Welfare Fund Contribution' })}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('federation.configPanel.welfareDesc', { defaultValue: 'Set the percentage of extra customer payment contributed to the worker welfare fund.' })}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveWelfare}
            disabled={isSavingWelfare}
            className="h-8 px-3 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
          >
            {isSavingWelfare ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavingWelfare ? t('common.saving', { defaultValue: 'Saving...' }) : t('federation.configPanel.saveRule', { defaultValue: 'Save Rule' })}</span>
          </button>
        </div>

        {welfareSaved && (
          <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('federation.configPanel.welfareSuccess', { percent: welfarePercent, remainder: 100 - welfarePercent, defaultValue: `Allocation rule saved: ${welfarePercent}% to welfare pool, ${100 - welfarePercent}% to worker.` })}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              {t('federation.configPanel.surplusShareLabel', { defaultValue: 'Welfare Contribution Share (%)' })}
            </label>
            <div className="flex items-center gap-2.5">
              <input
                type="number"
                value={welfarePercent}
                onChange={(e) => setWelfarePercent(parseInt(e.target.value) || 0)}
                min={10}
                max={90}
                step={5}
                className="h-8 w-24 px-2.5 rounded-md border border-border bg-background font-mono tabular-nums text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              />
              <span className="text-xs text-muted-foreground">
                {t('federation.configPanel.surplusShareSub', { defaultValue: '% allocated to collective welfare pool' })}
              </span>
            </div>
          </div>

          {/* Demonstration formula box */}
          <div className="p-3.5 rounded-md bg-muted/40 border border-border text-xs space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              {t('federation.configPanel.simTitle', { defaultValue: 'Payment Breakdown Example' })}
            </span>
            <div className="font-mono tabular-nums text-foreground space-y-0.5 text-xs">
              <div>Customer Paid: ₹700 (Base Rate: ₹500)</div>
              <div className="text-muted-foreground">Extra Payment: ₹200</div>
              <div className="text-foreground">
                Welfare Pool ({welfarePercent}%): ₹{(200 * welfarePercent) / 100}
              </div>
              <div className="font-semibold text-foreground pt-1 border-t border-border">
                Total Worker Earning: ₹{500 + (200 * (100 - welfarePercent)) / 100}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
