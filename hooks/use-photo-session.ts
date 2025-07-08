'use client'

import { supabase } from '@/lib/supabase'
import { useCallback, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface CapturedPhoto {
  id: string
  dataUrl: string
  order: number
}

export const usePhotoSession = () => {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const addPhoto = useCallback(
    (dataUrl: string) => {
      const newPhoto: CapturedPhoto = {
        id: uuidv4(),
        dataUrl,
        order: photos.length + 1,
      }
      setPhotos((prev) => [...prev, newPhoto])
    },
    [photos.length],
  )

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((photo) => photo.id !== photoId)
      // Reorder the remaining photos
      return filtered.map((photo, index) => ({
        ...photo,
        order: index + 1,
      }))
    })
  }, [])

  const retakePhoto = useCallback(
    (photoId: string) => {
      removePhoto(photoId)
    },
    [removePhoto],
  )

  const clearSession = useCallback(() => {
    setPhotos([])
    setUploadProgress(0)
  }, [])

  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const uploadPhotosToSupabase = useCallback(
    async (sessionName?: string) => {
      if (photos.length === 0) {
        throw new Error('No photos to upload')
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        // Create a new photo session
        const sessionId = uuidv4()
        const { data: sessionData, error: sessionError } = await supabase
          .from('photo_sessions')
          .insert({
            id: sessionId,
            session_name:
              sessionName || `Photo Session ${new Date().toLocaleDateString()}`,
          })
          .select()
          .single()

        if (sessionError) {
          console.error('Session creation error:', sessionError)
          throw new Error(`Failed to create session: ${sessionError.message}`)
        }

        const uploadPromises = photos.map(async (photo, index) => {
          // Convert data URL to file
          const file = dataURLtoFile(photo.dataUrl, `photo_${photo.order}.jpg`)

          // Upload to Supabase Storage
          const fileName = `${sessionId}/photo_${photo.order}_${Date.now()}.jpg`
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from('photos').upload(fileName, file)

          if (uploadError) {
            throw uploadError
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName)

          // Save photo record to database
          const { data: photoData, error: photoError } = await supabase
            .from('photos')
            .insert({
              id: photo.id,
              session_id: sessionId,
              image_url: urlData.publicUrl,
              order_number: photo.order,
            })
            .select()
            .single()

          if (photoError) {
            console.error('Photo insert error:', photoError)
            throw new Error(
              `Failed to save photo ${photo.order}: ${photoError.message}`,
            )
          }

          // Update progress
          setUploadProgress(((index + 1) / photos.length) * 100)
        })

        await Promise.all(uploadPromises)

        return sessionId
      } catch (error) {
        console.error('Error uploading photos:', error)
        throw error
      } finally {
        setIsUploading(false)
      }
    },
    [photos],
  )

  return {
    photos,
    addPhoto,
    removePhoto,
    retakePhoto,
    clearSession,
    uploadPhotosToSupabase,
    isUploading,
    uploadProgress,
    canCapture: photos.length < 4,
    isSessionComplete: photos.length === 4,
  }
}
