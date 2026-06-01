import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded'
import FilterAltOffRounded from '@mui/icons-material/FilterAltOffRounded'
import FilterAltRounded from '@mui/icons-material/FilterAltRounded'
import MyLocationRounded from '@mui/icons-material/MyLocationRounded'
import NetworkCheckRounded from '@mui/icons-material/NetworkCheckRounded'
import SortByAlphaRounded from '@mui/icons-material/SortByAlphaRounded'
import SortRounded from '@mui/icons-material/SortRounded'
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import WifiTetheringOffRounded from '@mui/icons-material/WifiTetheringOffRounded'
import WifiTetheringRounded from '@mui/icons-material/WifiTetheringRounded'
import { Box, IconButton, SxProps, TextField } from '@mui/material'
import { memo, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { useVerge } from '@/hooks/use-verge'
import delayManager from '@/services/delay'

import { BaseSearchBox } from '../base'

import type { ProxySortType } from './use-filter-sort'
import { HeadState } from './use-head-state'

interface Props {
  sx?: SxProps
  url?: string
  groupName: string
  headState: HeadState
  onLocation: () => void
  onCheckDelay: () => void
  onHeadState: (val: Partial<HeadState>) => void
}

export const ProxyGroupTools = memo(function ProxyGroupTools(props: Props) {
  const {
    sx,
    url,
    groupName,
    headState,
    onCheckDelay,
    onHeadState,
    onLocation,
  } = props

  const {
    showType,
    sortType,
    filterText,
    textState,
    testUrl,
    filterMatchCase,
    filterMatchWholeWord,
    filterUseRegularExpression,
  } = headState

  // Keep refs to callbacks so onClick can call the latest version after flushSync re-render
  const onLocationRef = useRef(onLocation)
  const onCheckDelayRef = useRef(onCheckDelay)
  const onHeadStateRef = useRef(onHeadState)
  onLocationRef.current = onLocation
  onCheckDelayRef.current = onCheckDelay
  onHeadStateRef.current = onHeadState

  const { t } = useTranslation()
  const [autoFocus, setAutoFocus] = useState(false)

  useEffect(() => {
    // fix the focus conflict
    const timer = setTimeout(() => setAutoFocus(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const { verge } = useVerge()
  const defaultLatencyUrl =
    verge?.default_latency_test?.trim() ||
    'http://cp.cloudflare.com/generate_204'

  useEffect(() => {
    delayManager.setUrl(groupName, testUrl?.trim() || url || defaultLatencyUrl)
  }, [groupName, testUrl, defaultLatencyUrl, url])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        ...sx,
      }}
    >
      {textState === 'filter' && (
        <Box sx={{ display: 'inline-block', width: 180 }}>
          <BaseSearchBox
            autoFocus={autoFocus}
            value={filterText}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            searchState={{
              matchCase: filterMatchCase,
              matchWholeWord: filterMatchWholeWord,
              useRegularExpression: filterUseRegularExpression,
            }}
            onSearch={(_, state) =>
              onHeadStateRef.current({
                filterText: state.text,
                filterMatchCase: state.matchCase,
                filterMatchWholeWord: state.matchWholeWord,
                filterUseRegularExpression: state.useRegularExpression,
              })
            }
          />
        </Box>
      )}

      {textState === 'url' && (
        <TextField
          autoComplete="new-password"
          autoFocus={autoFocus}
          hiddenLabel
          autoSave="off"
          value={testUrl}
          size="small"
          variant="outlined"
          placeholder={t('proxies.page.placeholders.delayCheckUrl')}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onChange={(e) => onHeadStateRef.current({ testUrl: e.target.value })}
          sx={{ width: 180, input: { py: 0.65, px: 1 } }}
        />
      )}

      <IconButton
        size="small"
        color="inherit"
        title={t('proxies.page.tooltips.locate')}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!headState.open)
            // eslint-disable-next-line @eslint-react/dom-no-flush-sync
            flushSync(() => onHeadStateRef.current({ open: true }))
          onLocationRef.current()
        }}
      >
        <MyLocationRounded fontSize="inherit" />
      </IconButton>

      <IconButton
        size="small"
        color="inherit"
        title={t('proxies.page.tooltips.delayCheck')}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!headState.open)
            // eslint-disable-next-line @eslint-react/dom-no-flush-sync
            flushSync(() => onHeadStateRef.current({ open: true }))
          // Remind the user that it is custom test url
          if (testUrl?.trim() && textState !== 'filter') {
            onHeadStateRef.current({ textState: 'url' })
          }
          onCheckDelayRef.current()
        }}
      >
        <NetworkCheckRounded fontSize="inherit" />
      </IconButton>

      <IconButton
        size="small"
        color="inherit"
        title={
          [
            t('proxies.page.tooltips.sortDefault'),
            t('proxies.page.tooltips.sortDelay'),
            t('proxies.page.tooltips.sortName'),
          ][sortType]
        }
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!headState.open)
            // eslint-disable-next-line @eslint-react/dom-no-flush-sync
            flushSync(() => onHeadStateRef.current({ open: true }))
          onHeadStateRef.current({
            sortType: ((sortType + 1) % 3) as ProxySortType,
          })
        }}
      >
        {sortType !== 1 && sortType !== 2 && <SortRounded fontSize="inherit" />}
        {sortType === 1 && <AccessTimeRounded fontSize="inherit" />}
        {sortType === 2 && <SortByAlphaRounded fontSize="inherit" />}
      </IconButton>

      <IconButton
        size="small"
        color="inherit"
        title={t('proxies.page.tooltips.delayCheckUrl')}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!headState.open)
            // eslint-disable-next-line @eslint-react/dom-no-flush-sync
            flushSync(() => onHeadStateRef.current({ open: true }))
          onHeadStateRef.current({
            textState: textState === 'url' ? null : 'url',
          })
        }}
      >
        {textState === 'url' ? (
          <WifiTetheringRounded fontSize="inherit" />
        ) : (
          <WifiTetheringOffRounded fontSize="inherit" />
        )}
      </IconButton>

      <IconButton
        size="small"
        color="inherit"
        title={
          showType
            ? t('proxies.page.tooltips.showBasic')
            : t('proxies.page.tooltips.showDetail')
        }
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!headState.open)
            // eslint-disable-next-line @eslint-react/dom-no-flush-sync
            flushSync(() => onHeadStateRef.current({ open: true }))
          onHeadStateRef.current({ showType: !showType })
        }}
      >
        {showType ? (
          <VisibilityRounded fontSize="inherit" />
        ) : (
          <VisibilityOffRounded fontSize="inherit" />
        )}
      </IconButton>

      <IconButton
        size="small"
        color="inherit"
        title={t('proxies.page.tooltips.filter')}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!headState.open)
            // eslint-disable-next-line @eslint-react/dom-no-flush-sync
            flushSync(() => onHeadStateRef.current({ open: true }))
          onHeadStateRef.current({
            textState: textState === 'filter' ? null : 'filter',
            filterText: '',
          })
        }}
      >
        {textState === 'filter' ? (
          <FilterAltRounded fontSize="inherit" />
        ) : (
          <FilterAltOffRounded fontSize="inherit" />
        )}
      </IconButton>
    </Box>
  )
})
