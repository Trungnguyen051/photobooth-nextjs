import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="z-10 text-3xl flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-6">Photobooth</h1>
      <p className="text-2xl mb-2 text-center">
        Capture memories with our interactive photobooth experience
      </p>
      <div className="flex gap-4 mt-6">
        <Button
          className="rounded-full px-8 py-6 text-2xl font-bold"
          size="lg"
          asChild
        >
          <Link href="/photo-shoot">Start Photo Shoot</Link>
        </Button>
        <Button
          variant="outline"
          className="rounded-full px-8 py-6 text-2xl font-bold"
          size="lg"
          asChild
        >
          <Link href="/gallery">View Gallery</Link>
        </Button>
      </div>
    </div>
  )
}
