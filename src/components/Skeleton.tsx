interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return <div className={`animate-pulse rounded-xl bg-white/6 ${className}`} />
}
