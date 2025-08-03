'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Import CSS synchronously
import 'react-quill/dist/quill.snow.css'

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] border rounded-md bg-gray-50 animate-pulse flex items-center justify-center">
      <span>Loading Rich Text Editor...</span>
    </div>
  )
})

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-[250px] border rounded-md bg-gray-50 animate-pulse flex items-center justify-center">
        <span>Loading Rich Text Editor...</span>
      </div>
    )
  }

  return (
    <div className="react-quill-container mb-12" style={{ height: '220px' }}>
      <ReactQuill 
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Enter content..."}
        style={{ 
          height: '220px',
          backgroundColor: 'white'
        }}
        modules={{
          toolbar: {
            container: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'align': [] }],
              ['link'],
              ['blockquote', 'code-block'],
              ['clean']
            ]
          }
        }}
        formats={[
          'header', 'bold', 'italic', 'underline', 'strike',
          'list', 'bullet', 'align', 'link', 'color', 'background',
          'blockquote', 'code-block'
        ]}
      />
    </div>
  )
}