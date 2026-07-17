import { Loader } from "@/components/prompt-kit/loader"

export default function RootLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader variant="dots" size="lg" />
    </div>
  )
}
