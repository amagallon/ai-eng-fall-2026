import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DODGE_SETTINGS } from '../constants'

function DodgeButton({ tier, isActive, onClick }) {
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const positionRef = useRef(position)
  const buttonRef = useRef(null)
  const cursorPositionRef = useRef(null)
  const topBoundaryRef = useRef(0)
  const settings = DODGE_SETTINGS[tier]

  useLayoutEffect(() => {
    const timerPanel = document.querySelector('.timer-panel')
    const button = buttonRef.current
    if (!timerPanel || !button) {
      return
    }

    const panelBounds = timerPanel.getBoundingClientRect()
    const maxLeft = Math.max(0, window.innerWidth - button.offsetWidth)
    const maxTop = Math.max(0, window.innerHeight - button.offsetHeight)
    const nav = document.querySelector('.topbar')
    const minTop = nav
      ? Math.min(nav.getBoundingClientRect().bottom, maxTop)
      : 0
    const nextPosition = {
      left: Math.min(
        maxLeft,
        Math.max(0, panelBounds.left + (panelBounds.width - button.offsetWidth) / 2),
      ),
      top: Math.min(maxTop, Math.max(minTop, panelBounds.bottom + 16)),
    }

    positionRef.current = nextPosition
    setPosition(nextPosition)
  }, [])

  useEffect(() => {
    if (!isActive) {
      return undefined
    }

    function updateCursorPosition(event) {
      cursorPositionRef.current = { x: event.clientX, y: event.clientY }
    }

    function clearCursorPosition(event) {
      if (!event.relatedTarget) {
        cursorPositionRef.current = null
      }
    }

    function updateTopBoundary() {
      const topbar = document.querySelector('.topbar')
      const button = buttonRef.current
      const maxTop = button
        ? Math.max(0, window.innerHeight - button.offsetHeight)
        : window.innerHeight
      const navBottom = topbar ? topbar.getBoundingClientRect().bottom : 0
      topBoundaryRef.current = Math.min(navBottom, maxTop)
    }

    function moveToRandomSafePosition(maxLeft, maxTop, cursor, buttonWidth, buttonHeight) {
      const acceptablePositions = []
      const jumpDistanceSquared = settings.jumpDistancePx ** 2

      for (let attempt = 0; attempt < 100; attempt += 1) {
        const candidate = {
          left: Math.random() * maxLeft,
          top:
            topBoundaryRef.current +
            Math.random() * (maxTop - topBoundaryRef.current),
        }
        const centerX = candidate.left + buttonWidth / 2
        const centerY = candidate.top + buttonHeight / 2
        const distanceSquared =
          (centerX - cursor.x) ** 2 + (centerY - cursor.y) ** 2

        if (distanceSquared >= jumpDistanceSquared) {
          acceptablePositions.push(candidate)
        }
      }

      if (acceptablePositions.length === 0) {
        const step = 20
        for (let left = 0; left <= maxLeft; left += step) {
          for (let top = topBoundaryRef.current; top <= maxTop; top += step) {
            const candidate = {
              left: Math.min(left, maxLeft),
              top: Math.min(top, maxTop),
            }
            const centerX = candidate.left + buttonWidth / 2
            const centerY = candidate.top + buttonHeight / 2
            const distanceSquared =
              (centerX - cursor.x) ** 2 + (centerY - cursor.y) ** 2

            if (distanceSquared >= jumpDistanceSquared) {
              acceptablePositions.push(candidate)
            }
          }
        }
      }

      if (acceptablePositions.length > 0) {
        return acceptablePositions[
          Math.floor(Math.random() * acceptablePositions.length)
        ]
      }

      const corners = [
        { left: 0, top: topBoundaryRef.current },
        { left: maxLeft, top: topBoundaryRef.current },
        { left: 0, top: maxTop },
        { left: maxLeft, top: maxTop },
      ]

      return corners.reduce((farthest, candidate) => {
        const candidateDistance = Math.hypot(
          candidate.left + buttonWidth / 2 - cursor.x,
          candidate.top + buttonHeight / 2 - cursor.y,
        )
        const farthestDistance = Math.hypot(
          farthest.left + buttonWidth / 2 - cursor.x,
          farthest.top + buttonHeight / 2 - cursor.y,
        )

        return candidateDistance > farthestDistance ? candidate : farthest
      })
    }

    let frameId
    updateTopBoundary()
    window.addEventListener('pointermove', updateCursorPosition)
    window.addEventListener('pointerdown', updateCursorPosition)
    window.addEventListener('pointerleave', clearCursorPosition)
    window.addEventListener('resize', updateTopBoundary)

    function animate() {
      const button = buttonRef.current
      const cursor = cursorPositionRef.current

      if (button) {
        const maxLeft = Math.max(0, window.innerWidth - button.offsetWidth)
        const maxTop = Math.max(0, window.innerHeight - button.offsetHeight)
        const minTop = Math.min(topBoundaryRef.current, maxTop)
        const storedPosition = positionRef.current
        const current = {
          left: Math.min(maxLeft, Math.max(0, storedPosition.left)),
          top: Math.min(maxTop, Math.max(minTop, storedPosition.top)),
        }

        if (
          current.left !== storedPosition.left ||
          current.top !== storedPosition.top
        ) {
          positionRef.current = current
          setPosition(current)
        }

        if (cursor) {
          const cursorIsOnButton =
            cursor.x >= current.left &&
            cursor.x <= current.left + button.offsetWidth &&
            cursor.y >= current.top &&
            cursor.y <= current.top + button.offsetHeight

          const centerX = current.left + button.offsetWidth / 2
          const centerY = current.top + button.offsetHeight / 2
          const deltaX = centerX - cursor.x
          const deltaY = centerY - cursor.y
          const distance = Math.hypot(deltaX, deltaY)

          if (!cursorIsOnButton && distance <= settings.triggerRadiusPx) {
            const angle = distance === 0 ? Math.random() * Math.PI * 2 : null
            const directionX = distance === 0 ? Math.cos(angle) : deltaX / distance
            const directionY = distance === 0 ? Math.sin(angle) : deltaY / distance
            const nextLeft = current.left + directionX * settings.speedPxPerFrame
            const nextTop = current.top + directionY * settings.speedPxPerFrame
            let nextPosition

            if (
              nextLeft < 0 ||
              nextLeft > maxLeft ||
              nextTop < minTop ||
              nextTop > maxTop
            ) {
              nextPosition = moveToRandomSafePosition(
                maxLeft,
                maxTop,
                cursor,
                button.offsetWidth,
                button.offsetHeight,
              )
            } else {
              nextPosition = { left: nextLeft, top: nextTop }
            }

            positionRef.current = nextPosition
            setPosition(nextPosition)
          }
        }
      }

      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', updateCursorPosition)
      window.removeEventListener('pointerdown', updateCursorPosition)
      window.removeEventListener('pointerleave', clearCursorPosition)
      window.removeEventListener('resize', updateTopBoundary)
      cursorPositionRef.current = null
    }
  }, [
    isActive,
    settings.jumpDistancePx,
    settings.speedPxPerFrame,
    settings.triggerRadiusPx,
  ])

  return (
    <button
      className="dodge-button"
      ref={buttonRef}
      type="button"
      onClick={onClick}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      Stop session
    </button>
  )
}

export default DodgeButton
