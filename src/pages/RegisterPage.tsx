import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TermsModal } from '@/components/register/TermsModal';
import { RecoveryCodeModal } from '@/components/register/RecoveryCodeModal';
import { useUserStore } from '@/store/useUserStore';

const registerSchema = z.object({
  nickname: z.string().min(1, '이름 또는 닉네임을 입력해주세요.').max(10, '최대 10자까지 가능합니다.'),
  gender: z.enum(['male', 'female'], { required_error: '성별을 선택해주세요.' }),
  age: z.number().min(20, '20세 이상만 가입 가능합니다.').max(29, '20대만 가입 가능합니다.'),
  isAgeVisible: z.boolean(),
  contactType: z.enum(['instagram', 'kakao']),
  contactId: z.string().min(1, '연락처 아이디를 입력해주세요.'),
  mbti: z.string().length(4, 'MBTI 4자리를 정확히 입력해주세요.'),
  idealType: z.string().min(10, '이상형을 10자 이상 자세히 적어주세요.').max(100, '최대 100자까지 가능합니다.'),
  charm: z.string().min(10, '자신의 매력을 10자 이상 어필해주세요.').max(100, '최대 100자까지 가능합니다.'),
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
  const setStoreUser = useUserStore(state => state.login);
  
  // Modals & States
  const [showTermsModal, setShowTermsModal] = useState(true);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

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
      gender: undefined,
      contactType: 'instagram',
    },
  });

  const gender = watch('gender');
  const contactType = watch('contactType');

  // Submit Handler
  const onSubmit = async (data: RegisterFormValues) => {
    // Simulate DB Save Call...
    await new Promise(res => setTimeout(res, 1000));

    // Generate random recovery code (e.g. A8X2-9M4Q)
    const randomBlock = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${randomBlock()}-${randomBlock()}`;
    
    setGeneratedCode(code);
    setShowRecoveryModal(true);
  };

  // After writing down the recovery code
  const handleRecoveryConfirm = () => {
    setShowRecoveryModal(false);
    // UUID internally mapped to recovery code for local caching
    setStoreUser(generatedCode, gender as 'male' | 'female');
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-4 pb-20 px-6">
      <TermsModal 
        isOpen={showTermsModal} 
        onAgree={() => setShowTermsModal(false)}
        onClose={() => navigate('/')}
      />

      <RecoveryCodeModal 
        isOpen={showRecoveryModal}
        code={generatedCode}
        onConfirm={handleRecoveryConfirm}
      />

      {/* Main Registration Form - Rendered but visually hidden/blocked if terms not agreed */}
      {!showTermsModal && (
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
              <label className="block text-sm font-bold text-gray-700 mb-1">이름 또는 닉네임</label>
              <input
                {...register('nickname')}
                placeholder="어떻게 부르면 될까요?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
              />
              {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname.message}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">성별</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setValue('gender', 'male')}
                  className={`flex-1 py-3 rounded-xl font-medium border transition ${gender === 'male' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'bg-white border-gray-200 text-gray-400'}`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setValue('gender', 'female')}
                  className={`flex-1 py-3 rounded-xl font-medium border transition ${gender === 'female' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'bg-white border-gray-200 text-gray-400'}`}
                >
                  여성
                </button>
              </div>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">나이 설정 (20대 통과)</label>
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
                placeholder="예: 웃는 모습이 예쁘고 배려심이 깊습니다. (최소 10자)"
                className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition resize-none"
              />
              {errors.charm && <p className="text-red-500 text-xs mt-1">{errors.charm.message}</p>}
            </div>

            {/* Ideal Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">이상형</label>
              <textarea
                {...register('idealType')}
                placeholder="예: 대화가 잘 통하고 다정한 강아지상 (최소 10자)"
                className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition resize-none"
              />
              {errors.idealType && <p className="text-red-500 text-xs mt-1">{errors.idealType.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-lg shadow-brand-500/30"
          >
            {isSubmitting ? '등록 중...' : '쪽지 등록 완료'}
          </button>
        </form>
      )}
    </div>
  );
}
