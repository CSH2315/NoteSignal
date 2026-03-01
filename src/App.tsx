import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';

function App() {
  return (
    <Router>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<div className="flex flex-col items-center justify-center min-h-[50vh]"><h1 className="text-2xl font-bold text-brand-600">NoteSignal</h1><p className="mt-2 text-gray-500">랜딩 페이지 준비 중...</p></div>} />
        </Routes>
      </MobileLayout>
    </Router>
  );
}

export default App;
