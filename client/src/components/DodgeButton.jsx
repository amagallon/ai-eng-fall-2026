import { useEffect, useRef, useState } from 'react'
import { DODGE_SETTINGS } from '../constants'

function DodgeButton({ areaRef, cursorPositionRef, tier, isActive, onClick }) {
  const [position, setPosition] = useState({ left: 16, top: 220 })
  const positionRef = useRef(position)
  const buttonRef = useRef(null)
  const settings = DODGE_SETTINGS[tier]

  useEffect(() => {
    if (!isActive) {
      return undefined
    }

    function moveToRandomSafePosition(maxLeft, maxTop, cursor, buttonWidth, buttonHeight) {
      const acceptablePositions = []
      const jumpDistanceSquared = settings.jumpDistancePx ** 2

      for (let attempt = 0; attempt < 100; attempt += 1) {
        const candidate = {
          left: Math.random() * maxLeft,
          top: Math.random() * maxTop,
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
          for (let top = 0; top <= maxTop; top += step) {
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
        { left: 0, top: 0 },
        { left: maxLeft, top: 0 },
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

    function animate() {
      const area = areaRef.current
      const button = buttonRef.current
      const cursor = cursorPositionRef.current

      if (area && button) {
        const maxLeft = Math.max(0, area.clientWidth - button.offsetWidth)
        const maxTop = Math.max(0, area.clientHeight - button.offsetHeight)
        const storedPosition = positionRef.current
        const current = {
          left: Math.min(maxLeft, Math.max(0, storedPosition.left)),
          top: Math.min(maxTop, Math.max(0, storedPosition.top)),
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
              nextTop < 0 ||
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
    return () => window.cancelAnimationFrame(frameId)
  }, [
    areaRef,
    cursorPositionRef,
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
