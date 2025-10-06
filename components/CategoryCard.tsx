import Image from 'next/image'
import Link from 'next/link'

export type CategoryCardProps = {
  name: string
  href: string
  image: string
}

export default function CategoryCard({ name, href, image }: CategoryCardProps) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-3xl shadow-lg">
      <div className="relative aspect-[16/9] w-full">
        <Image src={image} alt={name} fill className="object-cover transition-transform group-hover:scale-105" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute bottom-4 left-4 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-900 backdrop-blur">
        {name}
      </span>
    </Link>
  )
}
