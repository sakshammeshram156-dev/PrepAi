import { useEffect, useRef, useState } from 'react'

const SpeechRecognitionAPI =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export default function MicButton({ onResult, disabled }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const supported = !!SpeechRecognitionAPI

  useEffect(() => {
    if (!supported) return
    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onResult(transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    return () => recognition.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!supported) {
    return (
      <div className="text-xs text-slate-400 italic px-2">
        Voice input isn't supported in this browser — please type your answer.
      </div>
    )
  }

  const toggle = () => {
    if (disabled) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.start()
      setListening(true)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`btn-icon ${
        listening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-brand-gradient text-white'
      } disabled:opacity-50`}
      title={listening ? 'Stop recording' : 'Speak your answer'}
    >
      {listening ? '⏹️' : '🎤'}
    </button>
  )
}
