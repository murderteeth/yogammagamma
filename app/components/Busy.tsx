import { RingLoader } from "react-spinners";

export default function Busy({ className }: { className?: string }) {
  return <div className={`w-full h-full flex items-center justify-center ${className}`}>
    <RingLoader size="120px" color="#4ade80" />
  </div>
}