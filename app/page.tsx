import SquaresBackground from '@/components/squares-background'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="w-full h-screen relative bg-accent-foreground flex flex-col items-center justify-center text-muted">
      <div className="z-10 text-3xl flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold mb-6">Photobooth</h1>
        <p className="text-2xl mb-2 text-center">
          Capture memories with our interactive photobooth experience
        </p>
        <Button
          className="mt-6 bg-white text-black hover:bg-gray-100 rounded-full px-8 py-6 text-2xl font-bold"
          size="lg"
          asChild
        >
          <Link href="/photo-shoot">Start Photo Shoot</Link>
        </Button>
      </div>
      <SquaresBackground
        speed={0.5}
        squareSize={40}
        direction="diagonal" // up, down, left, right, diagonal
        borderColor="#fff"
        hoverFillColor="#222"
        className="absolute -z-0"
      />
    </div>
  )
}
