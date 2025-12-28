// src/components/Pagination.tsx
// مكون التصفح بين الصفحات

type PaginationProps = {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        if (!pages.includes(i)) pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }

    return pages
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-[#FAF8F3] rounded-xl border border-[#E8E1D6]">
      {/* معلومات الصفحة */}
      <p className="text-sm text-[#7C7469]">
        عرض <span className="font-bold text-[#2B2A28]">{startItem}</span> -{" "}
        <span className="font-bold text-[#2B2A28]">{endItem}</span> من{" "}
        <span className="font-bold text-[#2B2A28]">{totalItems}</span>
      </p>

      {/* أزرار التنقل */}
      <div className="flex items-center gap-1">
        {/* زر السابق */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition ${
            currentPage === 1
              ? "text-[#A48E78] cursor-not-allowed"
              : "text-[#2B2A28] hover:bg-[#C6A76D]/20"
          }`}
        >
          ◀
        </button>

        {/* أرقام الصفحات */}
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-[#7C7469]">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-10 h-10 rounded-lg font-bold transition ${
                currentPage === page
                  ? "bg-gradient-to-l from-[#C6A76D] to-[#8B7355] text-white shadow-md"
                  : "text-[#2B2A28] hover:bg-[#C6A76D]/20"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* زر التالي */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition ${
            currentPage === totalPages
              ? "text-[#A48E78] cursor-not-allowed"
              : "text-[#2B2A28] hover:bg-[#C6A76D]/20"
          }`}
        >
          ▶
        </button>
      </div>
    </div>
  )
}

// دالة مساعدة لتقسيم البيانات
export function paginateData<T>(data: T[], currentPage: number, itemsPerPage: number): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage
  return data.slice(startIndex, startIndex + itemsPerPage)
}
