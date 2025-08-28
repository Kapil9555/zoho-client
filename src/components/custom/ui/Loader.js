'use client'


export default function Loader() {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
      <div className="loader" />
    </div>
  )
}
