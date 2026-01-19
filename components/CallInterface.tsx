'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CallInterfaceProps {
  callerName?: string
  callerImage?: string
  isVideo: boolean
  onEndCall: () => void
  isIncoming?: boolean
  onAccept?: () => void
  onReject?: () => void
}

export function CallInterface({
  callerName = 'Unknown',
  callerImage,
  isVideo,
  onEndCall,
  isIncoming = false,
  onAccept,
  onReject,
}: CallInterfaceProps) {
  const [callDuration, setCallDuration] = useState(0)
  const [isCallActive, setIsCallActive] = useState(!isIncoming)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAccept = () => {
    setIsCallActive(true)
    onAccept?.()
  }

  const handleReject = () => {
    onReject?.()
    onEndCall()
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80 z-50 flex flex-col items-center justify-between p-6 md:p-8">
      {/* Call Info */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-6 ring-4 ring-primary-foreground/20">
          <AvatarImage src={callerImage} />
          <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-2xl md:text-3xl">
            {getInitials(callerName)}
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
          {callerName}
        </h2>
        
        <p className="text-primary-foreground/80 text-sm md:text-base mb-1">
          {isIncoming && !isCallActive ? 'Incoming ' : ''}
          {isVideo ? 'Video' : 'Voice'} Call
        </p>
        
        {isCallActive && (
          <p className="text-primary-foreground/60 text-lg md:text-xl font-mono mt-2">
            {formatDuration(callDuration)}
          </p>
        )}
        
        {!isCallActive && !isIncoming && (
          <p className="text-primary-foreground/60 text-sm animate-pulse mt-2">
            Calling...
          </p>
        )}
      </div>

      {/* Video Preview (placeholder for actual video stream) */}
      {isVideo && isCallActive && !isVideoOff && (
        <div className="absolute top-4 right-4 w-32 h-40 md:w-40 md:h-48 bg-black/50 rounded-lg border-2 border-primary-foreground/20 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-primary-foreground/50 text-xs">
            Your Video
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="w-full max-w-md">
        {isIncoming && !isCallActive ? (
          // Incoming call buttons
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <Button
              size="lg"
              variant="destructive"
              className="h-14 w-14 md:h-16 md:w-16 rounded-full"
              onClick={handleReject}
            >
              <PhoneOff className="h-6 w-6 md:h-7 md:w-7" />
            </Button>
            <Button
              size="lg"
              className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-green-500 hover:bg-green-600"
              onClick={handleAccept}
            >
              <Phone className="h-7 w-7 md:h-8 md:w-8" />
            </Button>
          </div>
        ) : (
          // Active call controls
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <Button
              size="lg"
              variant="secondary"
              className={cn(
                'h-12 w-12 md:h-14 md:w-14 rounded-full',
                isMuted && 'bg-destructive hover:bg-destructive/90'
              )}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <Mic className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </Button>

            {isVideo && (
              <Button
                size="lg"
                variant="secondary"
                className={cn(
                  'h-12 w-12 md:h-14 md:w-14 rounded-full',
                  isVideoOff && 'bg-destructive hover:bg-destructive/90'
                )}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? (
                  <VideoOff className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Video className="h-5 w-5 md:h-6 md:w-6" />
                )}
              </Button>
            )}

            <Button
              size="lg"
              variant="secondary"
              className={cn(
                'h-12 w-12 md:h-14 md:w-14 rounded-full',
                isSpeakerOn && 'bg-primary hover:bg-primary/90'
              )}
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            >
              {isSpeakerOn ? (
                <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <VolumeX className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </Button>

            <Button
              size="lg"
              variant="destructive"
              className="h-14 w-14 md:h-16 md:w-16 rounded-full ml-2"
              onClick={onEndCall}
            >
              <PhoneOff className="h-6 w-6 md:h-7 md:w-7" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
