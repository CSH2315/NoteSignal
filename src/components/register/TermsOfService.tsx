export function TermsOfService() {
  return (
    <div className="text-gray-700 text-sm leading-relaxed space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">이용약관</h1>
        <p className="font-bold text-gray-900">NoteSignal</p>
        <p className="text-gray-500 text-xs mt-1">시행일: 2026년 4월 28일</p>
      </div>

      <p>
        본 약관은 NoteSignal(이하 "서비스")의 이용 조건 및 절차, 이용자와 운영자의 권리·의무·책임 사항을 규정합니다. 서비스에 가입하거나 이용함으로써 본 약관에 동의한 것으로 간주됩니다.
      </p>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제1조 (목적)</h2>
        <p>본 약관은 NoteSignal(이하 "서비스")이 제공하는 소개팅 매칭 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무, 책임 사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제2조 (용어 정의)</h2>
        <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900 w-24">용어</th>
                <th className="px-4 py-3 font-semibold text-gray-900">정의</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">서비스</td>
                <td className="px-4 py-3">NoteSignal이 운영하는 소개팅 매칭 플랫폼(웹 및 앱 포함)과 이에 부수되는 모든 기능</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">이용자</td>
                <td className="px-4 py-3">본 약관에 동의하고 서비스에 가입한 자</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">쪽지</td>
                <td className="px-4 py-3">이용자가 서비스 내에서 자신의 정보와 의사를 표현하기 위해 등록하는 매칭용 게시물</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">시즌</td>
                <td className="px-4 py-3">서비스가 일정 기간 단위로 운영하는 서비스 운영 주기</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">매칭</td>
                <td className="px-4 py-3">이용자가 다른 이용자의 쪽지를 선택함으로써 이루어지는 연결</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">운영자</td>
                <td className="px-4 py-3">NoteSignal 서비스를 기획·운영하는 자</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제3조 (약관의 효력 및 변경)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>본 약관은 서비스 가입 시 이용자가 동의함으로써 효력이 발생합니다.</li>
          <li>운영자는 필요한 경우 약관을 변경할 수 있으며, 변경 시 시행일 최소 7일 전에 서비스 내 공지사항을 통해 안내합니다. 이용자 권리에 중요한 변경이 있는 경우에는 최소 30일 전에 안내합니다.</li>
          <li>변경된 약관의 시행일 이후에도 서비스를 계속 이용하는 경우 변경 약관에 동의한 것으로 간주됩니다.</li>
          <li>이용자가 변경 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제4조 (이용 계약의 성립 및 가입 제한)</h2>
        <h3 className="font-bold text-gray-800 mt-2">1. 이용 계약의 성립</h3>
        <p>이용 계약은 이용자가 본 약관에 동의하고 가입 신청을 완료하면 성립합니다.</p>
        
        <h3 className="font-bold text-gray-800 mt-4">2. 이용 대상</h3>
        <p>서비스는 1998년~2007년 출생자를 대상으로 합니다.</p>
        <p className="text-xs text-gray-500">※ 서비스는 이용자가 입력한 생년 정보를 기준으로 하며, 허위 정보 입력 시 발생하는 불이익은 이용자에게 귀속됩니다.</p>
        
        <h3 className="font-bold text-gray-800 mt-4">3. 가입 제한</h3>
        <p>다음에 해당하는 경우 가입이 제한되거나 이용 계약이 해지될 수 있습니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>이용 대상 출생 연도(1998년~2007년)에 해당하지 않는 경우</li>
          <li>이전에 본 약관 위반으로 강제 탈퇴 처리된 이력이 있는 경우</li>
          <li>타인의 정보를 도용하거나 허위 정보를 기재한 경우</li>
          <li>기타 운영자가 서비스 이용이 부적합하다고 판단하는 경우</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제5조 (시즌제 운영)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>서비스는 일정 기간 단위의 시즌제로 운영됩니다.</li>
          <li>각 시즌의 시작일 및 종료일은 서비스 내 공지사항을 통해 최소 1일 전에 안내합니다.</li>
          <li>시즌 종료 시, UUID 및 제재 기록을 제외한 이용자의 모든 개인정보 및 활동 데이터는 종료일로부터 2일 후 삭제됩니다.</li>
          <li>운영자는 서비스 운영 상황에 따라 시즌 운영 여부, 시즌 간격, 시즌 기간 등을 변경할 수 있으며, 변경 시 공지사항을 통해 안내합니다.</li>
          <li>이용자는 시즌 종료에 따른 데이터 삭제에 동의하고 서비스를 이용합니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제6조 (서비스의 내용 및 변경)</h2>
        <h3 className="font-bold text-gray-800 mt-2">1. 서비스 내용</h3>
        <p>서비스는 다음의 기능을 제공합니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>이용자 프로필 등록 및 열람</li>
          <li>쪽지 등록·열람·선택을 통한 매칭 서비스</li>
          <li>매칭 성사 시 상대방의 SNS 아이디(인스타그램 또는 카카오톡) 공개</li>
          <li>부적절한 쪽지에 대한 신고 기능</li>
          <li>기타 운영자가 추가로 제공하는 기능</li>
        </ul>
        <h3 className="font-bold text-gray-800 mt-4">2. 서비스 변경 및 중단</h3>
        <p>운영자는 서비스의 내용을 변경하거나 중단할 수 있습니다. 중요한 변경 또는 중단의 경우 사전에 공지합니다.</p>
        <p>시즌 미운영 기간 중에는 일부 기능이 제한될 수 있습니다.</p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제7조 (쪽지 등록 및 이용 규정)</h2>
        <h3 className="font-bold text-gray-800 mt-2">1. 쪽지 등록</h3>
        <p>이용자는 서비스 내에서 쪽지를 등록하여 자신을 소개하고 매칭 의사를 표현할 수 있습니다.</p>
        <p>쪽지에 기재한 정보는 다른 이용자에게 공개됩니다.</p>
        
        <h3 className="font-bold text-gray-800 mt-4">2. 금지 콘텐츠</h3>
        <p>이용자는 쪽지 및 서비스 내 모든 활동에서 다음의 내용을 작성·공유해서는 안 됩니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>욕설, 비하, 혐오 표현을 포함한 내용</li>
          <li>음란물 또는 성적으로 부적절한 내용</li>
          <li>타인의 개인정보를 무단으로 포함한 내용</li>
          <li>허위 사실 또는 과장된 정보</li>
          <li>광고, 홍보, 스팸성 내용</li>
          <li>타인을 사칭하거나 오인하게 하는 내용</li>
          <li>법령에 위반되는 내용</li>
        </ul>
        
        <h3 className="font-bold text-gray-800 mt-4">3. 신고 기능</h3>
        <p>이용자는 부적절한 쪽지 또는 이용자를 서비스 내 신고 기능을 통해 신고할 수 있습니다.</p>
        <p>운영자는 신고된 내용을 검토하여 약관 위반 여부를 판단하고, 필요한 경우 제재 조치를 취합니다.</p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제8조 (SNS 아이디 공개 및 동의)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>이용자는 가입 시 인스타그램 또는 카카오톡 아이디 중 하나를 필수로 입력합니다.</li>
          <li>입력한 SNS 아이디는 해당 이용자를 직접 선택한 이용자에게만 공개됩니다.</li>
          <li>이용자는 서비스 이용 전 위 공개 방식에 동의한 것으로 간주됩니다.</li>
          <li>운영자는 이용자의 SNS 아이디를 매칭 목적 외의 용도로 사용하지 않습니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제9조 (이용자의 의무)</h2>
        <p>이용자는 다음의 행위를 해서는 안 됩니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>가입 시 허위 정보(연령, 성별, 닉네임, SNS 아이디 등)를 기재하는 행위</li>
          <li>타인의 계정을 도용하거나 타인을 사칭하는 행위</li>
          <li>서비스를 통해 알게 된 타인의 개인정보를 동의 없이 수집·이용하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하거나 서버에 과부하를 유발하는 행위</li>
          <li>영리 목적의 광고·홍보 활동, 종교 포교, 정치적 홍보 활동</li>
          <li>제7조 제2항에서 정한 금지 콘텐츠를 등록하는 행위</li>
          <li>기타 관련 법령 또는 본 약관을 위반하는 행위</li>
        </ul>
        <p className="mt-2 text-sm">허위 정보 기재로 인해 발생하는 모든 불이익 및 법적 책임은 해당 이용자에게 있으며, 운영자는 이에 대한 책임을 지지 않습니다.</p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제10조 (운영자의 의무)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>운영자는 관련 법령 및 본 약관을 준수하며 서비스를 운영합니다.</li>
          <li>운영자는 이용자의 개인정보를 개인정보 처리방침에 따라 보호합니다.</li>
          <li>운영자는 서비스의 안정적 제공을 위해 노력하며, 시스템 장애 발생 시 신속하게 복구합니다.</li>
          <li>운영자는 이용자로부터 제기되는 불만 및 의견을 이메일을 통해 접수하고 처리합니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제11조 (계정 관리)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>이용자는 자신의 계정 정보 관리에 책임을 집니다.</li>
          <li>이용자는 자신의 계정을 타인에게 양도·대여하거나 타인이 이용하게 해서는 안 됩니다.</li>
          <li>계정의 무단 도용 또는 보안 이상이 의심될 경우 즉시 운영자에게 알려야 합니다.</li>
          <li>이용자 본인의 관리 소홀로 인해 발생한 피해에 대해 운영자는 책임을 지지 않습니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제12조 (서비스 이용 제한 및 제재)</h2>
        <h3 className="font-bold text-gray-800 mt-2">1. 제재 사유</h3>
        <p>운영자는 이용자가 다음 각 호에 해당하는 경우 사전 통지 없이 이용을 제한하거나 계정을 정지·삭제할 수 있습니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>제9조에서 정한 이용자 의무를 위반한 경우</li>
          <li>제7조 제2항의 금지 콘텐츠를 등록한 경우</li>
          <li>타인의 신고가 접수되고 운영자는 약관 위반으로 판단한 경우</li>
          <li>이용 대상 출생 연도(1998년~2007년)에 해당하지 않음이 확인된 경우</li>
          <li>기타 서비스의 정상적인 운영을 해치거나 타 이용자에게 피해를 주는 경우</li>
        </ul>
        
        <h3 className="font-bold text-gray-800 mt-4">2. 제재 내용</h3>
        <p>제재 조치는 위반 정도에 따라 다음과 같이 적용됩니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="font-semibold text-gray-800">경고:</span> 약관 위반 사실 고지 및 시정 요청</li>
          <li><span className="font-semibold text-gray-800">일시 이용 정지:</span> 일정 기간 서비스 이용 제한</li>
          <li><span className="font-semibold text-gray-800">영구 이용 정지(강제 탈퇴):</span> 서비스 이용 영구 제한 및 재가입 불허</li>
        </ul>
        
        <h3 className="font-bold text-gray-800 mt-4">3. 이의 제기</h3>
        <p>이용 제한에 이의가 있는 이용자는 운영자 이메일로 이의를 제기할 수 있으며, 운영자는 이를 검토하여 회신합니다.</p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제13조 (서비스 탈퇴 및 계약 해지)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>이용자는 언제든지 서비스 내 '내 프로필 삭제하기'를 통해 탈퇴를 신청할 수 있습니다.</li>
          <li>탈퇴 시 UUID, 성별 및 제재 기록을 제외한 이용자의 개인정보 및 활동 데이터는 즉시 삭제됩니다.</li>
          <li>탈퇴 후 재가입은 가능하나, 강제 탈퇴 처리된 이력이 있는 경우 재가입이 제한될 수 있습니다.</li>
          <li>탈퇴로 인해 삭제된 데이터는 복구되지 않습니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제14조 (유료 서비스)</h2>
        <p>현재 서비스는 무료로 제공되며, 향후 유료 기능이 도입될 경우 도입 전에 서비스 내 공지사항을 통해 안내합니다.</p>
        <p>유료 서비스 도입 시 결제 방법, 환불 정책 등 세부 사항은 별도 공지를 통해 확정됩니다.</p>
        <p>이용자는 유료 서비스 도입에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제15조 (매칭 결과 불보장 및 서비스 한계)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>서비스는 이용자 간의 매칭 기회를 제공할 뿐, 매칭의 성사 또는 특정 결과를 보장하지 않습니다.</li>
          <li>서비스를 통해 이루어진 이용자 간의 만남, 연락, 관계 형성 등에서 발생하는 문제에 대해 운영자는 책임을 지지 않습니다.</li>
          <li>이용자는 상대방이 입력한 정보의 진위 여부를 스스로 확인해야 하며, 이를 신뢰하여 발생한 피해에 대해 운영자는 책임을 지지 않습니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제16조 (책임의 한계 및 면책)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>운영자는 천재지변, 전쟁, 해킹 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
          <li>운영자는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
          <li>운영자는 이용자가 서비스 내에서 게시한 정보의 신뢰성·정확성에 대해 보증하지 않습니다.</li>
          <li>운영자는 서비스를 통해 이용자 간에 발생한 분쟁에 대해 개입 의무가 없으며, 이로 인한 손해에 대해 책임을 지지 않습니다.</li>
          <li>서비스는 현재 무료로 제공되며, 운영자의 고의 또는 중과실이 없는 한 손해배상 책임은 제한됩니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-bold text-gray-900">제17조 (분쟁 해결 및 관할)</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>본 약관 및 서비스 이용과 관련하여 발생한 분쟁은 당사자 간 협의를 통해 해결함을 원칙으로 합니다.</li>
          <li>협의가 이루어지지 않을 경우 대한민국 법률을 준거법으로 하며, 이용자의 주소지를 관할하는 법원을 제1심 관할 법원으로 합니다.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6 pt-6 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">부칙</h2>
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
