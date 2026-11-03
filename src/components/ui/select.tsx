import { Children, isValidElement, useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface OptionData {
  value: string
  label: React.ReactNode
  /** Plain text, for type-to-search. */
  text: string
  disabled: boolean
}

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/** Options are declared as ordinary <option> children, exactly like a native select. */
function readOptions(children: React.ReactNode): OptionData[] {
  const options: OptionData[] = []
  Children.forEach(children, (child) => {
    if (!isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child)) return
    if (child.type !== 'option') return
    const { value, children: label, disabled } = child.props
    options.push({
      value: String(value ?? ''),
      label,
      text: textOf(label).trim().toLowerCase(),
      disabled: Boolean(disabled),
    })
  })
  return options
}

interface MenuPosition {
  left: number
  minWidth: number
  maxWidth: number
  maxHeight: number
  top?: number
  bottom?: number
}

export interface SelectProps {
  id?: string
  name?: string
  value: string
  onValueChange: (value: string) => void
  onBlur?: () => void
  children: React.ReactNode
  disabled?: boolean
  placeholder?: string
  className?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-label'?: string
}

const MENU_MAX_HEIGHT = 288

/**
 * A styled select that matches the rest of the UI instead of the browser's native list.
 * Follows the ARIA "select-only combobox" pattern: focus stays on the button, the highlighted
 * option is announced through aria-activedescendant, and the list renders in a portal so it is
 * never clipped by a dialog or a filter panel.
 */
export function Select({
  id,
  name,
  value,
  onValueChange,
  onBlur,
  children,
  disabled = false,
  placeholder = 'Select…',
  className,
  ...aria
}: SelectProps) {
  const options = readOptions(children)
  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef({ text: '', at: 0 })
  const listId = useId()
  const reduceMotion = useReducedMotion()

  /** Below the button when there is room, otherwise above it. */
  const place = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const spaceAbove = rect.top - 8
    const wanted = Math.min(MENU_MAX_HEIGHT, options.length * 40 + 10)
    const below = spaceBelow >= wanted || spaceBelow >= spaceAbove
    setPosition({
      left: rect.left,
      minWidth: rect.width,
      maxWidth: Math.max(rect.width, window.innerWidth - rect.left - 8),
      maxHeight: Math.max(120, Math.min(MENU_MAX_HEIGHT, below ? spaceBelow : spaceAbove)),
      ...(below ? { top: rect.bottom + 6 } : { bottom: window.innerHeight - rect.top + 6 }),
    })
  }, [options.length])

  const isEnabled = (index: number) => Boolean(options[index] && !options[index]!.disabled)

  /** The next enabled option from `from` in `direction`, wrapping around. */
  const step = (from: number, direction: 1 | -1) => {
    let index = from
    for (let n = 0; n < options.length; n++) {
      index = (index + direction + options.length) % options.length
      if (isEnabled(index)) return index
    }
    return from
  }

  const openMenu = (startAt: number) => {
    if (disabled || options.length === 0) return
    place()
    setActive(startAt)
    setOpen(true)
  }

  const close = () => setOpen(false)

  const choose = (index: number) => {
    const option = options[index]
    if (!option || option.disabled) return
    if (option.value !== value) onValueChange(option.value)
    close()
    buttonRef.current?.focus()
  }

  /** Type-to-search: letters typed within half a second build one search string. */
  const match = (key: string): number => {
    const now = Date.now()
    const buffer = now - typeahead.current.at < 500 ? typeahead.current.text + key : key
    typeahead.current = { text: buffer, at: now }
    const start = open ? active : selectedIndex
    for (let n = 1; n <= options.length; n++) {
      const index = (start + n + options.length) % options.length
      if (isEnabled(index) && options[index]!.text.startsWith(buffer.toLowerCase())) return index
    }
    return -1
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        openMenu(
          selectedIndex >= 0
            ? selectedIndex
            : step(event.key === 'ArrowUp' ? 0 : -1, event.key === 'ArrowUp' ? -1 : 1),
        )
      } else if (printable) {
        // Like a native select, typing while closed changes the value directly.
        const found = match(event.key)
        if (found >= 0 && options[found]!.value !== value) onValueChange(options[found]!.value)
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive((index) => step(index, 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((index) => step(index < 0 ? 0 : index, -1))
        break
      case 'Home':
        event.preventDefault()
        setActive(step(-1, 1))
        break
      case 'End':
        event.preventDefault()
        setActive(step(0, -1))
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (active >= 0) choose(active)
        break
      case 'Escape':
        // Close only this menu, not the dialog or filter panel it sits in.
        event.preventDefault()
        event.stopPropagation()
        close()
        break
      case 'Tab':
        close()
        break
      default:
        if (printable) {
          const found = match(event.key)
          if (found >= 0) setActive(found)
        }
    }
  }

  // Keep the menu attached to the button while the page scrolls or resizes, and close it on a
  // press anywhere else (Safari does not focus buttons on click, so blur alone is not enough).
  useEffect(() => {
    if (!open) return
    const update = () => place()
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) return
      setOpen(false)
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, place])

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || active < 0) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  return (
    <>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
        aria-label={aria['aria-label']}
        disabled={disabled}
        onClick={() =>
          open ? close() : openMenu(selectedIndex >= 0 ? selectedIndex : step(-1, 1))
        }
        onKeyDown={onKeyDown}
        onBlur={() => {
          close()
          onBlur?.()
        }}
        className={cn(
          'relative flex h-10 w-full items-center rounded-lg border border-input bg-card pl-3 pr-9 text-left text-sm outline-none transition-[border-color,box-shadow]',
          'hover:border-ring/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20',
          'disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive',
          open && 'border-ring ring-2 ring-ring/20',
          className,
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </button>
      {name ? <input type="hidden" name={name} value={value} /> : null}

      {open && position
        ? createPortal(
            <motion.ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={id}
              data-floating-layer=""
              initial={
                reduceMotion ? false : { opacity: 0, y: position.top !== undefined ? -4 : 4 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.12, ease: 'easeOut' }}
              // Clicks inside the list must not steal focus from the button.
              onMouseDown={(event) => event.preventDefault()}
              style={position}
              className="scrollbar-thin fixed z-[70] overflow-y-auto rounded-xl border border-border bg-popover p-1 text-sm text-popover-foreground shadow-raised"
            >
              {options.map((option, index) => {
                const isSelected = index === selectedIndex
                return (
                  // Keyboard input is handled by the combobox button through
                  // aria-activedescendant, as the ARIA pattern specifies; options only take clicks.
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <li
                    key={`${option.value}-${index}`}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    data-index={index}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(index)}
                    className={cn(
                      'flex cursor-pointer select-none items-center gap-3 rounded-lg px-2.5 py-2',
                      index === active && 'bg-accent text-accent-foreground',
                      isSelected && 'font-medium text-foreground',
                      option.disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span className="min-w-0 flex-1">{option.label}</span>
                    <Check
                      aria-hidden="true"
                      className={cn('size-4 shrink-0 text-primary', !isSelected && 'invisible')}
                    />
                  </li>
                )
              })}
            </motion.ul>,
            document.body,
          )
        : null}
    </>
  )
}
