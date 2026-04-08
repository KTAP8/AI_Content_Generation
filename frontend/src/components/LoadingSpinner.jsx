export default function LoadingSpinner({ message = 'Generating content...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="w-10 h-10 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
      <p className="text-zinc-400 text-sm">{message}</p>
    </div>
  )
}
