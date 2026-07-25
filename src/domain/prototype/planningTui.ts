// @ts-nocheck — Node TUI shell; excluded from browser typecheck intent.
/**
 * PROTOTYPE — logic TUI for planning features.
 *
 * Question: do climaxEvidence + boardCoverage + localParser + telling outline
 * give the right *signal* for an author (gaps clear, not noisy / wrong)?
 *
 * Run: npm run prototype:planning
 * Pure helpers live outside this file; this shell is throwaway.
 */

import * as readline from 'node:readline'
import { boardCoverage } from '../boardCoverage'
import { climaxEvidence } from '../climaxEvidence'
import { createSeedProject } from '../seed'
import { getStructureTemplate } from '../structure'
import { formatTellingOutline } from '../../export/tellingOutline'
import { localParser } from '../../import/localParser'
import type { Project } from '../types'

const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

type Mode = 'overview' | 'parse' | 'telling'

interface State {
  project: Project
  mode: Mode
  parsePreview: string
  lastParseSummary: string
}

const SAMPLE_BANK = `Ghost: แผลทดลอง
Want: ได้คำตอบ

ชื่อ: ฉากเปิด
การกระทำ: นางเอกเปิดจดหมายเก่า
ตัวละคร: ลิน, มาร์ค

ชายปริศนาเดินหายไปกลางฝน ลินกลัวและเงียบ`

function frame(state: State): string {
  const p = state.project
  const template = getStructureTemplate(p.structureTemplateId)
  const cov = boardCoverage(p.scenes, template)
  const ev = climaxEvidence(p)

  const lines: string[] = [
    `${BOLD}PROTOTYPE · planning logic${RESET}`,
    `${DIM}question: do evidence / coverage / parse / telling signals feel right?${RESET}`,
    '',
    `${BOLD}project${RESET}  ${p.title}`,
    `${BOLD}structure${RESET}  ${template.name} · scenes ${p.scenes.length}`,
    `${BOLD}climaxOutcome${RESET}  want=${p.climaxOutcome.want}  need=${p.climaxOutcome.need}`,
    '',
    `${BOLD}climaxEvidence${RESET}`,
    `  hasClimaxScene  ${ev.hasClimaxScene}`,
    `  climaxScenes    ${ev.climaxScenes.map((s) => s.title).join(' · ') || '(none)'}`,
    `  want→ / need→ / fail→  ${ev.wantIntoClimax.length} / ${ev.needIntoClimax.length} / ${ev.failIntoClimax.length}`,
    `  hasArcEdges     ${ev.hasArcEdges}`,
    '',
    `${BOLD}boardCoverage${RESET}`,
    `  emptyBeats (${cov.emptyBeats.length})  ${cov.emptyBeats
      .slice(0, 6)
      .map((b) => b.key)
      .join(', ')}${cov.emptyBeats.length > 6 ? '…' : ''}`,
    `  emptyBands (${cov.emptyBandIndexes.length})  ${cov.emptyBandIndexes
      .map((i) => template.bands[i].label)
      .join(' · ') || '(none)'}`,
    `  scenesWithWarnings  ${cov.scenesWithWarnings}`,
    '',
    `${BOLD}characters[0] arc${RESET}  ${
      p.characters[0]
        ? `ghost=${clip(p.characters[0].ghost)} want=${clip(p.characters[0].want)}`
        : '(none)'
    }`,
    '',
  ]

  if (state.mode === 'parse') {
    lines.push(
      `${BOLD}parse preview${RESET}`,
      DIM + state.parsePreview.split('\n').slice(0, 8).join('\n') + RESET,
      '',
      state.lastParseSummary || `${DIM}press [p] to run localParser${RESET}`,
      '',
    )
  }

  if (state.mode === 'telling') {
    const outline = formatTellingOutline(p)
    lines.push(
      `${BOLD}telling outline (first lines)${RESET}`,
      DIM + outline.split('\n').slice(0, 12).join('\n') + RESET,
      '',
    )
  }

  lines.push(
    `${BOLD}mode${RESET}  ${state.mode}`,
    '',
    `${BOLD}[1]${RESET} overview   ${BOLD}[2]${RESET} parse   ${BOLD}[3]${RESET} telling`,
    `${BOLD}[p]${RESET} run parser on sample bank   ${BOLD}[c]${RESET} clear climax beat tags`,
    `${BOLD}[r]${RESET} restore seed   ${BOLD}[q]${RESET} quit`,
  )

  return lines.join('\n')
}

function clip(s: string, n = 28): string {
  const t = (s || '').trim()
  if (!t) return '∅'
  return t.length > n ? `${t.slice(0, n)}…` : t
}

async function main() {
  let state: State = {
    project: createSeedProject(),
    mode: 'overview',
    parsePreview: SAMPLE_BANK,
    lastParseSummary: '',
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  // raw mode for single keystrokes when TTY
  if (process.stdin.isTTY) {
    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
  }

  const render = () => {
    console.clear()
    console.log(frame(state))
  }

  render()

  const onKey = async (key: string) => {
    if (key === 'q' || key === '\u0003') {
      rl.close()
      if (process.stdin.isTTY) process.stdin.setRawMode(false)
      process.exit(0)
    }
    if (key === '1') state = { ...state, mode: 'overview' }
    if (key === '2') state = { ...state, mode: 'parse' }
    if (key === '3') state = { ...state, mode: 'telling' }
    if (key === 'r') {
      state = {
        ...state,
        project: createSeedProject(),
        lastParseSummary: '',
      }
    }
    if (key === 'c') {
      // Strip climax-ish beats — evidence should go empty.
      const project: Project = {
        ...state.project,
        scenes: state.project.scenes.map((s) =>
          s.beat &&
          ['climax', 'finale', 'resurrection', 'ordeal'].includes(s.beat)
            ? { ...s, beat: undefined }
            : s,
        ),
      }
      state = { ...state, project }
    }
    if (key === 'p') {
      const result = await localParser.parse(state.parsePreview)
      state = {
        ...state,
        mode: 'parse',
        lastParseSummary: `scenes=${result.scenes.length}  backstoryKeys=${Object.keys(result.backstory).join(',') || '∅'}  titles=${result.scenes.map((s) => s.title).join(' | ')}`,
      }
    }
    render()
  }

  if (process.stdin.isTTY) {
    process.stdin.on('keypress', (_str, key) => {
      if (!key) return
      void onKey(key.name?.length === 1 ? key.name : key.sequence ?? '')
    })
  } else {
    rl.on('line', (line) => {
      void onKey(line.trim().slice(0, 1) || '')
    })
  }
}

void main()
