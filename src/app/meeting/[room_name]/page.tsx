'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Meeting from '@/components/Meeting'
import { useJoinMeetingQuery } from '@/features/api/meetingsApi'
import { useToast } from '@/components/ui/toast-provider'
import { Loader2 } from 'lucide-react'

export default function MeetingPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const roomName = params.room_name as string

  const { data: joinData, isLoading, isError } = useJoinMeetingQuery(roomName, {
    skip: !roomName,
  })

  useEffect(() => {
    if (isError) {
      showToast('Failed to join meeting. Please try again.', 'error')
      // Redirect back after a delay
      setTimeout(() => {
        router.push('/meetings')
      }, 2000)
    }
  }, [isError, showToast, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Joining meeting...</p>
        </div>
      </div>
    )
  }

  if (isError || !joinData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to join meeting</p>
          <button
            onClick={() => router.push('/meetings')}
            className="text-primary hover:underline"
          >
            Go back to meetings
          </button>
        </div>
      </div>
    )
  }

  return (
    <Meeting
      room={joinData.room_name}
      jwt={joinData.token}
      domain={joinData.domain}
    />
  )
}
