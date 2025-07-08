'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { usePhotoSession } from '@/hooks/use-photo-session'
import { Camera, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { toast } from 'sonner'

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user',
}

export default function PhotoShoot() {
  const [currentView, setCurrentView] = useState<'camera' | 'preview'>('camera')
  const [sessionName, setSessionName] = useState('')
  const webcamRef = useRef<Webcam>(null)

  const {
    photos,
    addPhoto,
    removePhoto,
    clearSession,
    uploadPhotosToSupabase,
    isUploading,
    uploadProgress,
    canCapture,
    isSessionComplete,
  } = usePhotoSession()

  const handleCapturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc && canCapture) {
      addPhoto(imageSrc)
      if (photos.length + 1 === 4) {
        setCurrentView('preview')
      }
    }
  }, [addPhoto, canCapture, photos.length])

  const handleRetakePhoto = useCallback(
    (photoId: string) => {
      removePhoto(photoId)
      if (currentView === 'preview') {
        setCurrentView('camera')
      }
    },
    [removePhoto, currentView],
  )

  const handleSaveSession = useCallback(async () => {
    try {
      const sessionId = await uploadPhotosToSupabase(sessionName || undefined)
      toast.success(`Photos saved successfully! Session ID: ${sessionId}`)
      clearSession()
      setCurrentView('camera')
      setSessionName('')
    } catch (error) {
      console.error('Failed to save photos:', error)
      toast.error('Failed to save photos. Please try again.')
    }
  }, [uploadPhotosToSupabase, sessionName, clearSession])

  const handleNewSession = useCallback(() => {
    clearSession()
    setCurrentView('camera')
    setSessionName('')
  }, [clearSession])

  return (
    <div className="z-10 flex flex-col items-center justify-center max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">Photo Booth Session</h1>
      <p className="text-lg text-center mb-8">
        Capture 4 amazing photos for your photo booth session!
      </p>

      {/* Progress indicator */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Photos captured</span>
          <span>{photos.length} / 4</span>
        </div>
        <Progress
          value={(photos.length / 4) * 100}
          className="h-3"
        />
      </div>

      {currentView === 'camera' && (
        <>
          {/* Camera view */}
          <div className="mb-8 rounded-lg overflow-hidden border border-border">
            <Webcam
              ref={webcamRef}
              audio={false}
              height={720}
              screenshotFormat="image/jpeg"
              width={1280}
              videoConstraints={videoConstraints}
              className="w-full max-w-2xl h-auto"
            />
          </div>

          {/* Camera controls */}
          <div className="flex gap-4 mb-8">
            <Button
              size="lg"
              onClick={handleCapturePhoto}
              disabled={!canCapture}
              className="flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {canCapture
                ? `Capture Photo ${photos.length + 1}`
                : 'Session Complete'}
            </Button>

            {photos.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentView('preview')}
                className="flex items-center gap-2"
              >
                Preview Photos ({photos.length})
              </Button>
            )}
          </div>
        </>
      )}

      {currentView === 'preview' && (
        <>
          {/* Photo grid preview */}
          <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-4xl">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group"
              >
                <img
                  src={photo.dataUrl}
                  alt={`Photo ${photo.order}`}
                  className="w-full h-auto rounded-lg border border-border"
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  Photo {photo.order}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRetakePhoto(photo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Empty slots */}
            {[...Array(4 - photos.length)].map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-video bg-muted rounded-lg border border-dashed border-border flex items-center justify-center"
              >
                <span className="text-muted-foreground">
                  Photo {photos.length + index + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Preview controls */}
          <div className="flex flex-col gap-4 mb-8 w-full max-w-md">
            {isSessionComplete && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Session name (optional)"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading photos...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handleSaveSession}
                  disabled={isUploading}
                  className="w-full flex items-center gap-2"
                >
                  {isUploading ? (
                    <Upload className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isUploading ? 'Saving...' : 'Save to Gallery'}
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              {!isSessionComplete && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('camera')}
                  className="flex-1 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Continue Shooting
                </Button>
              )}

              <Button
                variant="destructive"
                onClick={handleNewSession}
                disabled={isUploading}
                className="flex-1 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Session
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-4">
        <Link href="/gallery">
          <Button variant="outline">View Gallery</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
