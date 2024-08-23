import React from 'react';
import type { MouseEvent, KeyboardEvent } from 'react'
import { GripHorizontal } from 'lucide-react';
import {
  useDraggable,
  useDroppable,
  MouseSensor as LibMouseSensor,
  KeyboardSensor as LibKeyboardSensor,
  PointerSensor,
} from '@dnd-kit/core';
import { cn } from '@/lib/utils'

interface DroppableTypes {
  id: string
  children: React.ReactNode
  onHover: string
  className: string
}

interface DraggableTypes {
  id: string
  isLoading: boolean
  children: React.ReactNode
  className: string
}

export class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as any,
      handler: ({ nativeEvent: event }: PointerEvent) => {
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          isInteractiveElement(event.target as Element)
        ) {
          return false;
        }

        return true;
      },
    },
  ];
}

function isInteractiveElement(element: Element | null) {
  const interactiveElements = [
    "button",
    "input",
    "textarea",
    "select",
    "option",
  ];
  if (
    element?.tagName &&
    interactiveElements.includes(element.tagName.toLowerCase())
  ) {
    return true;
  }

  return false;
}

const Droppable: React.ReactNode<DroppableTypes> = ({ id, children, onHover, className }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div ref={setNodeRef} className={cn(className, isOver && onHover)}>
      {children}
    </div >
  )
}

export class MouseSensor extends LibMouseSensor {
  static activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: ({ nativeEvent: event }: MouseEvent) => {
        return shouldHandleEvent(event.target as HTMLElement)
      }
    }
  ]
}

export class KeyboardSensor extends LibKeyboardSensor {
  static activators = [
    {
      eventName: 'onKeyDown' as const,
      handler: ({ nativeEvent: event }: KeyboardEvent<Element>) => {
        return shouldHandleEvent(event.target as HTMLElement)
      }
    }
  ]
}

function shouldHandleEvent(element: HTMLElement | null) {
  let cur = element

  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false
    }
    cur = cur.parentElement
  }

  return true
}

const Draggable: React.ReactNode<DraggableTypes> = ({
  id,
  isLoading,
  children,
  className,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(.8)`,
    zIndex: 50,
  } : undefined

  return (
    <div ref={setNodeRef} style={style} className={cn(className, 'pt-0')}>
      {isLoading ? (
        <button className={cn('flex h-4 w-4 self-center mb-1 text-zinc-200 cursor-default')}>
          <GripHorizontal />
        </button>
      ) : (
        <button {...listeners} {...attributes} className={cn('flex h-4 w-4 self-center mb-1 text-zinc-700 cursor-move')}>
          <GripHorizontal />
        </button>
      )}
      {children}
    </div>
  )
}

export { Draggable, Droppable }
