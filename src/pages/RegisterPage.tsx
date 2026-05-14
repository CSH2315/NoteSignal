import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, Wand2 } from 'lucide-react';
import { generateNickname } from '@/lib/nicknameGenerator';
import { TermsModal } from '@/components/register/TermsModal';
import { RecoveryCodeModal } from '@/components/register/RecoveryCodeModal';
import { useUserStore } from '@/store/useUserStore';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  nickname: z.string().min(1, '이름 또는 닉네임을 입력해주세요.').max(10, '최대 10자까지 가능합니다.'),
  gender: z.enum(['male', 'female'], { message: '성별을 선택해주세요.' }),
  age: z.number().min(20, '20세 이상만 가입 가능합니다.').max(29, '20대만 가입 가능합니다.'),
  isAgeVisible: z.boolean(),
  contactType: z.enum(['instagram', 'kakao']),
  contactId: z.string().min(1, '연락처 아이디를 입력해주세요.'),
  mbti: z.string().length(4, 'MBTI 4자리를 정확히 입력해주세요.'),
  idealType: z.string().min(10, '이상형을 10자 이상 자세히 적어주세요.').max(50, '최대 50자까지 가능합니다.'),
  charm: z.string().min(10, '자신의 매력을 10자 이상 어필해주세요.').max(50, '최대 50자까지 가능합니다.'),
}).superRefine((data, ctx) => {
  if (data.contactType === 'instagram') {
    // Basic instagram handle validation (letters, numbers, periods, underscores)
    if (!/^[a-zA-Z0-9._]+$/.test(data.contactId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '유효한 인스타그램 아이디 형식이 아닙니다. (영문, 숫자, 마침표, 밑줄만 허용)',
        path: ['contactId']
      });
    }
  } else {
    // Kakao id basic validation (letters, numbers, hyphens, underscores)
    if (!/^[a-zA-Z0-9-_]+$/.test(data.contactId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '유효한 카카오톡 아이디 형식이 아닙니다. (영문, 숫자, 하이픈, 밑줄만 허용)',
        path: ['contactId']
      });
    }
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setStoreUser = useUserStore(state => state.login);
  
  // 복구(Restore) 모드 판별: 쪽지 삭제 유저가 다시 가입할 경우
  const restoreData = location.state as { restoreUserId: string, restoreLoginId: string, restoreGender: string } | null;

  // Modals & States
  const [showTermsModal, setShowTermsModal] = useState(true);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isAgeVisible: true,
      age: 20,
      gender: restoreData?.restoreGender as ('male'|'female') || undefined,
      contactType: 'instagram',
    },
  });

  const gender = watch('gender');
  const contactType = watch('contactType');

  // Submit Handler (가입 시작 - 복구코드 모달 띄우기 전 어뷰징 검사)
  const onSubmit = async () => {
    // 1. 디바이스 쿠키 검사 (어뷰징 방어, 단 기존 유저 복구 모드면 패스)
    if (!restoreData && document.cookie.includes('ns_device_id=')) {
      toast.error('기존 복구코드로 로그인해주세요.', { duration: 4000 });
      return;
    }

    if (restoreData) {
      // 복구 모드인 경우 핀코드 생성 모달 건너뛰고 바로 복구 RPC 호출
      await handleRestoreConfirm();
      return;
    }

    // Generate random recovery code (e.g. A8X2-9M4Q)
    const randomBlock = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${randomBlock()}-${randomBlock()}`;
    
    setGeneratedCode(code);
    setShowRecoveryModal(true);
  };

  // After writing down the recovery code and setting PIN
  const handleRecoveryConfirm = async (pin: string) => {
    setIsRegistering(true);
    const formData = watch();
    
    try {
      const { data, error } = await supabase.rpc('register_note', {
        p_login_id: generatedCode,
        p_pin_code: pin,
        p_gender: formData.gender,
        p_nickname: formData.nickname,
        p_contact_type: formData.contactType,
        p_contact_id: formData.contactId,
        p_age: formData.age,
        p_is_age_visible: formData.isAgeVisible,
        p_mbti: formData.mbti,
        p_ideal_type: formData.idealType,
        p_charm: formData.charm,
      });

      if (error) throw error;

      if (data && data.success) {
        setShowRecoveryModal(false);

        // 2. 가입 완료 시 브라우저에 20일짜리 제한 쿠키 발급 (max-age = 60 * 60 * 24 * 20)
        document.cookie = "ns_device_id=registered; max-age=1728000; path=/";

        // 서버에 등록된 DB 트리거(picks) 기본값 조회
        const { data: statusData } = await supabase.rpc('get_user_status', { p_uuid: data.user_id });
        const picks = statusData?.picks_remaining ?? (formData.gender === 'female' ? 3 : 2);
        const copies = statusData?.my_note_copies ?? (formData.gender === 'female' ? 3 : 2);

        setStoreUser(data.user_id, formData.gender as 'male' | 'female', picks, copies);
        toast.success('쪽지가 등록되었습니다!');
        navigate('/feed', { replace: true });
      } else {
        throw new Error('Registration failed on server');
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      toast.error('회원가입에 실패했습니다. 다시 시도해 주세요.');
      // If code duplicates or other error, hide modal so user can retry
      setShowRecoveryModal(false);
    } finally {
      setIsRegistering(false);
    }
  };

  // 쪽지 삭제 유저를 위한 단축 복구 로직 (PIN 재설정 없음)
  const handleRestoreConfirm = async () => {
    setIsRegistering(true);
    const formData = watch();

    try {
      const { data, error } = await supabase.rpc('restore_note', {
        p_user_id: restoreData!.restoreUserId,
        p_nickname: formData.nickname,
        p_contact_type: formData.contactType,
        p_contact_id: formData.contactId,
        p_age: formData.age,
        p_is_age_visible: formData.isAgeVisible,
        p_mbti: formData.mbti,
        p_ideal_type: formData.idealType,
        p_charm: formData.charm,
      });

      if (error) throw error;

      if (data && data.success) {
        // 복구 성공
        setStoreUser(data.user_id, data.gender, data.picks_remaining, data.my_note_copies);
        toast.success('쪽지가 다시 등록되었습니다!');
        navigate('/feed', { replace: true });
      } else {
        throw new Error('Restore failed on server');
      }
    } catch (error: any) {
      console.error('Restore Error:', error);
      toast.error('쪽지 등록에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-4 pb-20 px-6">
      <TermsModal 
        isOpen={showTermsModal} 
        onAgree={() => { setShowTermsModal(false); }}
        onClose={() => navigate('/')}
      />

      <RecoveryCodeModal 
        isOpen={showRecoveryModal}
        code={generatedCode}
        onConfirm={handleRecoveryConfirm}
      />

      {/* Main Registration Form - Rendered but visually hidden/blocked if terms not agreed */}
      {!showTermsModal && (
        <>
        {/* Restore Mode Notification Banner */}
        {restoreData && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <RefreshCw className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-brand-900 leading-tight mb-1">쪽지 재등록 모드</h3>
              <p className="text-sm text-brand-700 leading-snug">
                기존 계정({restoreData.restoreLoginId})에 보유하시던 <span className="font-bold">픽 횟수가 그대로 유지</span>됩니다. 내용을 다시 입력해주세요.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-500">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              당신의 매력을<br/>
              쪽지에 담아볼까요?
            </h1>
            <p className="text-gray-500 mt-2 text-sm">성실하게 작성할수록 매칭 확률이 올라갑니다.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            {/* Nickname */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-bold text-gray-700">닉네임</label>
                <button
                  type="button"
                  onClick={() => setValue('nickname', generateNickname(), { shouldValidate: true })}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  자동생성
                </button>
              </div>
              <input
                {...register('nickname')}
                placeholder="어떻게 부르면 될까요?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
              />
              {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname.message}</p>}
            </div>

            {/* Gender */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">당신의 성별은?</h2>
            <div className="flex gap-4">
              <button
                type="button"
                disabled={!!restoreData}
                className={`flex-1 py-4 rounded-2xl border-2 transition-all ${
                  gender === 'male' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                    : 'border-gray-200 text-gray-400 hover:border-blue-200'
                } ${restoreData ? 'opacity-80 cursor-not-allowed' : ''}`}
                onClick={() => setValue('gender', 'male', { shouldValidate: true })}
              >
                남성
              </button>
              <button
                type="button"
                disabled={!!restoreData}
                className={`flex-1 py-4 rounded-2xl border-2 transition-all ${
                  gender === 'female' 
                    ? 'border-pink-500 bg-pink-50 text-pink-500 font-bold' 
                    : 'border-gray-200 text-gray-400 hover:border-pink-200'
                } ${restoreData ? 'opacity-80 cursor-not-allowed' : ''}`}
                onClick={() => setValue('gender', 'female', { shouldValidate: true })}
              >
                여성
              </button>
            </div>
            {restoreData && (
              <p className="text-sm text-gray-500 mt-2 ml-1">계정 재등록 시 성별은 변경할 수 없습니다.</p>
            )}
            {errors.gender && <p className="text-red-500 text-xs mt-2 ml-2 font-bold">{errors.gender.message}</p>}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">나이 설정</label>
              <select
                {...register('age', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
              >
                {Array.from({ length: 10 }, (_, i) => i + 20).map((age) => (
                  <option key={age} value={age}>{age}세</option>
                ))}
              </select>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" {...register('isAgeVisible')} className="w-4 h-4 text-brand-500" />
                <span className="text-sm text-gray-600">내 쪽지에 나이를 공개합니다.</span>
              </label>
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">연락처 수단</label>
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => { setValue('contactType', 'instagram'); setValue('contactId', ''); }}
                  className={`flex-1 py-3 rounded-xl font-medium border transition text-sm ${contactType === 'instagram' ? 'bg-[#FAFAFA] border-pink-500 text-pink-600' : 'bg-white border-gray-200 text-gray-400'}`}
                >
                  Instagram
                </button>
                <button
                  type="button"
                  onClick={() => { setValue('contactType', 'kakao'); setValue('contactId', ''); }}
                  className={`flex-1 py-3 rounded-xl font-medium border transition text-sm ${contactType === 'kakao' ? 'bg-[#FEE500] border-yellow-400 text-yellow-900' : 'bg-white border-gray-200 text-gray-400'}`}
                >
                  KakaoTalk
                </button>
              </div>
              <input
                {...register('contactId')}
                placeholder={contactType === 'instagram' ? '인스타그램 아이디 입력' : '카카오톡 아이디 입력'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
              />
              <p className="text-xs text-gray-400 mt-1">이 연락처는 누군가 당신의 쪽지를 뽑았을 때만 제공됩니다.</p>
              {errors.contactId && <p className="text-red-500 text-xs mt-1">{errors.contactId.message}</p>}
            </div>

            {/* MBTI */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">MBTI</label>
              <select
                {...register('mbti')}
                defaultValue=""
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
              >
                <option value="" disabled>MBTI 선택</option>
                {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.mbti && <p className="text-red-500 text-xs mt-1">{errors.mbti.message}</p>}
            </div>

            {/* Charm Check */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">자신의 매력 포인트</label>
              <textarea
                {...register('charm')}
                placeholder="자기소개를 적어주세요! (10~50자)"
                className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition resize-none"
              />
              {errors.charm && <p className="text-red-500 text-xs mt-1">{errors.charm.message}</p>}
            </div>

            {/* Ideal Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">이상형</label>
              <textarea
                {...register('idealType')}
                placeholder="예: 대화가 잘 통하고 다정한 강아지상 (10~50자)"
                className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition resize-none"
              />
              {errors.idealType && <p className="text-red-500 text-xs mt-1">{errors.idealType.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isRegistering}
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-lg shadow-brand-500/30"
          >
            {isSubmitting || isRegistering ? '등록 중...' : '쪽지 등록 완료'}
          </button>
        </form>
        </>
      )}
    </div>
  );
}
