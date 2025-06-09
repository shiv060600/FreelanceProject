'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Clock, Play, Pause, Square } from "lucide-react"
import { createClient } from "../../../supabase/client"
import { useRouter } from "next/navigation"

export default function TimeTrackingPage() {
  const [isTracking, setIsTracking] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const startTracking = () => {
    setIsTracking(true)
    // Start timer logic here
  }

  const pauseTracking = () => {
    setIsTracking(false)
    // Pause timer logic here
  }

  const stopTracking = () => {
    setIsTracking(false)
    setCurrentTime(0)
    // Stop and save timer logic here
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Time Tracking</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Time Entry
        </Button>
      </div>

      {/* Timer Display */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Clock className="h-6 w-6 text-gray-500" />
            <div className="text-3xl font-mono">
              {Math.floor(currentTime / 3600).toString().padStart(2, '0')}:
              {Math.floor((currentTime % 3600) / 60).toString().padStart(2, '0')}:
              {(currentTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="flex space-x-2">
            {!isTracking ? (
              <Button onClick={startTracking} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTracking} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={stopTracking} variant="outline">
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>
        </div>
      </div>

      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Time Entries</h2>
          <div className="space-y-4">
            {/* Time entries will be listed here */}
            <p className="text-gray-500 text-center py-4">No time entries yet</p>
          </div>
        </div>
      </div>
    </div>
  )
} 