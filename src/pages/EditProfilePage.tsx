import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserStore } from '@/store/useUserStore';
import { ArrowLeft, CheckCircle2, AlertTriangle, Loader2, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { generateNickname } from '@/lib/nicknameGenerator';

const editProfileSchema = z.object({
  nickname: z.string().min(1, '닉네임을 입력해주세요.').max(10, '최대 10자까지 가능합니다.'),
  gender: z.enum(['male', 'female']).optional(), // 성별은 변경하지 않지만 폼에는 포함
  age: z.number().min(20, '20세 이상만 가입 가능합니다.').max(29, '20대만 가입 가능합니다.'),
  isAgeVisible: z.boolean(),
  contactType: z.enum(['instagram', 'kakao']),
  contactId: z.string().min(1, '연락처 아이디를 입력해주세요.'),
  mbti: z.string().length(4, 'MBTI 4자리를 정확히 입력해주세요.'),
  idealType: z.string().min(5, '이상형을 5자 이상 적어주세요.').max(50, '최대 50자까지 가능합니다.'),
  charm: z.string().min(5, '자신에 대해 5자 이상 적어주세요.').max(50, '최대 50자까지 가능합니다.'),
}).superRefine((data, ctx) => {
  if (data.contactType === 'instagram') {
    if (!/^[a-zA-Z0-9._]+$/.test(data.contactId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '유효한 인스타그램 아이디 형식이 아닙니다. (영문, 숫자, 마침표, 밑줄만 허용)',
        path: ['contactId']
      });
    }
  } else {
    if (!/^[a-zA-Z0-9-_]+$/.test(data.contactId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '유효한 카카오톡 아이디 형식이 아닙니다. (영문, 숫자, 하이픈, 밑줄만 허용)',
        path: ['contactId']
      });
    }
  }
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { uuid, gender } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
  });

  useEffect(() => {
    if (!uuid) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase.rpc('get_my_profile', {
          p_user_id: uuid
        });

        if (error) throw error;
        if (data && data.length > 0) {
          const profile = data[0];
          reset({
            nickname: profile.nickname,
            age: profile.age,
            isAgeVisible: profile.is_age_visible,
            contactType: profile.contact_type,
            contactId: profile.contact_id,
            mbti: profile.mbti,
            charm: profile.charm,
            idealType: profile.ideal_type,
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('프로필 정보를 불러오는데 실패했습니다.');
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [uuid, navigate, reset]);

  const contactType = watch('contactType');

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('수정을 취소할까요?\n변경 사항은 저장되지 않습니다.')) {
        navigate('/profile');
      }
    } else {
      navigate('/profile');
    }
  };

  const onSubmit = async (data: EditProfileFormValues) => {
    if (!uuid) return;

    try {
      const { data: result, error } = await supabase.rpc('update_my_profile', {
        p_user_id: uuid,
        p_nickname: data.nickname,
        p_age: data.age,
        p_is_age_visible: data.isAgeVisible,
        p_contact_type: data.contactType,
        p_contact_id: data.contactId,
        p_mbti: data.mbti,
        p_charm: data.charm,
        p_ideal_type: data.idealType
      });

      if (error) throw error;
      if (result && result.success === false) {
        throw new Error(result.reason || '수정 실패');
      }

      toast.success('프로필이 수정되었습니다.');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('프로필 수정 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">프로필 정보 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-4 pb-20 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="px-4 mb-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 py-2">
        <button 
          onClick={handleCancel}
          className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-gray-900 absolute left-[50%] -translate-x-[50%]">내 프로필 수정</span>
        <div className="w-11" /> {/* Layout balancer */}
      </div>

      <div className="px-6 relative">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-5">
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
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
              />
              {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname.message}</p>}
            </div>

            {/* Gender (Disabled) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">성별 <span className="text-gray-400 font-normal text-xs">(수정 불가)</span></label>
              <div className="flex gap-3">
                <div
                  className={`flex-1 py-3 px-4 rounded-xl font-medium border text-center ${gender === 'male' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                >
                  남성
                </div>
                <div
                  className={`flex-1 py-3 px-4 rounded-xl font-medium border text-center ${gender === 'female' ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                >
                  여성
                </div>
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">나이 설정</label>
              <select
                {...register('age', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
              >
                {Array.from({ length: 10 }, (_, i) => i + 20).map((age) => (
                  <option key={age} value={age}>{age}세</option>
                ))}
              </select>
              <label className="flex items-center gap-2 mt-3 cursor-pointer pl-1">
                <input type="checkbox" {...register('isAgeVisible')} className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500" />
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
                  onClick={() => { setValue('contactType', 'instagram', { shouldDirty: true }); }}
                  className={`flex-1 py-3 rounded-xl font-medium border transition text-sm ${contactType === 'instagram' ? 'bg-[#FAFAFA] border-pink-500 text-pink-600' : 'bg-white border-gray-200 text-gray-400'}`}
                >
                  Instagram
                </button>
                <button
                  type="button"
                  onClick={() => { setValue('contactType', 'kakao', { shouldDirty: true }); }}
                  className={`flex-1 py-3 rounded-xl font-medium border transition text-sm ${contactType === 'kakao' ? 'bg-[#FEE500] border-yellow-400 text-yellow-900' : 'bg-white border-gray-200 text-gray-400'}`}
                >
                  KakaoTalk
                </button>
              </div>
              <input
                {...register('contactId')}
                placeholder={contactType === 'instagram' ? '인스타그램 아이디 입력' : '카카오톡 아이디 입력'}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1.5 flex gap-1 items-start">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px text-gray-400"/>
                수정 시, 아직 내 기존 쪽지를 뽑지 않은 사람들에게만 반영됩니다.
              </p>
              {errors.contactId && <p className="text-red-500 text-xs mt-1">{errors.contactId.message}</p>}
            </div>

            {/* MBTI */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">MBTI</label>
              <select
                {...register('mbti')}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
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
              <label className="block text-sm font-bold text-gray-700 mb-1">내 특징</label>
              <textarea
                {...register('charm')}
                placeholder="예: 토끼상입니다 / 운동을 좋아해요 (5~50자)"
                className="w-full h-24 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition resize-none"
              />
              {errors.charm && <p className="text-red-500 text-xs mt-1">{errors.charm.message}</p>}
            </div>

            {/* Ideal Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">이상형</label>
              <textarea
                {...register('idealType')}
                placeholder="예: 대화가 잘 통하고 다정한 강아지상 (5~50자)"
                className="w-full h-24 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition resize-none"
              />
              {errors.idealType && <p className="text-red-500 text-xs mt-1">{errors.idealType.message}</p>}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 pb-safe z-20">
            <button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="w-full max-w-md mx-auto py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                '저장 중...'
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {isDirty ? '바뀐 내용 저장하기' : '수정된 내용이 없습니다'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
