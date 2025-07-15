'use client'

import { Button } from '@/components/ui/button'
import { supabase, type PhotoSession } from '@/lib/supabase'
import { Calendar, Camera, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface PhotoSessionCardProps {
  session: PhotoSession
  onView: (session: PhotoSession) => void
  onDelete: (sessionId: string) => void
}

export const PhotoSessionCard = ({
  session,
  onView,
  onDelete,
}: PhotoSessionCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteSession = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this photo session? This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      setIsDeleting(true)

      // Delete files from storage bucket first (before database deletion)
      if (session.photos.length > 0) {
        const filePaths = session.photos.map((photo) => {
          // Extract the full path including session folder
          // URL structure: .../photos/session-id/filename.jpg
          const match = photo.image_url.match(/\/photos\/(.+)$/)
          if (match) {
            return match[1] // Returns "session-id/filename.jpg"
          }
          // Fallback: just use the filename (might not work for nested files)
          const urlParts = photo.image_url.split('/')
          return urlParts[urlParts.length - 1]
        })

        console.log('Deleting files:', filePaths)
        const { error: storageError } = await supabase.storage
          .from('photos')
          .remove(filePaths)

        if (storageError) {
          console.warn('Error deleting files from storage:', storageError)
          // Continue with database deletion even if storage cleanup fails
        } else {
          console.log('Successfully deleted files from storage')
        }
      }

      // Delete the session - CASCADE will automatically delete related photos
      const { error: sessionError } = await supabase
        .from('photo_sessions')
        .delete()
        .eq('id', session.id)

      if (sessionError) {
        throw sessionError
      }

      // Update UI by removing the session from the parent component
      onDelete(session.id)
    } catch (err) {
      console.error('Error deleting session:', err)
      alert('Failed to delete photo session. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Session thumbnail grid */}
      <div className="aspect-square bg-muted relative">
        <div className="grid grid-cols-2 gap-1 p-2 h-full">
          {session.photos
            .sort((a, b) => a.order_number - b.order_number)
            .slice(0, 4)
            .map((photo, index) => (
              <div
                key={photo.id}
                className="relative overflow-hidden rounded-sm bg-muted-foreground/10"
              >
                <img
                  src={photo.image_url}
                  alt={`Photo ${photo.order_number}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          {/* Fill empty slots if less than 4 photos */}
          {[...Array(Math.max(0, 4 - session.photos.length))].map(
            (_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-muted rounded-sm flex items-center justify-center"
              >
                <Camera className="w-4 h-4 text-muted-foreground" />
              </div>
            ),
          )}
        </div>
        {session.photos.length > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {session.photos.length} photos
          </div>
        )}
      </div>

      {/* Session info */}
      <div className="p-4">
        <h3 className="font-semibold mb-1 truncate">
          {session.session_name || 'Untitled Session'}
        </h3>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(session.created_at).toLocaleDateString()}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(session)}
            className="flex-1 flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSession}
            disabled={isDeleting}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
            {isDeleting ? '...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
