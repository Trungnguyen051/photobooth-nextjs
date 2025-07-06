import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PhotoShoot() {
  return (
    <div className="w-full h-screen relative bg-accent-foreground flex flex-col items-center justify-center text-muted">
      <div className="z-10 flex flex-col items-center justify-center max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Photo Shoot</h1>
        <p className="text-lg text-center mb-8">
          Welcome to the photo shoot page! Here you can capture amazing photos.
        </p>

        <div className="flex gap-4 mb-8">
          <Button size="lg">Take Photo</Button>
          <Button
            variant="outline"
            size="lg"
          >
            View Gallery
          </Button>
        </div>

        <Link href="/">
          <Button variant="ghost">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
