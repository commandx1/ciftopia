const CoupleNames = ({ coupleNames, className = '' }: { coupleNames?: string; className?: string }) => {
  if (!coupleNames) return null

  return (
    <h1 className={`text-4xl font-bold text-gray-900 mb-3 capitalize font-playfair-display ${className}`}>
      {coupleNames}
    </h1>
  )
}

export default CoupleNames
