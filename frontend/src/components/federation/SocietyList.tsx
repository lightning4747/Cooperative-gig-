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
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  const districts = Array.from(new Set(societies.map((s) => s.district))).filter(Boolean)

  const filtered = societies.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.district.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDistrict = selectedDistrict === 'ALL' || s.district === selectedDistrict

    return matchesSearch && matchesDistrict
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedSocieties = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder={t('federation.societiesPage.searchPlaceholder', { defaultValue: 'Search cooperative societies...' })}
            className="w-full h-8 pl-9 pr-3 rounded-md border border-border bg-background text-xs font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
        </div>

        <div className="w-full sm:w-56 shrink-0">
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
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
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedSocieties.map((soc) => (
              <div
                key={soc.id}
                className="p-4 rounded-md border border-border bg-card flex flex-col justify-between space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
                        {getTranslatedSocietyName(t, soc.name)}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {soc.district}, {soc.state}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t('federation.societiesPage.registeredBadge', { defaultValue: 'Registered Member' })}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>
                      <strong className="font-mono tabular-nums text-foreground font-semibold text-xs">
                        {soc.workerCount}
                      </strong>{' '}
                      {t('federation.societiesPage.activeWorkers', { defaultValue: 'Members' })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewWorkers(soc)}
                    className="h-8 px-2.5 rounded-md border border-border bg-background hover:bg-muted text-foreground text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>{t('federation.societiesPage.viewWorkers', { defaultValue: 'View Workers' })}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {filtered.length > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-card border border-border rounded-md text-xs text-muted-foreground">
              <span className="tabular-nums">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} societies
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs font-medium transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-7 w-7 rounded text-xs font-mono font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-foreground text-background font-semibold'
                          : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
