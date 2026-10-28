import { beforeEach, describe, expect, it } from 'vitest'
import { useNotes } from './notesStore'

const initial = useNotes.getState()

beforeEach(() => {
  localStorage.clear()
  useNotes.setState(initial, true)
})

describe('用户笔记', () => {
  it('发布：插到最前面，并补上 id / likes / createdAt', () => {
    useNotes.getState().publish({
      type: 'text',
      title: '刚发的笔记',
      tags: ['测试'],
      author: 'Champion',
    })

    const [note] = useNotes.getState().notes
    expect(note.title).toBe('刚发的笔记')
    expect(note.likes).toBe('0')
    expect(note.id).toBeGreaterThan(0)
    expect(note.createdAt).toBeGreaterThan(0)
  })

  it('发布后立刻写进 localStorage（换页不会丢）', () => {
    useNotes.getState().publish({ type: 'text', title: '落盘检查', tags: [], author: 'Champion' })
    const raw = localStorage.getItem('comenius_user_notes')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw as string) as { title: string }[]
    expect(parsed[0].title).toBe('落盘检查')
  })

  it('坏掉的本地下数据不会让 store 初始化失败', () => {
    localStorage.setItem('comenius_user_notes', '{不是 JSON')
    expect(useNotes.getState().notes).toBeDefined()
  })
})
