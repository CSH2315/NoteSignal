export default function NextSeasonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">💭</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">현재 시즌이 종료되었습니다</h1>
      <p className="text-gray-500 mb-8 max-w-[280px]">
        다음 시즌에 다시 찾아오겠습니다. 조금만 기다려주세요!
      </p>
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-sm">
        <p className="text-sm font-medium text-gray-400 mb-1">다음 시즌 안내</p>
        <p className="text-lg font-bold text-gray-900">2026.04.01 오픈 예정</p>
      </div>
    </div>
  );
}
