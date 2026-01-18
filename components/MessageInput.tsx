'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Paperclip, Smile, Mic, X, Image as ImageIcon } from 'lucide-react'
import dynamic from 'next/dynamic'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text') => void
  onSendFile?: (file: File, type: 'image' | 'file' | 'voice') => void
  onTyping?: (isTyping: boolean) => void
  replyTo?: {
    content?: string
    sender?: {
      username: string
    }
  }
  onCancelReply?: () => void
}

export function MessageInput({
  onSendMessage,
  onSendFile,
  onTyping,
  replyTo,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text')
      setMessage('')
      onTyping?.(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    
    // Typing indicator
    if (onTyping) {
      onTyping(true)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false)
      }, 1000)
    }
  }

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onSendFile) {
      onSendFile(file, 'file')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onSendFile) {
      onSendFile(file, 'image')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' })
        if (onSendFile) {
          onSendFile(audioFile, 'voice')
        }
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="border-t bg-background p-4">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between bg-accent px-3 py-2 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">Replying to {replyTo.sender?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancelReply} className="h-6 w-6 ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            disabled={isRecording}
            className="h-10 w-10"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording}
            className="h-10 w-10"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={isRecording}
              className="h-10 w-10"
            >
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>

        <Input
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isRecording}
          className="flex-1"
        />

        {message.trim() ? (
          <Button onClick={handleSend} size="icon" className="h-10 w-10">
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant={isRecording ? 'destructive' : 'default'}
            size="icon"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            className="h-10 w-10"
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {isRecording && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          Recording... Release to send
        </div>
      )}
    </div>
  )
}
