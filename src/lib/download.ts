/** Save a Blob to the user's downloads. Shared by invoices and contracts. */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the browser a moment to start the download before releasing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
