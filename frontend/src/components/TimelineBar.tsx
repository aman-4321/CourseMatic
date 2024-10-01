import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

export interface CardProps {
    id: any
    index: number
    moveCard: (dragIndex: number, hoverIndex: number) => void
    duration: number
    seek: any,
    vidIndex: number
}


export default function TimelineBar({ id, index, moveCard, duration, seek, vidIndex }: CardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [{ handlerId }, drop] = useDrop<any, void, { handlerId: any | null }>({
        accept: 'card',
        collect(monitor: any) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: any, monitor: any) {
            if (!ref.current) {
                return;
            }

            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine the rectangle on the screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get horizontal middle
            const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the left
            const hoverClientX = clientOffset.x - hoverBoundingRect.left;

            // Only perform the move when the mouse has crossed half of the item's width
            // When dragging rightwards, only move when the cursor is beyond 50%
            // When dragging leftwards, only move when the cursor is before 50%

            // Dragging rightwards
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
                return;
            }

            // Dragging leftwards
            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
                return;
            }

            // Time to actually perform the action
            moveCard(dragIndex, hoverIndex);

            // Mutate the item index for performance reasons
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'card',
        item: () => {
            return { id, index };
        },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0.4 : 1;
    drag(drop(ref));

    return (
        <div style={{ opacity: opacity }} data-handler-id={handlerId} ref={ref} key={`vide${index}`} className="flex items-center px-2 bg-slate-300 rounded-sm py-1 mr-1">
            {Array.from({ length: duration }).map((_, index) => {
                const barHeight = (index % 5 == 0 ? 9 : 6)
                return (
                    <div key={`dur${index}`} className="cursor-move py-1">
                        <div className='pr-[5px] cursor-pointer' onClick={() => { seek(index, vidIndex) }}>
                            <button value={index} className='bg-black w-[1px] rounded-md' style={{ height: barHeight * 4 }} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
