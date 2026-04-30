export function PrivacyPolicy() {
  return (
    <div className="text-gray-700 text-sm leading-relaxed space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">개인정보 처리방침</h1>
        <p className="font-bold text-gray-900">NoteSignal</p>
        <p className="text-gray-500 text-xs mt-1">시행일: 2026년 4월 29일</p>
      </div>

      <p>
        NoteSignal(이하 "서비스")은 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 관련 법령을 준수합니다. 본 처리방침은 서비스가 수집하는 개인정보의 항목, 수집 및 이용 목적, 보유 기간, 파기 절차 및 방법 등을 안내합니다.
      </p>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제1조 (수집하는 개인정보 항목)</h2>
        <p>서비스는 회원가입 및 서비스 이용을 위해 다음의 개인정보를 수집합니다.</p>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">구분</th>
                <th className="px-4 py-3 font-semibold text-gray-900">수집 항목</th>
                <th className="px-4 py-3 font-semibold text-gray-900">수집 방법</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">필수</td>
                <td className="px-4 py-3">닉네임, 연령, 성별, 인스타그램 또는 카카오톡 아이디 중 하나, 이상형, 자신의 매력, MBTI</td>
                <td className="px-4 py-3">회원가입 시 이용자 직접 입력</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">자동 수집</td>
                <td className="px-4 py-3">IP 주소, 쿠키, 접속 일시, 기기 정보, 브라우저 종류</td>
                <td className="px-4 py-3">서비스 이용 과정에서 자동 생성·수집</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
          <li>매칭 서비스의 특성상 수집된 모든 항목(닉네임, 성별, 이상형, 매력, MBTI)은 다른 이용자에게 공개됩니다.</li>
          <li>단, 연령은 이용자가 서비스 내 설정에서 공개 여부를 직접 선택할 수 있습니다.</li>
          <li>인스타그램 또는 카카오톡 아이디는 해당 이용자를 직접 선택한 이용자에게만 공개됩니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제2조 (개인정보의 수집 및 이용 목적)</h2>
        <p>수집한 개인정보는 다음의 목적으로만 이용되며, 목적이 변경될 경우 별도의 동의를 받습니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="font-semibold text-gray-800">회원 관리:</span> 회원제 서비스 운영, 부정 이용 방지</li>
          <li><span className="font-semibold text-gray-800">서비스 제공:</span> 쪽지 등록·열람·선택을 통한 매칭 서비스 운영 등 핵심 서비스 제공</li>
          <li><span className="font-semibold text-gray-800">서비스 개선:</span> 접속 빈도 분석, 이용 통계, 기능 개선</li>
          <li><span className="font-semibold text-gray-800">불법·부정 이용 방지:</span> 이용약관 위반 행위 탐지 및 제재</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제3조 (개인정보의 보유 및 이용 기간)</h2>
        <p>서비스는 시즌제로 운영되며, 각 시즌 종료 시 아래 기준에 따라 개인정보를 처리합니다. 단, 관계 법령에 따라 보존이 필요한 경우에는 해당 기간 동안 보관합니다.</p>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">구분</th>
                <th className="px-4 py-3 font-semibold text-gray-900">보존 기간</th>
                <th className="px-4 py-3 font-semibold text-gray-900">근거</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3">회원 정보 (UUID·성별·제재 기록 제외 전체)</td>
                <td className="px-4 py-3 whitespace-nowrap">각 시즌 종료일로부터 2일 후 파기</td>
                <td className="px-4 py-3">이용자 동의 및 서비스 운영 정책</td>
              </tr>
              <tr>
                <td className="px-4 py-3">UUID, 성별, 사용자 제재 기록</td>
                <td className="px-4 py-3 whitespace-nowrap">서비스 운영 기간 동안 보관</td>
                <td className="px-4 py-3">부정 이용 방지 및 서비스 운영</td>
              </tr>
              <tr>
                <td className="px-4 py-3">계약·청약 철회 기록</td>
                <td className="px-4 py-3 whitespace-nowrap">5년</td>
                <td className="px-4 py-3">전자상거래법</td>
              </tr>
              <tr>
                <td className="px-4 py-3">소비자 불만·분쟁 기록</td>
                <td className="px-4 py-3 whitespace-nowrap">3년</td>
                <td className="px-4 py-3">전자상거래법</td>
              </tr>
              <tr>
                <td className="px-4 py-3">접속 로그·IP</td>
                <td className="px-4 py-3 whitespace-nowrap">3개월</td>
                <td className="px-4 py-3">통신비밀보호법</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">※ 시즌 종료일은 서비스 내 공지사항을 통해 최소 1일 전에 사전 안내합니다.</p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제4조 (개인정보의 파기 절차 및 방법)</h2>
        <p>각 시즌 종료 시, 보존 의무가 없는 개인정보는 즉시 파기합니다. 파기 방법은 다음과 같습니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="font-semibold text-gray-800">전자적 파일:</span> 데이터베이스에서 해당 레코드를 삭제하는 방식으로 복구가 불가능하게 영구 삭제 (UUID는 제외)</li>
        </ul>
        <p>단, 관계 법령에 의해 보존이 필요한 경우에는 해당 기간 동안 분리 보관 후 파기합니다.</p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제5조 (개인정보의 제3자 제공)</h2>
        <p>서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령의 규정에 따르거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제6조 (개인정보 처리 위탁)</h2>
        <p>서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁합니다.</p>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">수탁업체</th>
                <th className="px-4 py-3 font-semibold text-gray-900">위탁 업무 내용</th>
                <th className="px-4 py-3 font-semibold text-gray-900">보유 및 이용 기간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">Supabase, Inc.</td>
                <td className="px-4 py-3">데이터베이스 운영 및 개인정보 저장·관리</td>
                <td className="px-4 py-3">서비스 운영 기간 또는 위탁 계약 종료 시</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">Vercel, Inc.</td>
                <td className="px-4 py-3">서비스 배포 및 서버 인프라 운영</td>
                <td className="px-4 py-3">서비스 운영 기간 또는 위탁 계약 종료 시</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제7조 (쿠키의 운영 및 거부)</h2>
        <h3 className="font-bold text-gray-800 mt-2">1. 쿠키란?</h3>
        <p>쿠키는 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 소량의 정보이며, 이용자 기기의 저장 공간에 저장됩니다.</p>
        
        <h3 className="font-bold text-gray-800 mt-4">2. 쿠키의 사용 목적 및 보유 기간</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="font-semibold text-gray-800">어뷰징 (중복 참여, 부정 이용 등) 방지:</span> 20일간 보관 후 자동 삭제</li>
          <li><span className="font-semibold text-gray-800">로그인 상태 유지:</span> 세션 관리 목적으로 쿠키 또는 유사 기술(로컬 스토리지 등)을 사용할 수 있습니다.</li>
        </ul>

        <h3 className="font-bold text-gray-800 mt-4">3. 쿠키 거부 방법</h3>
        <p>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 단, 쿠키 저장을 거부할 경우 로그인 유지 등 일부 서비스 이용에 불편이 있을 수 있습니다.</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li><span className="font-semibold text-gray-800">Chrome:</span> 설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터</li>
          <li><span className="font-semibold text-gray-800">Safari:</span> 환경설정 → 개인 정보 보호 → 쿠키 및 웹 사이트 데이터</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제8조 (이용자의 권리 및 행사 방법)</h2>
        <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>개인정보 열람 요청</li>
          <li>오류 등이 있을 경우 정정 요청</li>
          <li>삭제 요청</li>
          <li>처리 정지 요청</li>
        </ul>
        <p>권리 행사는 서비스 내 '내 프로필' 메뉴 또는 아래 개인정보 보호책임자에게 이메일로 요청하실 수 있으며, 즉시 조치하겠습니다.</p>
        <p>단, 법령에 따라 처리가 필요한 경우 해당 사유가 소멸한 때까지 처리 정지 요청이 거부될 수 있습니다.</p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제9조 (개인정보의 안전성 확보 조치)</h2>
        <p>서비스는 개인정보 보호를 위해 다음의 기술적·관리적 조치를 취하고 있습니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="font-semibold text-gray-800">중요 정보 해시화:</span> 복구용 PIN 등 민감 정보는 단방향 해시(Hash) 처리하여 저장</li>
          <li><span className="font-semibold text-gray-800">접근 통제:</span> 개인정보에 대한 접근 권한을 최소한의 인원으로 제한</li>
          <li><span className="font-semibold text-gray-800">전송 구간 암호화:</span> HTTPS(SSL/TLS) 적용</li>
          <li><span className="font-semibold text-gray-800">인프라 보안:</span> 데이터베이스(Supabase) 및 배포 환경(Vercel)의 보안 정책에 따른 방화벽, 접근 제어, 모니터링 등 인프라 수준의 보안 조치 적용</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제10조 (개인정보 보호책임자)</h2>
        <p>개인정보 관련 문의, 불만 처리 및 피해 구제는 아래 이메일로 연락해 주시기 바랍니다.</p>
        <div className="overflow-hidden rounded-lg border border-gray-200 inline-block w-full sm:w-auto mt-2">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 font-semibold text-gray-900 bg-gray-50 w-24">이메일</td>
                <td className="px-4 py-3">notesignaldev@gmail.com</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="mt-4">개인정보 침해 관련 신고·상담은 아래 기관에도 문의하실 수 있습니다.</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>개인정보 침해신고센터: privacy.kisa.or.kr / 국번없이 118</li>
          <li>개인정보 분쟁조정위원회: www.kopico.go.kr / 1833-6972</li>
          <li>대검찰청 사이버수사과: www.spo.go.kr / 국번없이 1301</li>
          <li>경찰청 사이버수사국: ecrm.cyber.go.kr / 국번없이 182</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6 pt-6 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">제11조 (처리방침의 변경)</h2>
        <p>본 개인정보 처리방침은 법령, 정책, 보안 기술의 변경에 따라 내용이 추가·삭제·수정될 수 있습니다.</p>
        <p>처리방침이 변경될 경우 최소 7일 전에 서비스 내 공지사항을 통해 안내드립니다. 다만, 이용자 권리에 중요한 변경이 있는 경우 최소 30일 전에 안내합니다.</p>
        <ul className="mt-4 text-sm text-gray-500">
          <li>• 공고일: 2026년 4월 29일</li>
          <li>• 시행일: 2026년 4월 29일</li>
        </ul>
      </section>
      
      {/* Scrollable padding */}
      <div className="h-8"></div>
    </div>
  );
}
