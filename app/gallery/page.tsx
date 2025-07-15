'use client'

import { PhotoSessionCard } from '@/components/photo-session-card'
import { Button } from '@/components/ui/button'
import { supabase, type PhotoSession } from '@/lib/supabase'
import { Camera, Download } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

export default function Gallery() {
  const [sessions, setSessions] = useState<PhotoSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<PhotoSession | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('photo_sessions')
        .select(
          `
          *,
          photos (
            id,
            image_url,
            order_number,
            created_at
          )
        `,
        )
        .order('created_at', { ascending: false })

      if (sessionsError) {
        throw sessionsError
      }

      setSessions(sessionsData as PhotoSession[])
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError('Failed to load photo sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== sessionId),
    )
  }, [])

  const handleDownloadSession = useCallback(async (session: PhotoSession) => {
    try {
      // Create a zip-like download experience by opening images in new tabs
      session.photos.forEach((photo, index) => {
        setTimeout(() => {
          const link = document.createElement('a')
          link.href = photo.image_url
          link.download = `${session.session_name || 'session'}_photo_${
            photo.order_number
          }.jpg`
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, index * 500) // Stagger downloads
      })
    } catch (err) {
      console.error('Error downloading session:', err)
    }
  }, [])

  if (loading) {
    return (
      <div className="z-10 flex flex-col items-center justify-center max-w-6xl mx-auto p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading gallery...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="z-10 flex flex-col items-center justify-center max-w-6xl mx-auto p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          onClick={fetchSessions}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="z-10 flex flex-col items-center justify-center max-w-6xl mx-auto p-6">
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold">Photo Gallery</h1>
            <p className="text-lg text-muted-foreground">
              Browse your photo booth sessions
            </p>
          </div>
          <Link href="/photo-shoot">
            <Button className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              New Session
            </Button>
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your first photo booth session to see photos here
            </p>
            <Link href="/photo-shoot">
              <Button>Take Your First Photos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <PhotoSessionCard
                key={session.id}
                session={session}
                onView={setSelectedSession}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}
      </div>

      {/* Session detail modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedSession.session_name || 'Untitled Session'}
                  </h2>
                  <p className="text-muted-foreground">
                    {new Date(selectedSession.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSession(null)}
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSession.photos
                  .sort((a, b) => a.order_number - b.order_number)
                  .map((photo) => (
                    <div
                      key={photo.id}
                      className="relative"
                    >
                      <img
                        src={photo.image_url}
                        alt={`Photo ${photo.order_number}`}
                        className="w-full h-auto rounded-lg border border-border"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        Photo {photo.order_number}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => handleDownloadSession(selectedSession)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download All Photos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/">
          <Button variant="ghost">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
