'use client'

interface LibraryListItemProps {
  title: string
  subtitle: string
  onClick: () => void
}

export default function LibraryListItem({ title, subtitle, onClick }: LibraryListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors text-left"
    >
      <h3 className="font-medium">{title}</h3>
      <span className="text-xs text-gray-500">{subtitle}</span>
    </button>
  )
}
