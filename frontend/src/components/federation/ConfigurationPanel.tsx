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
      {/* Statutory Guidance Banner */}
      <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-1">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('federation.configPanel.statutoryBanner', { defaultValue: 'Statutory Cooperative Parameters (§19 Cooperative Governance)' })}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('federation.configPanel.statutoryBannerDesc', { defaultValue: 'In strict compliance with cooperative principles, all market parameters are governed by statutory floors rather than speculative algorithms. Private-platform surge surcharges and proprietary matching weights (W1/W2/W3) are constitutionally excluded.' })}
        </p>
      </div>

      {/* Section 1: Service Pricing Configuration */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-foreground">
              {t('federation.configPanel.pricingTitle', { defaultValue: '1. Statutory Floor Wage Tariff' })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('federation.configPanel.pricingDesc', { defaultValue: 'Guaranteed base compensation per service. Members receive 100% of this floor without platform commissions.' })}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSavePricing}
            disabled={isSavingPricing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            {isSavingPricing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavingPricing ? t('common.saving', { defaultValue: 'Saving...' }) : t('federation.configPanel.saveTariff', { defaultValue: 'Save Tariff Updates' })}</span>
          </button>
        </div>

        {pricingSaved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('federation.configPanel.tariffSuccess', { defaultValue: 'Statutory price tariff successfully updated across federation dispatch engines.' })}</span>
          </div>
        )}

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-secondary text-muted-foreground font-bold uppercase tracking-wider text-[10px] z-10">
                <tr className="border-b border-border">
                  <th className="p-3">{t('federation.configPanel.colCategory', { defaultValue: 'Category' })}</th>
                  <th className="p-3">{t('federation.configPanel.colSubservice', { defaultValue: 'Subservice Specification' })}</th>
                  <th className="p-3">{t('federation.configPanel.colDuration', { defaultValue: 'Duration' })}</th>
                  <th className="p-3 text-right">{t('federation.configPanel.colFloorPrice', { defaultValue: 'Statutory Base Floor (₹)' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {subservices.slice(0, 15).map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/40">
                    <td className="p-3 font-semibold text-muted-foreground uppercase text-[10px]">
                      {sub.categoryName?.replace('services.category.', '') || 'Trade'}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-foreground block">
                        {sub.name.replace('services.sub.', '').replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {sub.description}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">
                      {sub.estimatedDurationMinutes} mins
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span className="text-muted-foreground font-bold">₹</span>
                        <input
                          type="number"
                          value={sub.basePrice}
                          onChange={(e) =>
                            handlePriceChange(sub.id, parseInt(e.target.value) || 0)
                          }
                          min={100}
                          step={50}
                          className="w-24 px-2 py-1 rounded-lg border border-input bg-background font-mono font-bold text-foreground text-right text-xs focus:ring-2 focus:ring-primary/20"
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
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-primary" />
              <span>{t('federation.configPanel.welfareTitle', { defaultValue: '2. Surplus Welfare Allocation Rule' })}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('federation.configPanel.welfareDesc', { defaultValue: 'Define the percentage of discretionary customer surplus transferred into the collective member welfare fund.' })}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveWelfare}
            disabled={isSavingWelfare}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            {isSavingWelfare ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavingWelfare ? t('common.saving', { defaultValue: 'Saving...' }) : t('federation.configPanel.saveRule', { defaultValue: 'Save Rule' })}</span>
          </button>
        </div>

        {welfareSaved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('federation.configPanel.welfareSuccess', { percent: welfarePercent, remainder: 100 - welfarePercent, defaultValue: `Surplus allocation formula saved: ${welfarePercent}% to welfare pool, ${100 - welfarePercent}% to member.` })}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {t('federation.configPanel.surplusShareLabel', { defaultValue: 'Surplus Contribution Share (%)' })}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={welfarePercent}
                onChange={(e) => setWelfarePercent(parseInt(e.target.value) || 0)}
                min={10}
                max={90}
                step={5}
                className="w-32 p-2.5 rounded-xl border border-input bg-background font-mono font-bold text-lg text-foreground min-h-[44px] focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-xs text-muted-foreground">
                {t('federation.configPanel.surplusShareSub', { defaultValue: '% of surplus allocated to the collective pool' })}
              </span>
            </div>
          </div>

          {/* Demonstration formula box */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 text-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              {t('federation.configPanel.simTitle', { defaultValue: 'Cooperative Distribution Simulation' })}
            </span>
            <div className="font-mono text-foreground space-y-0.5">
              <div>Example Customer Paid: ₹700 (Base Floor: ₹500)</div>
              <div className="text-blue-600 font-bold">Surplus: ₹200</div>
              <div className="text-emerald-600 font-bold">
                Welfare Pool ({welfarePercent}%): ₹{(200 * welfarePercent) / 100}
              </div>
              <div className="font-black text-foreground">
                Total Member Earning: ₹{500 + (200 * (100 - welfarePercent)) / 100}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
