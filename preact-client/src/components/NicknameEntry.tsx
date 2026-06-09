import { useState } from 'preact/hooks'

interface NicknameEntryProps {
  onSetName: (name: string) => void
  onBack: () => void
  title?: string
}

export function NicknameEntry({
  onSetName,
  onBack,
  title = 'Enter Your Nickname',
}: NicknameEntryProps) {
  const [nick, setNick] = useState(() => localStorage.getItem('nickname') || '')

  function handleSubmit(e: Event) {
    e.preventDefault()
    const trimmed = nick.trim()
    if (!trimmed) return
    localStorage.setItem('nickname', trimmed)
    onSetName(trimmed)
  }

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4">
      <h3 class="text-center mb-4">{title}</h3>
      <form onSubmit={handleSubmit}>
        <div class="row justify-content-center">
          <div class="col-md-6">
            <input
              autoFocus
              type="text"
              class="form-control form-control-lg text-center mb-3"
              placeholder="Enter nickname"
              value={nick}
              onInput={(e) => setNick((e.target as HTMLInputElement).value)}
            />
            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary btn-lg">
                Continue
              </button>
              <button type="button" class="btn btn-outline-secondary" onClick={onBack}>
                Back
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
