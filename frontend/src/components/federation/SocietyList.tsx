import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, MapPin, CheckCircle2, ArrowRight, Search } from 'lucide-react'
import type { Society } from '@/types/federation'
import { EmptyState } from '@/components/shared/EmptyState'
import { getTranslatedSocietyName } from '@/lib/serviceTranslation'

interface SocietyListProps {
  societies: Society[]
  onSelectSociety?: (society: Society) => void
}

export function SocietyList({ societies, onSelectSociety }: SocietyListProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL')

  const districts = Array.from(new Set(societies.map((s) => s.district))).filter(Boolean)

  const filtered = societies.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.district.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDistrict = selectedDistrict === 'ALL' || s.district === selectedDistrict

    return matchesSearch && matchesDistrict
  })

  const handleViewWorkers = (soc: Society) => {
    if (onSelectSociety) {
      onSelectSociety(soc)
    } else {
      navigate(`/federation/workers?societyId=${soc.id}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & District Filter */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('federation.societiesPage.searchPlaceholder', { defaultValue: 'Search cooperative societies or registration number...' })}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{t('federation.societiesPage.allDistricts', { defaultValue: 'All Districts' })}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('federation.societiesPage.emptyTitle', { defaultValue: 'No Societies Found' })}
          description={t('federation.societiesPage.emptyDesc', { defaultValue: 'No primary cooperative societies match your current filter criteria.' })}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((soc) => (
            <div
              key={soc.id}
              className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border/60">
                    {soc.registrationNumber}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground leading-snug">
                    {getTranslatedSocietyName(t, soc.name)}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span>
                      {soc.district}, {soc.state}
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t('federation.societiesPage.registeredBadge', { defaultValue: 'NCCT Registered Primary Cooperative' })}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>
                    <strong className="font-mono text-foreground font-bold text-sm">
                      {soc.workerCount}
                    </strong>{' '}
                    {t('federation.societiesPage.activeWorkers', { defaultValue: 'Members' })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewWorkers(soc)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold border border-border min-h-[44px] transition-colors"
                >
                  <span>{t('federation.societiesPage.viewWorkers', { defaultValue: 'View Workers' })}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
