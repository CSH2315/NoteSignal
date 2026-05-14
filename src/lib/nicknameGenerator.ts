// 한국어 형용사 + 명사 + 숫자 조합 닉네임 자동 생성 유틸리티
// 최대 10자 제한에 맞게 어휘 길이 설계: 형용사(2-3자) + 명사(2-3자) + 숫자(2자) = 최대 8자

const ADJECTIVES = [
  '반짝', '설레', '따뜻', '다정', '활발',
  '신비', '당당', '엉뚱', '유쾌', '솔직',
  '든든', '풋풋', '낭만', '상큼', '발랄',
  '순수', '씩씩', '포근', '명랑', '차분',
  '맑은', '빛나', '온화', '섬세', '거침',
];

const NOUNS = [
  '별빛', '햇살', '달빛', '하늘', '봄날',
  '바람', '물결', '구름', '꽃잎', '노을',
  '새벽', '우주', '은하', '초원', '숲속',
  '향기', '나비', '새싹', '파도', '이슬',
  '선물', '인연', '기억', '설탕', '보름',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 형용사 + 명사 + 두 자리 난수 조합의 닉네임을 생성합니다.
 * 예: "설레별빛42", "따뜻하늘19"
 */
export function generateNickname(): string {
  const adj = pickRandom(ADJECTIVES);
  const noun = pickRandom(NOUNS);
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}${noun}${num}`;
}
