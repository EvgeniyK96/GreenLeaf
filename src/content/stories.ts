/**
 * Реальные истории партнёров. Блок на странице скрыт, пока массив пуст.
 * Добавлять только с письменного согласия героя; без сумм дохода.
 */
export type Story = {
  name: string
  city: string
  started: string
  changed: string
  /** WebP в public/stories/, ширина 800 px. */
  photo?: string
  videoUrl?: string
}

export const storiesCopy = {
  title: 'Истории партнёров',
  lead: 'Реальные люди, с их согласия. Без сумм дохода: что было на старте и что изменилось.',
}

export const stories: Story[] = []
