import { useSearchParams } from "react-router-dom"
import BookingForm from "@/components/BookingForm"

export default function BookingPage() {
  const [params] = useSearchParams()
  const unitId = params.get("unitId")

  return (
    <div className="max-w-xl mx-auto py-20">
      <h1 className="text-2xl font-bold mb-6 text-center">طلب حجز</h1>
      {unitId ? (
        <BookingForm unitId={unitId} />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-6 mt-8 text-yellow-800 text-center">
          لم يتم تحديد وحدة للحجز.
        </div>
      )}
    </div>
  )
}
