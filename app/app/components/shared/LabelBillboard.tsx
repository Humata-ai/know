import { Billboard, Text } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { Vector3 } from 'three'

interface LabelBillboardProps {
  position: [number, number, number] | Vector3
  text: string
  fontSize?: number
  color: string
  fontWeight?: 'normal' | 'bold'
  fillOpacity?: number
  outlineWidth?: number
  outlineColor?: string
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void
}

export default function LabelBillboard({
  position,
  text,
  fontSize = 1.5,
  color,
  fontWeight = 'normal',
  fillOpacity = 1,
  outlineWidth = 0.1,
  outlineColor = '#000000',
  onClick,
  onPointerOver,
  onPointerOut,
}: LabelBillboardProps) {
  return (
    <Billboard
      position={position}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <Text
        position={[0, 0, 0]}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={outlineWidth}
        outlineColor={outlineColor}
        fillOpacity={fillOpacity}
        fontWeight={fontWeight}
      >
        {text}
      </Text>
    </Billboard>
  )
}
